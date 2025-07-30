"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingCampaignType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const marketingCampaignTypeSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });
exports.MarketingCampaignType = mongoose_1.default.model('MarketingCampaignType', marketingCampaignTypeSchema);
