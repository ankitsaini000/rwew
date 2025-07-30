import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://influencer-market:1111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Connecting to MongoDB...', mongoURI.substring(0, mongoURI.indexOf('://') + 3) + '...');
    
    const options = {
      retryWrites: true,
      w: 'majority',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB Connected Successfully');
    
    // Log connected collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      console.log('Available collections:', collections.map(c => c.collectionName).join(', '));
    }
    
    // Set up error handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}; 