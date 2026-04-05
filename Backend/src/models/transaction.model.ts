import mongoose, { Document, Model } from "mongoose";

/**
 * Interface (Document type)
 */
export interface ITransaction extends Document {
  fromAccount: mongoose.Types.ObjectId;
  toAccount: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "failed" | "reversed";
  amount: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  description:string
}

/**
 * Schema
 */
const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "From account is required"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "To account is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least 0.01"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Model
 */
const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;