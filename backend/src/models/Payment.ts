import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate?: Date;
  paymentDetails?: {
    cardLast4?: string;
    cardBrand?: string;
    paypalEmail?: string;
    upiId?: string;
  };
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal', 'upi', 'bankTransfer', 'platform'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentDetails: {
      cardLast4: String,
      cardBrand: String,
      paypalEmail: String,
      upiId: String,
    },
    refundAmount: Number,
    refundReason: String,
  },
  {
    timestamps: true,
  }
);

// Create an index on transactionId for faster lookups
paymentSchema.index({ transactionId: 1 });

// Create a compound index on user and order
paymentSchema.index({ user: 1, order: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment; 