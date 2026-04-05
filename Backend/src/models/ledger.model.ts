import mongoose from "mongoose";


const LedgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account is required for ledger entry"],
      index: true,
      immutable: true,
    },
     amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least 0.01"],
      immutable: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: [true, "Transaction type is required"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Associated transaction is required"],
      index: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

function preventLedgerModification(this: any) {
  if (this && this.isNew) {
    return;
  }
  throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

LedgerSchema.pre("save", preventLedgerModification);
LedgerSchema.pre("updateOne", preventLedgerModification);
LedgerSchema.pre("deleteOne", preventLedgerModification);
LedgerSchema.pre("findOneAndUpdate", preventLedgerModification);
LedgerSchema.pre("findOneAndDelete", preventLedgerModification);
LedgerSchema.pre("deleteMany", preventLedgerModification);
LedgerSchema.pre("updateMany", preventLedgerModification);
LedgerSchema.pre("replaceOne", preventLedgerModification);
LedgerSchema.pre("findOneAndReplace", preventLedgerModification);
LedgerSchema.pre("findOneAndDelete", preventLedgerModification);
LedgerSchema.pre("findOneAndUpdate", preventLedgerModification);



 
const Ledger = mongoose.model("Ledger", LedgerSchema);

export default Ledger;