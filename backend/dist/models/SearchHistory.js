"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const searchHistorySchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    brandId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    query: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    searchType: {
        type: String,
        enum: ['text', 'category', 'tag', 'contentType'],
        default: 'text',
        required: true
    },
    filters: {
        category: String,
        tags: [String],
        contentTypes: [String],
        platform: String,
        priceMin: Number,
        priceMax: Number,
        followersMin: Number,
        followersMax: Number
    },
    resultsCount: {
        type: Number,
        default: 0
    },
    clickedCreators: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'CreatorProfile'
        }],
    sessionId: String,
    userAgent: String,
    ipAddress: String
}, {
    timestamps: true
});
// Indexes for better query performance
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ brandId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1, searchType: 1 });
searchHistorySchema.index({ createdAt: -1 });
// Compound index for analytics
searchHistorySchema.index({ userId: 1, searchType: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('SearchHistory', searchHistorySchema);
