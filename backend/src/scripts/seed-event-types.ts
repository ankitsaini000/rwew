import mongoose from 'mongoose';
import EventType from '../models/EventType';
import dotenv from 'dotenv';

dotenv.config();

const eventTypes = [
  { name: "Brand Launches", code: "brand_launches" },
  { name: "Trade Shows", code: "trade_shows" },
  { name: "Private Events", code: "private_events" },
  { name: "Virtual Events", code: "virtual_events" },
  { name: "Meet & Greets", code: "meet_greets" },
  { name: "Workshops", code: "workshops" },
  { name: "Conferences", code: "conferences" },
  { name: "Panels", code: "panels" },
  { name: "Product Demonstrations", code: "product_demonstrations" },
];

async function seedEventTypes() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing event types
    await EventType.deleteMany({});
    console.log('Cleared existing event types');

    // Insert event types
    const result = await EventType.insertMany(eventTypes, { ordered: false });
    console.log(`Successfully seeded ${result.length} event types`);

    // Display all seeded event types
    const allEventTypes = await EventType.find({}).sort('name');
    console.log('\nSeeded event types:');
    allEventTypes.forEach(e => {
      console.log(`- ${e.name} (${e.code})`);
    });

    console.log('\nEvent type seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding event types:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedEventTypes(); 