"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Language_1 = __importDefault(require("../models/Language"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const languages = [
    { name: 'Hindi', code: 'hi', levels: ['basic', 'conversational', 'fluent', 'native'] },
    { name: 'English', code: 'en', levels: ['basic', 'conversational', 'fluent', 'native'] },
];
async function seedLanguages() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clear existing languages
        await Language_1.default.deleteMany({});
        console.log('Cleared existing languages');
        // Insert languages
        const result = await Language_1.default.insertMany(languages, { ordered: false });
        console.log(`Successfully seeded ${result.length} languages`);
        // Display all seeded languages
        const allLanguages = await Language_1.default.find({}).sort('name');
        console.log('\nSeeded languages:');
        allLanguages.forEach(lang => {
            console.log(`- ${lang.name} (${lang.code}): Levels = ${lang.levels.join(', ')}`);
        });
        console.log('\nLanguage seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding languages:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
seedLanguages();
