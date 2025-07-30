import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  reply?: {
    text: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
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
    required: true,
    maxlength: 1000
  },
  reply: {
    text: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ creatorId: 1 });
reviewSchema.index({ brandId: 1 });
reviewSchema.index({ orderId: 1 }, { unique: true });
reviewSchema.index({ creatorId: 1, brandId: 1 });

// Helper function to update creator's average rating
async function updateCreatorRating(creatorId: mongoose.Types.ObjectId) {
  try {
    const Review = mongoose.model<IReview>('Review');
    const reviews = await Review.find({ creatorId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const CreatorProfile = mongoose.model('CreatorProfile');
    await CreatorProfile.findByIdAndUpdate(creatorId, {
      'metrics.ratings.average': parseFloat(averageRating.toFixed(1)),
      'metrics.ratings.count': reviews.length
    });
  } catch (error) {
    console.error('Error updating creator rating:', error);
  }
}

reviewSchema.post('save', async function () {
  await updateCreatorRating(this.creatorId);
});
reviewSchema.post(['findOneAndUpdate'], async function (doc) {
  if (doc) {
    await updateCreatorRating(doc.creatorId);
  }
});
reviewSchema.post('deleteOne', async function () {
  // @ts-ignore
  if (this.creatorId) {
    // @ts-ignore
    await updateCreatorRating(this.creatorId);
  }
});

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review; 