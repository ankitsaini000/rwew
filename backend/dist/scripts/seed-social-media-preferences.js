"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SocialMediaPreference_1 = __importDefault(require("../models/SocialMediaPreference"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const preferences = [
    { name: 'Instagram', code: 'instagram' },
    { name: 'YouTube', code: 'youtube' },
    { name: 'Facebook', code: 'facebook' },
    { name: 'Twitter', code: 'twitter' },
    { name: 'LinkedIn', code: 'linkedin' },
    { name: 'TikTok', code: 'tiktok' },
    { name: 'Other', code: 'other' },
];
async function seedSocialMediaPreferences() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clear existing preferences
        await SocialMediaPreference_1.default.deleteMany({});
        console.log('Cleared existing social media preferences');
        // Insert preferences
        const result = await SocialMediaPreference_1.default.insertMany(preferences, { ordered: false });
        console.log(`Successfully seeded ${result.length} social media preferences`);
        // Display all seeded preferences
        const allPreferences = await SocialMediaPreference_1.default.find({}).sort('name');
        console.log('\nSeeded social media preferences:');
        allPreferences.forEach(p => {
            console.log(`- ${p.name} (${p.code})`);
        });
        console.log('\nSocial media preference seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding social media preferences:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
seedSocialMediaPreferences();
