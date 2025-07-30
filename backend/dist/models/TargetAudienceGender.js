"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const targetAudienceGenderSchema = new mongoose_1.default.Schema({
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
targetAudienceGenderSchema.index({ code: 1, name: 1 }, { unique: true });
targetAudienceGenderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const TargetAudienceGender = mongoose_1.default.model('TargetAudienceGender', targetAudienceGenderSchema);
exports.default = TargetAudienceGender;
