import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorBankAccount extends Document {
  creatorId: mongoose.Types.ObjectId; // Reference to the creator (User or CreatorProfile)
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscOrSwift: string;
  branch: string;
  accountType: string;
  documentUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorBankAccountSchema = new Schema<ICreatorBankAccount>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accountHolderName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscOrSwift: { type: String, required: true },
  branch: { type: String, required: true },
  accountType: { type: String, required: true },
  documentUrl: { type: String },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICreatorBankAccount>('CreatorBankAccount', CreatorBankAccountSchema); 