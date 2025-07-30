"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const targetAudienceAgeRangeSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    min: {
        type: Number,
        required: false
    },
    max: {
        type: Number,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
targetAudienceAgeRangeSchema.index({ code: 1, name: 1 }, { unique: true });
targetAudienceAgeRangeSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const TargetAudienceAgeRange = mongoose_1.default.model('TargetAudienceAgeRange', targetAudienceAgeRangeSchema);
exports.default = TargetAudienceAgeRange;
