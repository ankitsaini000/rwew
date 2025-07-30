"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CreatorMetricsSchema = new mongoose_1.Schema({
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
                type: mongoose_1.default.Schema.Types.ObjectId,
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
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Order'
            }
        }
    ],
    dashboardImpressions: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});
// Method to calculate influencer tier based on followers
CreatorMetricsSchema.methods.calculateInfluencerTier = function () {
    if (this.followers >= 1000000) {
        this.influencerTier = 'Diamond';
        this.tierProgress = 100;
    }
    else if (this.followers >= 500000) {
        this.influencerTier = 'Platinum';
        this.tierProgress = 80 + (this.followers - 500000) / 5000;
    }
    else if (this.followers >= 100000) {
        this.influencerTier = 'Gold';
        this.tierProgress = 60 + (this.followers - 100000) / 5000;
    }
    else if (this.followers >= 50000) {
        this.influencerTier = 'Silver';
        this.tierProgress = 40 + (this.followers - 50000) / 1250;
    }
    else {
        this.influencerTier = 'Bronze';
        this.tierProgress = Math.min(40, (this.followers / 50000) * 100);
    }
    // Ensure tierProgress is between 0-100
    this.tierProgress = Math.min(100, Math.max(0, this.tierProgress));
};
// Method to calculate service tier based on completed projects
CreatorMetricsSchema.methods.calculateServiceTier = function () {
    if (this.completedProjects >= 100 && this.responseRate >= 95) {
        this.serviceTier = 'VIP';
    }
    else if (this.completedProjects >= 50 && this.responseRate >= 90) {
        this.serviceTier = 'Elite';
    }
    else if (this.completedProjects >= 20 && this.responseRate >= 85) {
        this.serviceTier = 'Professional';
    }
    else {
        this.serviceTier = 'Standard';
    }
};
// Calculate tiers before saving
CreatorMetricsSchema.pre('save', function (next) {
    this.calculateInfluencerTier();
    this.calculateServiceTier();
    this.lastUpdated = new Date();
    next();
});
const CreatorMetrics = mongoose_1.default.model('CreatorMetrics', CreatorMetricsSchema);
exports.default = CreatorMetrics;
