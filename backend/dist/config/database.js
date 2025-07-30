"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb+srv://influencer-market:1111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        console.log('Connecting to MongoDB...', mongoURI.substring(0, mongoURI.indexOf('://') + 3) + '...');
        const options = {
            retryWrites: true,
            w: 'majority',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB Connected Successfully');
        // Log connected collections
        if (mongoose_1.default.connection.db) {
            const collections = await mongoose_1.default.connection.db.collections();
            console.log('Available collections:', collections.map(c => c.collectionName).join(', '));
        }
        // Set up error handlers
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
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
