import mongoose from 'mongoose';
import TargetAudienceAgeRange from '../models/TargetAudienceAgeRange';
import dotenv from 'dotenv';

dotenv.config();

const ageRanges = [
  { name: 'All', code: 'all', min: undefined, max: undefined },
  { name: '0-12', code: '0-12', min: 0, max: 12 },
  { name: '13-17', code: '13-17', min: 13, max: 17 },
  { name: '18-24', code: '18-24', min: 18, max: 24 },
  { name: '25-34', code: '25-34', min: 25, max: 34 },
  { name: '35-44', code: '35-44', min: 35, max: 44 },
  { name: '45-54', code: '45-54', min: 45, max: 54 },
  { name: '55-64', code: '55-64', min: 55, max: 64 },
  { name: '65+', code: '65+', min: 65, max: undefined },
];

async function seedTargetAudienceAgeRanges() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing age ranges
    await TargetAudienceAgeRange.deleteMany({});
    console.log('Cleared existing target audience age ranges');

    // Insert age ranges
    const result = await TargetAudienceAgeRange.insertMany(ageRanges, { ordered: false });
    console.log(`Successfully seeded ${result.length} target audience age ranges`);

    // Display all seeded age ranges
    const allAgeRanges = await TargetAudienceAgeRange.find({}).sort('min');
    console.log('\nSeeded target audience age ranges:');
    allAgeRanges.forEach(a => {
      console.log(`- ${a.name} (${a.code})`);
    });

    console.log('\nTarget audience age range seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding target audience age ranges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedTargetAudienceAgeRanges(); 