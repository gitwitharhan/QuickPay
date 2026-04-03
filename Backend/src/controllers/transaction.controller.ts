import Transaction, { ITransaction } from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import Account from "../models/account.model";
import mongoose from "mongoose";

/** 
 * the 10-step transaction flow
 */
export const createTransaction = async (req: any, res: any) => {
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
     
    /**
     * Create transaction with pending status
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    // @ts-ignore
    const newTransaction = await Transaction.create(
      {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending",
      },
      { session }
    ) as ITransaction;

    // @ts-ignore
    const debitLedgerEntry = await Ledger.create(
      {
        account: fromAccount,
        amount,
        type: "debit",
        transaction: newTransaction._id,
      },
      { session }
    );

    // @ts-ignore
    const creditLedgerEntry = await Ledger.create(
      {
        account: toAccount,
        amount,
        type: "credit",
        transaction: newTransaction._id,
      },
      { session }
    );

    await Transaction.findByIdAndUpdate(
      newTransaction._id,
      { status: "completed" },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Transaction completed successfully", transaction: newTransaction });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ message: "Server error while processing transaction" });
  }
};    