import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotionRevenue extends Document {
  creator: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  color: string;
  month: number;
  year: number;
}

const PromotionRevenueSchema = new Schema<IPromotionRevenue>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    type: {
      type: String,
      required: [true, 'Promotion type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      default: 0
    },
    color: {
      type: String,
      default: 'blue'
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Year is required']
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for creator, type, month, and year
PromotionRevenueSchema.index({ creator: 1, type: 1, month: 1, year: 1 }, { unique: true });

const PromotionRevenue = mongoose.model<IPromotionRevenue>('PromotionRevenue', PromotionRevenueSchema);

export default PromotionRevenue; 