"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Create a connection pool
let cachedConnection = null;
const connectDB = async () => {
    try {
        // If we already have a connection, use it
        if (cachedConnection) {
            console.log('Using existing MongoDB connection');
            return;
        }
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://influencer-market:1111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        console.log('Connecting to MongoDB...', mongoURI.substring(0, mongoURI.indexOf('://') + 3) + '...');
        // Connect with optimized options
        await mongoose_1.default.connect(mongoURI, {
            // These options are type-safe for mongoose
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 50, // Increase connection pool size
            minPoolSize: 10, // Minimum connections to maintain
            maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
            serverSelectionTimeoutMS: 5000 // Timeout for server selection
        });
        cachedConnection = mongoose_1.default;
        console.log('MongoDB Connected Successfully');
        // Set up error handlers
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
            cachedConnection = null; // Reset cached connection on disconnect
        });
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
