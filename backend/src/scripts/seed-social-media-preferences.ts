import mongoose from 'mongoose';
import SocialMediaPreference from '../models/SocialMediaPreference';
import dotenv from 'dotenv';

dotenv.config();

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
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing preferences
    await SocialMediaPreference.deleteMany({});
    console.log('Cleared existing social media preferences');

    // Insert preferences
    const result = await SocialMediaPreference.insertMany(preferences, { ordered: false });
    console.log(`Successfully seeded ${result.length} social media preferences`);

    // Display all seeded preferences
    const allPreferences = await SocialMediaPreference.find({}).sort('name');
    console.log('\nSeeded social media preferences:');
    allPreferences.forEach(p => {
      console.log(`- ${p.name} (${p.code})`);
    });

    console.log('\nSocial media preference seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding social media preferences:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSocialMediaPreferences(); 