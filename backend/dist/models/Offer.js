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
const OfferSchema = new mongoose_1.Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['brand_to_creator', 'creator_to_brand'],
        required: true
    },
    service: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: '₹'
    },
    deliveryTime: {
        type: Number,
        required: true,
        min: 1
    },
    revisions: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    deliverables: [{
            type: String
        }],
    terms: {
        type: String,
        default: ''
    },
    validUntil: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired', 'countered'],
        default: 'pending'
    },
    counterOffer: {
        price: Number,
        deliveryTime: Number,
        revisions: Number,
        terms: String,
        message: String
    }
}, {
    timestamps: true
});
// Index for efficient queries
OfferSchema.index({ conversationId: 1, createdAt: -1 });
OfferSchema.index({ senderId: 1, status: 1 });
OfferSchema.index({ recipientId: 1, status: 1 });
OfferSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired offers
const Offer = mongoose_1.default.model('Offer', OfferSchema);
exports.default = Offer;
