import mongoose from 'mongoose';
import EventPricingRange from '../models/EventPricingRange';
import dotenv from 'dotenv';

dotenv.config();

const eventPricingRanges = [
  { name: 'Below ₹5,000', code: 'below_5000', min: 0, max: 4999 },
  { name: '₹5,000 - ₹10,000', code: '5000_10000', min: 5000, max: 10000 },
  { name: '₹10,000 - ₹25,000', code: '10000_25000', min: 10000, max: 25000 },
  { name: '₹25,000 - ₹50,000', code: '25000_50000', min: 25000, max: 50000 },
  { name: '₹50,000 - ₹1,00,000', code: '50000_100000', min: 50000, max: 100000 },
  { name: '₹1,00,000 - ₹5,00,000', code: '100000_500000', min: 100000, max: 500000 },
  { name: 'Above ₹5,00,000', code: 'above_500000', min: 500001, max: null },
];

async function seedEventPricingRanges() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing event pricing ranges
    await EventPricingRange.deleteMany({});
    console.log('Cleared existing event pricing ranges');

    // Insert event pricing ranges
    const result = await EventPricingRange.insertMany(eventPricingRanges, { ordered: false });
    console.log(`Successfully seeded ${result.length} event pricing ranges`);

    // Display all seeded event pricing ranges
    const allRanges = await EventPricingRange.find({}).sort('min');
    console.log('\nSeeded event pricing ranges:');
    allRanges.forEach(e => {
      console.log(`- ${e.name} (${e.code})`);
    });

    console.log('\nEvent pricing range seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding event pricing ranges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedEventPricingRanges(); 