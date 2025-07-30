import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandRecommendation extends Document {
  brand_id: mongoose.Types.ObjectId;
  recommended_creators: mongoose.Types.ObjectId[];
}

const brandRecommendationSchema = new Schema<IBrandRecommendation>({
  brand_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recommended_creators: [{ type: Schema.Types.ObjectId, ref: 'CreatorProfile' }],
});

const BrandRecommendation = mongoose.model<IBrandRecommendation>('BrandRecommendation', brandRecommendationSchema);

export default BrandRecommendation; 