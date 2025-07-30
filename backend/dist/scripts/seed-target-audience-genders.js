"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TargetAudienceGender_1 = __importDefault(require("../models/TargetAudienceGender"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genders = [
    { name: 'All', code: 'all' },
    { name: 'Male', code: 'male' },
    { name: 'Female', code: 'female' },
    { name: 'Other', code: 'other' },
    { name: 'Kids', code: 'kids' },
];
async function seedTargetAudienceGenders() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clear existing genders
        await TargetAudienceGender_1.default.deleteMany({});
        console.log('Cleared existing target audience genders');
        // Insert genders
        const result = await TargetAudienceGender_1.default.insertMany(genders, { ordered: false });
        console.log(`Successfully seeded ${result.length} target audience genders`);
        // Display all seeded genders
        const allGenders = await TargetAudienceGender_1.default.find({}).sort('name');
        console.log('\nSeeded target audience genders:');
        allGenders.forEach(g => {
            console.log(`- ${g.name} (${g.code})`);
        });
        console.log('\nTarget audience gender seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding target audience genders:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
seedTargetAudienceGenders();
