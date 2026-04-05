import Transaction, { ITransaction } from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import Account from "../models/account.model";
import mongoose from "mongoose";
import User from "../models/user.model";
import { sendEmail } from "../config/nodemailer";
/** 
 * the 10-step transaction flow
 */
export const createTransaction = async (req: any, res: any) => {
  let newTransaction = {} as ITransaction; // Declare here to be used outside the try block
  try {
    /**
     * Input validation and basic checks
     */
    const { fromAccount, toAccount, amount,idempotencyKey,description} = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }   

    const fromAcc = await Account.findById(fromAccount);
    const toAcc = await Account.findById(toAccount);

    if (!fromAcc || !toAcc) {
      return res.status(404).json({ message: "One or both accounts not found" });
    }

    if (fromAcc.status !== "active" || toAcc.status !== "active") {
      return res.status(400).json({ message: "Both accounts must be active" });
    }
    /**
     * Idempotency check - ensures that if the same request is made multiple times with the same idempotency key, only one transaction will be processed. This is crucial for preventing duplicate transactions in case of network issues or client retries.
     */
    const existingTransaction = await Transaction.findOne({ idempotencyKey });
    if(existingTransaction?.status === "completed"){
      return res.status(200).json({ message: "Transaction already completed", transaction: existingTransaction });
    }
    if (existingTransaction?.status === "pending") {
      return res.status(200).json({ message: "Transaction is in progress", transaction: existingTransaction });
    } 
    if(existingTransaction?.status === "failed"){
      return res.status(200).json({ message: "Previous transaction attempt failed, please try again", transaction: existingTransaction });
    } 
    if(existingTransaction?.status === "reversed"){
        return res.status(200).json({ message: "Previous transaction attempt was reversed, please try again", transaction: existingTransaction });  
    } 

    /**
     * derive senders balance from ledger entries 
     */
    const senderBalance = await fromAcc.getBalance();
    if (senderBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
     
   try { /**
     * Create transaction with pending status
     */
    const session = await mongoose.startSession();
    
    await session.withTransaction(async () => {
      // @ts-ignore
      const createdTransactions = await Transaction.create([
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "pending",
          description
        }],
        { session }  
      );
      newTransaction = createdTransactions[0] as ITransaction;

      // @ts-ignore
      const debitLedgerEntry = await Ledger.create([
        {
          account: fromAccount,
          amount,
          type: "debit",
          transaction: newTransaction._id,
        }],
        { session }
      );

      await (()=> new Promise(resolve => setTimeout(resolve, 1000)))(); // Simulate processing delay  

      // @ts-ignore
      const creditLedgerEntry = await Ledger.create([ 
        {
          account: toAccount,
          amount,
          type: "credit",
          transaction: newTransaction._id,
        }] ,
        { session }
      );

      newTransaction = await Transaction.findByIdAndUpdate(
        newTransaction._id,
        { status: "completed" },
        { session, new: true }
      ) as ITransaction;
    });
    try {
      const senderUser = await User.findById(fromAcc.user);
      const receiverUser = await User.findById(toAcc.user);
      const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

      if (receiverUser?.email) {
        await sendEmail({
          to: receiverUser.email,
          subject: "Amount Credited - QuickPay",
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 5px;">
                   <h2 style="color: #28a745;">Amount Credited!</h2>
                   <p>Hello ${receiverUser.name},</p>
                   <p>Your account has been credited with <strong>${amountStr}</strong>.</p>
                   <p><strong>Transaction ID:</strong> ${newTransaction._id}</p>
                   <p><strong>From Account:</strong> ${fromAccount}</p>
                   <p><strong>username:</strong> ${senderUser?.name || 'Sender'}</p>
                   <p><strong>Description:</strong> ${description}</p>
                   <br/>
                   <p>Thank you for using QuickPay.</p>
                 </div>`,
        });
      }

      if (senderUser?.email) {
        await sendEmail({
          to: senderUser.email,
          subject: "Amount Debited - QuickPay",
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 5px;">
                   <h2 style="color: #dc3545;">Amount Debited</h2>
                   <p>Hello ${senderUser.name},</p>
                   <p>Your account has been debited by <strong>${amountStr}</strong>.</p>
                   <p><strong>Transaction ID:</strong> ${newTransaction._id}</p>
                   <p><strong>To Account:</strong> ${toAccount}</p>
                   <br/>
                   <p>Thank you for using QuickPay.</p>
                 </div>`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send transaction notification emails:", emailError);
    }
    await session.endSession();
  } catch (error) {
    console.error("Error during transaction processing:", error);
    return res.status(500).json({ message: "transaction is pending pls try after sometime" });
  }
    res.status(201).json({ message: "Transaction completed successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ message: "Server error while processing transaction" });
  }
};    

/**
 * create initial transaction from system user to new users account
 */
export const createInitialTransaction = async (req: any, res: any) => {
  let newTransaction = {} as ITransaction;
  try {
    const { toAccount, amount,idempotencyKey,description} = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({ message: "Missing required fields" });
    }   

    const toAcc = await Account.findById(toAccount);

    if (!toAcc) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    if (toAcc.status !== "active") {  
      return res.status(400).json({ message: "Account must be active" });
    }
    // Find the system user first (systemUser flag works correctly with .select("+systemUser"))
    const systemUser = await User.findOne({ systemUser: true }).select("+systemUser");
    if (!systemUser) {
      return res.status(500).json({ message: "System user not found" });
    }
    // Then find their account by userId (avoids querying the select:false systemAccount field)
    const systemUserAccount = await Account.findOne({ user: systemUser._id });
    if(!systemUserAccount){
      return res.status(500).json({ message: "System user account not found" });
    }

    const session = await mongoose.startSession();
    
    await session.withTransaction(async () => {
      // @ts-ignore
      const createdTransactions = await Transaction.create([
        {
          fromAccount: systemUserAccount._id,
          toAccount,
          amount,
          idempotencyKey,
          status: "pending",
          description
        }],
        { session }
      );
      newTransaction = createdTransactions[0] as ITransaction;

      // @ts-ignore
      const debitLedgerEntry = await Ledger.create([
        {
          account: systemUserAccount._id,
          amount,
          type: "debit",
          transaction: newTransaction._id,
        }],
        { session }
      );

      // @ts-ignore
      const creditLedgerEntry = await Ledger.create([
        {
          account: toAccount,
          amount,
          type: "credit",
          transaction: newTransaction._id,
        }],
        { session }
      );

      newTransaction = await Transaction.findByIdAndUpdate(
        newTransaction._id,
        { status: "completed" },
        { session, new: true }
      ) as ITransaction;
    });

    await session.endSession();

    try {
      const recipientAccount = await Account.findById(toAccount);
      if (recipientAccount) {
        const receiverUser = await User.findById(recipientAccount.user);
        if (receiverUser?.email) {
          const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
          await sendEmail({
            to: receiverUser.email,
            subject: "Cash is Deposited on your Account",
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 5px;">
                     <h2 style="color: #28a745;">Cash is Deposited on your Account!</h2>
                     <p>Hello ${receiverUser.name},</p>
                     <p>Your account has been credited with an cash amount of <strong>${amountStr}</strong>.</p>
                     <p><strong>Transaction ID:</strong> ${newTransaction._id}</p>
                     <br/>
                     <p>Thank you for using QuickPay.</p>
                   </div>`,
          });
        }
      }
    } catch (emailError) {
      console.error("Failed to send email for initial transaction:", emailError);
    }

    res.status(201).json({ message: "Initial transaction completed successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error processing initial transaction:", error);
    res.status(500).json({ message: "Server error while processing initial transaction" });
  }
}; 

export const getAllTransactions = async (req: any, res: any) => {
  try {
    const userAccounts = await Account.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map(acc => acc._id);

    // Fetch transactions where the user's account is either the sender or the receiver
    const transactions = await Transaction.find({
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    })
    .populate({
      path: "fromAccount",
      populate: { path: "user", select: "name email systemUser" }
    })
    .populate({
      path: "toAccount",
      populate: { path: "user", select: "name email systemUser" }
    })
    .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error while fetching transactions" });
  }
};