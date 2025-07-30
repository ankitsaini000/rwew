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
const promotionApplicationSchema = new mongoose_1.Schema({
    promotionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: [true, 'Promotion ID is required']
    },
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    message: {
        type: String,
        required: [true, 'Application message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    proposedRate: {
        type: String,
        required: [true, 'Proposed rate is required'],
        trim: true
    },
    availability: {
        type: String,
        required: [true, 'Availability information is required'],
        trim: true
    },
    deliverables: {
        type: String,
        trim: true
    },
    portfolio: [{
            type: String,
            trim: true
        }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
promotionApplicationSchema.index({ promotionId: 1 });
promotionApplicationSchema.index({ creatorId: 1 });
promotionApplicationSchema.index({ status: 1 });
// Ensure a creator can only submit one application per promotion
promotionApplicationSchema.index({ promotionId: 1, creatorId: 1 }, { unique: true });
const PromotionApplication = mongoose_1.default.model('PromotionApplication', promotionApplicationSchema);
exports.default = PromotionApplication;
