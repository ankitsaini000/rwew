import mongoose from 'mongoose';
import ContentType from '../models/ContentType';
import dotenv from 'dotenv';

dotenv.config();

const contentTypes = [
  { name: 'Image', code: 'image' },
  { name: 'Video', code: 'video' },
  { name: 'Text', code: 'text' },
  { name: 'Audio', code: 'audio' },
  { name: 'Live', code: 'live' },
  { name: 'Story', code: 'story' },
  { name: 'Reel', code: 'reel' },
  { name: 'Blog', code: 'blog' },
  { name: 'Podcast', code: 'podcast' },
  { name: 'Other', code: 'other' },
];

async function seedContentTypes() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing content types
    await ContentType.deleteMany({});
    console.log('Cleared existing content types');

    // Insert content types
    const result = await ContentType.insertMany(contentTypes, { ordered: false });
    console.log(`Successfully seeded ${result.length} content types`);

    // Display all seeded content types
    const allContentTypes = await ContentType.find({}).sort('name');
    console.log('\nSeeded content types:');
    allContentTypes.forEach(c => {
      console.log(`- ${c.name} (${c.code})`);
    });

    console.log('\nContent type seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding content types:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedContentTypes(); 