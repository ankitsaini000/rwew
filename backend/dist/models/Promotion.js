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
const promotionSchema = new mongoose_1.Schema({
    brandId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Brand ID is required']
    },
    title: {
        type: String,
        required: [true, 'Promotion title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    budget: {
        type: String,
        required: [true, 'Budget is required'],
        trim: true
    },
    category: {
        type: [String],
        required: [true, 'At least one category is required'],
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Platform is required'],
        trim: true
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    promotionType: {
        type: String,
        required: [true, 'Promotion type is required'],
        trim: true
    },
    deliverables: [{
            type: String,
            trim: true
        }],
    tags: [{
            type: String,
            trim: true
        }],
    requirements: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'draft'
    },
    applications: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'PromotionApplication'
        }]
}, {
    timestamps: true
});
// Create indexes for better query performance
promotionSchema.index({ brandId: 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ category: 1 });
promotionSchema.index({ platform: 1 });
promotionSchema.index({ deadline: 1 });
promotionSchema.index({ tags: 1 });
const Promotion = mongoose_1.default.model('Promotion', promotionSchema);
exports.default = Promotion;
