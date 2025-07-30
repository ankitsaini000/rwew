"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Location_1 = __importDefault(require("../models/Location"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
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
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clear existing locations
        await Location_1.default.deleteMany({});
        console.log('Cleared existing locations');
        // Create location documents for all Indian states
        const locationDocuments = indianStates.map(state => ({
            country: 'India',
            state: state,
            isActive: true
        }));
        // Insert all locations with error handling
        try {
            const result = await Location_1.default.insertMany(locationDocuments, { ordered: false });
            console.log(`Successfully seeded ${result.length} locations`);
        }
        catch (error) {
            if (error.code === 11000) {
                console.log('Some locations already exist, continuing...');
                // Try to insert them one by one to handle duplicates
                let insertedCount = 0;
                for (const doc of locationDocuments) {
                    try {
                        await Location_1.default.create(doc);
                        insertedCount++;
                    }
                    catch (insertError) {
                        if (insertError.code !== 11000) {
                            console.error('Error inserting location:', doc.state, insertError.message);
                        }
                    }
                }
                console.log(`Inserted ${insertedCount} new locations`);
            }
            else {
                throw error;
            }
        }
        // Verify the seeding
        const count = await Location_1.default.countDocuments();
        console.log(`Total locations in database: ${count}`);
        // Display all seeded locations
        const allLocations = await Location_1.default.find({}).sort('state');
        console.log('\nSeeded locations:');
        allLocations.forEach(location => {
            console.log(`- ${location.state}`);
        });
        console.log('\nLocation seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding locations:', error);
    }
    finally {
        // Close the database connection
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
// Run the seeding function
seedLocations();
