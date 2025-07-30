import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandExperienceReview extends Document {
  orderId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandExperienceReviewSchema = new Schema<IBrandExperienceReview>({
  orderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Order',
    unique: true // One review per order
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  brandId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

brandExperienceReviewSchema.index({ brandId: 1 });
brandExperienceReviewSchema.index({ orderId: 1 }, { unique: true });
brandExperienceReviewSchema.index({ creatorId: 1, brandId: 1 });

const BrandExperienceReview = mongoose.model<IBrandExperienceReview>('BrandExperienceReview', brandExperienceReviewSchema);
export default BrandExperienceReview; 