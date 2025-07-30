import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotionApplication extends Document {
  _id: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  message: string;
  proposedRate: string;
  availability: string;
  deliverables: string;
  portfolio: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const promotionApplicationSchema = new Schema<IPromotionApplication>(
  {
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: 'Promotion',
      required: [true, 'Promotion ID is required']
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    message: {
      type: String,
      required: [true, 'Application message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    proposedRate: {
      type: String,
      required: [true, 'Proposed rate is required'],
      trim: true
    },
    availability: {
      type: String,
      required: [true, 'Availability information is required'],
      trim: true
    },
    deliverables: {
      type: String,
      trim: true
    },
    portfolio: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
promotionApplicationSchema.index({ promotionId: 1 });
promotionApplicationSchema.index({ creatorId: 1 });
promotionApplicationSchema.index({ status: 1 });

// Ensure a creator can only submit one application per promotion
promotionApplicationSchema.index({ promotionId: 1, creatorId: 1 }, { unique: true });

const PromotionApplication = mongoose.model<IPromotionApplication>('PromotionApplication', promotionApplicationSchema);
export default PromotionApplication; 