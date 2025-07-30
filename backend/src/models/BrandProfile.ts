import mongoose, { Document, Schema } from 'mongoose';

export interface IBrandProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  username: string;
  profileImage: string;
  coverImage: string;
  about: string;
  website: string;
  isVerified: boolean;
  establishedYear: number;
  location: {
    state: string;
    country: string;
  };
  industry: string;
  brandValues: string[];
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    contactPerson: string;
  };
  campaigns: mongoose.Types.ObjectId[];
  opportunities: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'pending';
  metrics: {
    profileViews: number;
    totalCampaigns: number;
    totalCreators: number;
    averageRating: number;
    followersCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  openToNetworking: boolean;
  openToAdvising: boolean;
  marketingInterests: string[];
}

const brandProfileSchema = new Schema<IBrandProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/1200x300',
    },
    about: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    establishedYear: {
      type: Number,
      required: false,
    },
    location: {
      state: String,
      country: String,
    },
    industry: {
      type: String,
      required: false,
    },
    brandValues: {
      type: [String],
      default: [],
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
    },
    contactInfo: {
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      contactPerson: {
        type: String,
        required: false,
      },
    },
    campaigns: [{
      type: Schema.Types.ObjectId,
      ref: 'Promotion',
    }],
    opportunities: [{
      type: Schema.Types.ObjectId,
      ref: 'Opportunity',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    metrics: {
      profileViews: {
        type: Number,
        default: 0,
      },
      totalCampaigns: {
        type: Number,
        default: 0,
      },
      totalCreators: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster lookups
brandProfileSchema.index({ userId: 1 });
brandProfileSchema.index({ name: 'text', about: 'text' });

const BrandProfile = mongoose.model<IBrandProfile>('BrandProfile', brandProfileSchema);

export default BrandProfile; 