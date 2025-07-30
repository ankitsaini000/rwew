import mongoose from 'mongoose';
import Language from '../models/Language';
import dotenv from 'dotenv';

dotenv.config();

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
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing languages
    await Language.deleteMany({});
    console.log('Cleared existing languages');

    // Insert languages
    const result = await Language.insertMany(languages, { ordered: false });
    console.log(`Successfully seeded ${result.length} languages`);

    // Display all seeded languages
    const allLanguages = await Language.find({}).sort('name');
    console.log('\nSeeded languages:');
    allLanguages.forEach(lang => {
      console.log(`- ${lang.name} (${lang.code}): Levels = ${lang.levels.join(', ')}`);
    });

    console.log('\nLanguage seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding languages:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedLanguages(); 