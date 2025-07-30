"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MarketingCampaignType_1 = require("../models/MarketingCampaignType");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://influencer-market:1111111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const marketingCampaignTypes = [
    'Influencer Marketing',
    'Content Creation',
    'Product Review',
    'Event Collaboration',
    'Brand Awareness',
    'Affiliate Marketing',
    'Giveaway Campaign',
    'User-Generated Content (UGC)',
    'Social Media Takeover',
    'Discount Code Promotion',
    'Unboxing / First Impressions',
    'Tutorial / How-To Video',
    'Live Streaming Promotion',
    'Brand Ambassador Program',
    'Paid Sponsorship',
    'Shoutout / Tag Campaign',
    'Story/Post Promotion',
    'Collab Video / Co-Creation',
    'Website/Link Redirection (CTA Focused)',
    'Event Coverage / IRL Reporting',
];
async function seed() {
    await mongoose_1.default.connect(MONGODB_URI);
    await MarketingCampaignType_1.MarketingCampaignType.deleteMany({});
    for (const name of marketingCampaignTypes) {
        await MarketingCampaignType_1.MarketingCampaignType.create({ name });
    }
    console.log('Seeded marketing campaign types!');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
