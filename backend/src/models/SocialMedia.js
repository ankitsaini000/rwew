"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var SocialMediaAccountSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    platform: {
        type: String,
        enum: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'other'],
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: false,
    },
    followerCount: {
        type: Number,
        default: 0,
    },
    platformId: {
        type: String,
        required: false,
    },
    accessToken: {
        type: String,
        required: false,
    },
    tokenExpiry: {
        type: Date,
        required: false,
    },
    refreshToken: {
        type: String,
        required: false,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    connected: {
        type: Boolean,
        default: false,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Index to quickly find accounts by user and platform
SocialMediaAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });
exports.default = mongoose_1.default.model('SocialMediaAccount', SocialMediaAccountSchema);
