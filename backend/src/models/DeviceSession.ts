import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceSession extends Document {
  userId: mongoose.Types.ObjectId;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  lastActive: Date;
  sessionToken: string;
}

const DeviceSessionSchema = new Schema<IDeviceSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String },
  lastActive: { type: Date, required: true },
  sessionToken: { type: String, required: true },
});

// Create indexes for better query performance
DeviceSessionSchema.index({ userId: 1 });
DeviceSessionSchema.index({ sessionToken: 1 }, { unique: true });
DeviceSessionSchema.index({ lastActive: -1 });

export default mongoose.model<IDeviceSession>('DeviceSession', DeviceSessionSchema);