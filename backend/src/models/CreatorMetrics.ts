import mongoose, { Document, Schema } from 'mongoose';

export interface ICreatorMetrics extends Document {
  creator: mongoose.Types.ObjectId;
  followers: number;
  totalEarnings: number;
  completedProjects: number;
  responseRate: number;
  tierProgress: number;
  influencerTier: string;
  serviceTier: string;
  revenueByMonth: {
    month: number;
    year: number;
    amount: number;
  }[];
  performanceData: {
    views: number[];
    likes: number[];
    messages: number[];
    earnings: number[];
    dates: string[];
  };
  profileMetrics?: {
    profileViews?: number;
    profileCompleteness?: number;
    averageResponseTime?: number;
    repeatClientRate?: number;
    ratings?: {
      average?: number;
      count?: number;
      distribution?: {
        '5'?: number;
        '4'?: number;
        '3'?: number;
        '2'?: number;
        '1'?: number;
      };
    };
    projectsCompleted?: number;
  };
  profileSocialMedia?: any;
  lastUpdated: Date;
  calculateInfluencerTier: () => void;
  calculateServiceTier: () => void;
  revenueByPromotion: { type: string; amount: number; transactions: number }[];
  reviews?: {
    brandId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    orderId: mongoose.Types.ObjectId;
  }[];
  dashboardImpressions?: number;
}

const CreatorMetricsSchema = new Schema<ICreatorMetrics>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      unique: true
    },
    followers: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 100
    },
    tierProgress: {
      type: Number,
      default: 0
    },
    influencerTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    },
    serviceTier: {
      type: String,
      enum: ['Standard', 'Professional', 'Elite', 'VIP'],
      default: 'Standard'
    },
    revenueByMonth: [
      {
        month: {
          type: Number,
          required: true
        },
        year: {
          type: Number,
          required: true
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],
    performanceData: {
      views: [Number],
      likes: [Number],
      messages: [Number],
      earnings: [Number],
      dates: [String]
    },
    profileMetrics: {
      type: Object, // Store profile metrics as a nested object
    },
    profileSocialMedia: {
      type: Object, // Store the entire socialMedia object
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    revenueByPromotion: [
      {
        type: {
          type: String,
        },
        amount: {
          type: Number,
        },
        transactions: {
          type: Number,
        },
      },
    ],
    reviews: [
      {
        brandId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Brand'
        },
        rating: {
          type: Number,
          required: true
        },
        comment: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order'
        }
      }
    ],
    dashboardImpressions: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true
  }
);

// Method to calculate influencer tier based on followers
CreatorMetricsSchema.methods.calculateInfluencerTier = function() {
  if (this.followers >= 1000000) {
    this.influencerTier = 'Diamond';
    this.tierProgress = 100;
  } else if (this.followers >= 500000) {
    this.influencerTier = 'Platinum';
    this.tierProgress = 80 + (this.followers - 500000) / 5000;
  } else if (this.followers >= 100000) {
    this.influencerTier = 'Gold';
    this.tierProgress = 60 + (this.followers - 100000) / 5000;
  } else if (this.followers >= 50000) {
    this.influencerTier = 'Silver';
    this.tierProgress = 40 + (this.followers - 50000) / 1250;
  } else {
    this.influencerTier = 'Bronze';
    this.tierProgress = Math.min(40, (this.followers / 50000) * 100);
  }
  
  // Ensure tierProgress is between 0-100
  this.tierProgress = Math.min(100, Math.max(0, this.tierProgress));
};

// Method to calculate service tier based on completed projects
CreatorMetricsSchema.methods.calculateServiceTier = function() {
  if (this.completedProjects >= 100 && this.responseRate >= 95) {
    this.serviceTier = 'VIP';
  } else if (this.completedProjects >= 50 && this.responseRate >= 90) {
    this.serviceTier = 'Elite';
  } else if (this.completedProjects >= 20 && this.responseRate >= 85) {
    this.serviceTier = 'Professional';
  } else {
    this.serviceTier = 'Standard';
  }
};

// Calculate tiers before saving
CreatorMetricsSchema.pre('save', function(next) {
  this.calculateInfluencerTier();
  this.calculateServiceTier();
  this.lastUpdated = new Date();
  next();
});

const CreatorMetrics = mongoose.model<ICreatorMetrics>('CreatorMetrics', CreatorMetricsSchema);

export default CreatorMetrics; 