import mongoose, { Document, Schema } from "mongoose";

export interface IAccountRequest extends Document {
  user: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  createdAccount?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const accountRequestSchema = new Schema<IAccountRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewNote: {
      type: String,
    },
    createdAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAccountRequest>("AccountRequest", accountRequestSchema);
