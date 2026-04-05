import Transaction, { ITransaction } from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import Account from "../models/account.model";
import mongoose from "mongoose";
import User from "../models/user.model";

/** 
 * the 10-step transaction flow
 */
export const createTransaction = async (req: any, res: any) => {
  let newTransaction = {} as ITransaction; // Declare here to be used outside the try block
  try {
    /**
     * Input validation and basic checks
     */
    const { fromAccount, toAccount, amount,idempotencyKey} = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
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

      await (()=> new Promise(resolve => setTimeout(resolve, 1000*10)))(); // Simulate processing delay  

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
    const { toAccount, amount,idempotencyKey} = req.body;

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
    // @ts-ignore
    const systemUserAccount = await Account.findOne({ systemAccount: true }).select("+systemAccount");
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

    res.status(201).json({ message: "Initial transaction completed successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error processing initial transaction:", error);
    res.status(500).json({ message: "Server error while processing initial transaction" });
  }
}; 