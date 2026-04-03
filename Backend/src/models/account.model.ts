import mongoose, { Document, Model } from "mongoose";
import Transaction from "./transaction.model";
import Ledger from "./ledger.model";
/**
 * Interface (Document type)
 */
export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "suspended";
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  getBalance(): Promise<number>;
}

/**
 * Schema
 */
const accountSchema = new mongoose.Schema<IAccount>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound unique index (1 user = 1 account per status)
 */
accountSchema.index({ user: 1, status: 1 }, { unique: true });


accountSchema.methods.getBalance = async function (): Promise<number> {
    const balanceResult = await Ledger.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebits: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0]
                    }
                },
                totalCredits: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredits", "$totalDebits"] }
            }
        }
    ]);

    if (balanceResult.length === 0) {
        return 0;
    }
    
    return balanceResult[0].balance;
};
        
    

/**
 * Model
 */
const Account: Model<IAccount> = mongoose.model<IAccount>(
  "Account",
  accountSchema
);

export default Account; 