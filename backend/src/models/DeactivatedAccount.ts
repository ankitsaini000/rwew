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

// Create indexes for better query performance
DeactivatedAccountSchema.index({ userId: 1 }, { unique: true });
DeactivatedAccountSchema.index({ email: 1 });
DeactivatedAccountSchema.index({ deactivatedAt: -1 });

export default mongoose.model<IDeactivatedAccount>('DeactivatedAccount', DeactivatedAccountSchema);