"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const languageSchema = new mongoose_1.default.Schema({
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
    levels: {
        type: [String],
        enum: ['basic', 'conversational', 'fluent', 'native'],
        required: true
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
languageSchema.index({ code: 1, name: 1 }, { unique: true });
languageSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Language = mongoose_1.default.model('Language', languageSchema);
exports.default = Language;
