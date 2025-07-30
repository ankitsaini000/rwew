import mongoose from 'mongoose';
import Location from '../models/Location';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

async function seedLocations() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://influencer-market:1111111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing locations
    await Location.deleteMany({});
    console.log('Cleared existing locations');

    // Create location documents for all Indian states
    const locationDocuments = indianStates.map(state => ({
      country: 'India',
      state: state,
      isActive: true
    }));

    // Insert all locations with error handling
    try {
      const result = await Location.insertMany(locationDocuments, { ordered: false });
      console.log(`Successfully seeded ${result.length} locations`);
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('Some locations already exist, continuing...');
        // Try to insert them one by one to handle duplicates
        let insertedCount = 0;
        for (const doc of locationDocuments) {
          try {
            await Location.create(doc);
            insertedCount++;
          } catch (insertError: any) {
            if (insertError.code !== 11000) {
              console.error('Error inserting location:', doc.state, insertError.message);
            }
          }
        }
        console.log(`Inserted ${insertedCount} new locations`);
      } else {
        throw error;
      }
    }

    // Verify the seeding
    const count = await Location.countDocuments();
    console.log(`Total locations in database: ${count}`);

    // Display all seeded locations
    const allLocations = await Location.find({}).sort('state');
    console.log('\nSeeded locations:');
    allLocations.forEach(location => {
      console.log(`- ${location.state}`);
    });

    console.log('\nLocation seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding locations:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedLocations(); 