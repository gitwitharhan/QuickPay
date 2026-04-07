import { Request, Response } from "express";
import AccountRequest from "../models/accountRequest.model";
import Account from "../models/account.model";
import User from "../models/user.model";
import Transaction from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import mongoose from "mongoose";
import { sendEmail } from "../config/nodemailer";

/**
 * Create a new account request
 */
export const createRequest = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // Check if user already has a pending request
    const pendingRequest = await AccountRequest.findOne({ user: userId, status: "pending" });
    if (pendingRequest) {
      return res.status(400).json({ message: "You already have a pending account request." });
    }

    const newRequest = new AccountRequest({
      user: userId,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Account request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Error creating account request:", error);
    res.status(500).json({ message: "Server error while submitting request" });
  }
};

/**
 * Get all requests for the authenticated user
 */
export const getMyRequests = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const requests = await AccountRequest.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ message: "Server error while fetching requests" });
  }
};

/**
 * Get all requests (System User only)
 */
export const getAllRequests = async (req: any, res: Response) => {
  try {
    const isSystemUser = req.user.email?.toLowerCase() === process.env.SYSTEM_EMAIL?.toLowerCase() || req.user.systemUser;
    if (!isSystemUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    const requests = await AccountRequest.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ message: "Server error while fetching all requests" });
  }
};

/**
 * Review an account request (Approve/Reject)
 */
export const reviewRequest = async (req: any, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const { action, reviewNote, initialAmount } = req.body;
    const { requestId } = req.params;

    const isSystemUser = req.user.email?.toLowerCase() === process.env.SYSTEM_EMAIL?.toLowerCase() || req.user.systemUser;
    if (!isSystemUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    const request = await AccountRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request has already been reviewed" });
    }

    if (action === "reject") {
      request.status = "rejected";
      request.reviewNote = reviewNote;
      await request.save();
      await session.endSession();
      return res.status(200).json({ message: "Request rejected", request });
    }

    if (action === "approve") {
      let createdAccount;
      
      await session.withTransaction(async () => {
        // 1. Create the account
        const newAccount = new Account({
          user: request.user,
          status: "active",
          currency: "INR",
        });
        await newAccount.save({ session });
        createdAccount = newAccount;

        // 2. Trigger initial transaction if amount > 0
        if (initialAmount && initialAmount > 0) {
          const systemUser = await User.findOne({ systemUser: true }).select("+systemUser");
          if (!systemUser) throw new Error("System user not found");

          const systemUserAccount = await Account.findOne({ user: systemUser._id }).session(session);
          if (!systemUserAccount) throw new Error("System user account not found");

          const idempotencyKey = `init-${newAccount._id}-${Date.now()}`;
          
          const createdTransactions = await Transaction.create([
            {
              fromAccount: systemUserAccount._id,
              toAccount: newAccount._id,
              amount: initialAmount,
              idempotencyKey,
              status: "pending",
              description: reviewNote || "Initial account funding"
            }],
            { session, ordered: true }
          );
          const newTransaction = createdTransactions[0];
          if (!newTransaction) throw new Error("Failed to create initial transaction");

          await Ledger.create([
            {
              account: systemUserAccount._id,
              amount: initialAmount,
              type: "debit",
              transaction: newTransaction._id,
            },
            {
              account: newAccount._id,
              amount: initialAmount,
              type: "credit",
              transaction: newTransaction._id,
            }],
            { session, ordered: true }
          );

          await Transaction.findByIdAndUpdate(
            newTransaction._id,
            { status: "completed" },
            { session }
          );
        }

        request.status = "approved";
        request.reviewNote = reviewNote;
        request.createdAccount = newAccount._id;
        await request.save({ session });
      });

      await session.endSession();

      // Optional: Send email
      try {
          const user = await User.findById(request.user);
          if (user?.email) {
              await sendEmail({
                  to: user.email,
                  subject: "Account Request Update - QuickPay",
                  html: `<h3>Your account request has been approved!</h3>
                         <p><strong>Reviewer Note:</strong> ${reviewNote || 'N/A'}</p>
                         <p><strong>Initial Deposit:</strong> ₹${initialAmount || 0}</p>
                         <p>Thank you for choosing QuickPay.</p>`
              });
          }
      } catch (e) {
          console.error("Email send failed", e);
      }

      return res.status(200).json({ message: "Request approved and account created", request });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    await session.endSession();
    console.error("Error reviewing request:", error);
    res.status(500).json({ message: "Server error during review", error: error instanceof Error ? error.message : String(error) });
  }
};
