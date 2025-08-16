import { createClient } from 'redis';

class RedisClient {
  private client: any;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://rwew.onrender.com:6379',
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Redis max retries reached');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Don't throw error, continue without Redis
      }
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.client.flushDb();
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }

  // Cache helper methods
  async getCached<T>(key: string, fallback: () => Promise<T>, ttl: number = 3600): Promise<T> {
    try {
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      const data = await fallback();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Cache getCached error:', error);
      // Fallback to direct data fetch
      return await fallback();
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) return;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

export default redisClient;
