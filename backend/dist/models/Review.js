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
const reviewSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Order',
        unique: true // One review per order
    },
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    brandId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
async function updateCreatorRating(creatorId) {
    try {
        const Review = mongoose_1.default.model('Review');
        const reviews = await Review.find({ creatorId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const CreatorProfile = mongoose_1.default.model('CreatorProfile');
        await CreatorProfile.findByIdAndUpdate(creatorId, {
            'metrics.ratings.average': parseFloat(averageRating.toFixed(1)),
            'metrics.ratings.count': reviews.length
        });
    }
    catch (error) {
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
const Review = mongoose_1.default.model('Review', reviewSchema);
exports.default = Review;
