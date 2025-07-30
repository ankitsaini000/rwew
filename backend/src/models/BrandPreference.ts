import mongoose, { Document, Schema } from 'mongoose';

export interface IBrandPreference extends Document {
  brandId: mongoose.Types.ObjectId;
  category: string;
  marketingCampaignType?: string;
  brandValues: string[];
  marketingInterests: string[];
  campaignRequirements: string;
  physicalAppearanceRequirement: string;
  ageTargeting: string;
  genderTargeting: string;
  socialMediaPreferences: string[];
  budget: number;
  // New fields for advanced matching
  subcategories?: string[];
  requiredExpertise?: string[];
  contentTypes?: string[];
  eventTypes?: string[];
  eventTravelWillingness?: boolean;
  preferredLocations?: string[];
  minYearsExperience?: number;
  requiredAudienceGender?: string;
  requiredAudienceAgeRange?: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandPreferenceSchema = new Schema<IBrandPreference>({
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  marketingCampaignType: {
    type: String,
    required: false
  },
  brandValues: {
    type: [String],
    default: []
  },
  marketingInterests: {
    type: [String],
    default: []
  },
  campaignRequirements: {
    type: String,
    required: false
  },
  physicalAppearanceRequirement: {
    type: String,
    required: false
  },
  ageTargeting: {
    type: String,
    required: false
  },
  genderTargeting: {
    type: String,
    required: false
  },
  socialMediaPreferences: {
    type: [String],
    default: []
  },
  budget: {
    type: Number,
    required: false
  },
  // New fields for advanced matching
  subcategories: {
    type: [String],
    default: []
  },
  requiredExpertise: {
    type: [String],
    default: []
  },
  contentTypes: {
    type: [String],
    default: []
  },
  eventTypes: {
    type: [String],
    default: []
  },
  eventTravelWillingness: {
    type: Boolean,
    default: false
  },
  preferredLocations: {
    type: [String],
    default: []
  },
  minYearsExperience: {
    type: Number,
    default: 0
  },
  requiredAudienceGender: {
    type: String,
    required: false
  },
  requiredAudienceAgeRange: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

brandPreferenceSchema.index({ brandId: 1 });

const BrandPreference = mongoose.model<IBrandPreference>('BrandPreference', brandPreferenceSchema);

export default BrandPreference; 