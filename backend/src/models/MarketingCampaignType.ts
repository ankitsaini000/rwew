import mongoose from 'mongoose';

const marketingCampaignTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });

export const MarketingCampaignType = mongoose.model('MarketingCampaignType', marketingCampaignTypeSchema); 