import mongoose, { Schema, Document } from 'mongoose';

export interface IDeactivatedAccount extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  username?: string;
  fullName: string;
  reason?: string;
  deactivatedAt: Date;
}

const DeactivatedAccountSchema = new Schema<IDeactivatedAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  username: { type: String },
  fullName: { type: String, required: true },
  reason: { type: String },
  deactivatedAt: { type: Date, required: true },
});

export default mongoose.model<IDeactivatedAccount>('DeactivatedAccount', DeactivatedAccountSchema); 