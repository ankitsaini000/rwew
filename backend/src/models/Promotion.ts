import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  _id: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId; // Reference to the brand user
  title: string;
  description: string;
  budget: string;
  category: string[];
  platform: string;
  deadline: Date;
  promotionType: string;
  deliverables: string[];
  tags: string[];
  requirements: string;
  status: 'active' | 'closed' | 'draft';
  applications: mongoose.Types.ObjectId[]; // References to promotion applications
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Brand ID is required']
    },
    title: {
      type: String,
      required: [true, 'Promotion title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    budget: {
      type: String,
      required: [true, 'Budget is required'],
      trim: true
    },
    category: {
      type: [String],
      required: [true, 'At least one category is required'],
      trim: true
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    promotionType: {
      type: String,
      required: [true, 'Promotion type is required'],
      trim: true
    },
    deliverables: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    requirements: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'draft'
    },
    applications: [{
      type: Schema.Types.ObjectId,
      ref: 'PromotionApplication'
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
promotionSchema.index({ brandId: 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ category: 1 });
promotionSchema.index({ platform: 1 });
promotionSchema.index({ deadline: 1 });
promotionSchema.index({ tags: 1 });

const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
export default Promotion; 