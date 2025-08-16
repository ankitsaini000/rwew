import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandRecommendation extends Document {
  brand_id: mongoose.Types.ObjectId;
  recommended_creators: mongoose.Types.ObjectId[];
  last_updated?: Date;
}

const brandRecommendationSchema = new Schema<IBrandRecommendation>({
  brand_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recommended_creators: [{ type: Schema.Types.ObjectId, ref: 'CreatorProfile' }],
  last_updated: { type: Date, default: Date.now },
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for better query performance
brandRecommendationSchema.index({ brand_id: 1 }, { unique: true });
brandRecommendationSchema.index({ last_updated: -1 });
brandRecommendationSchema.index({ 'recommended_creators': 1 });

const BrandRecommendation = mongoose.model<IBrandRecommendation>('BrandRecommendation', brandRecommendationSchema);

export default BrandRecommendation;