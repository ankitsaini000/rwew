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
const brandProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Promotion',
        }],
    opportunities: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Create index for faster lookups
brandProfileSchema.index({ userId: 1 });
brandProfileSchema.index({ name: 'text', about: 'text' });
const BrandProfile = mongoose_1.default.model('BrandProfile', brandProfileSchema);
exports.default = BrandProfile;
