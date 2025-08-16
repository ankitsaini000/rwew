import mongoose from 'mongoose';

// Create a connection pool
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    // If we already have a connection, use it
    if (cachedConnection) {
      console.log('Using existing MongoDB connection');
      return;
    }

    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://influencer-market:1111111@cluster0.udo3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Connecting to MongoDB...', mongoURI.substring(0, mongoURI.indexOf('://') + 3) + '...');
    
    // Enhanced connection options for better performance
    await mongoose.connect(mongoURI, {
      // Connection pool settings
      maxPoolSize: 100, // Increased from 50
      minPoolSize: 20,  // Increased from 10
      maxIdleTimeMS: 60000, // Increased idle time to 1 minute
      
      // Timeout settings
      connectTimeoutMS: 15000, // Increased from 10 seconds
      socketTimeoutMS: 60000,  // Increased from 45 seconds
      serverSelectionTimeoutMS: 10000, // Increased from 5 seconds
      
      // Write concern and read preference
      writeConcern: { w: 'majority', j: true },
      readPreference: 'secondaryPreferred',
      
      // Buffer settings
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Auto-reconnect settings
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      
      // Keep alive settings
      keepAlive: true,
      keepAliveInitialDelay: 300000, // 5 minutes
    });
    
    cachedConnection = mongoose;
    
    console.log('MongoDB Connected Successfully');
    
    // Set up error handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cachedConnection = null; // Reset cached connection on disconnect
    });
    
    // Monitor connection pool
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Export connection status
export const getConnectionStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};