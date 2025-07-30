import mongoose from 'mongoose';
import TargetAudienceGender from '../models/TargetAudienceGender';
import dotenv from 'dotenv';

dotenv.config();

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
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing genders
    await TargetAudienceGender.deleteMany({});
    console.log('Cleared existing target audience genders');

    // Insert genders
    const result = await TargetAudienceGender.insertMany(genders, { ordered: false });
    console.log(`Successfully seeded ${result.length} target audience genders`);

    // Display all seeded genders
    const allGenders = await TargetAudienceGender.find({}).sort('name');
    console.log('\nSeeded target audience genders:');
    allGenders.forEach(g => {
      console.log(`- ${g.name} (${g.code})`);
    });

    console.log('\nTarget audience gender seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding target audience genders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedTargetAudienceGenders(); 