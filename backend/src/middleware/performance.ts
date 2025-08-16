import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Add response time header
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log performance metrics
    console.log(`Request: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Cache middleware for GET requests
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      const cacheKey = `cache:${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data: any) {
        // Cache the response
        redisClient.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
        
        // Call original send method
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Rate limiting middleware
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // First request or window expired
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (userRequests.count >= maxRequests) {
      // Rate limit exceeded
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    } else {
      // Increment request count
      userRequests.count++;
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - (userRequests?.count || 0));
    res.setHeader('X-RateLimit-Reset', userRequests?.resetTime || (now + windowMs));
    
    next();
  };
};

// Query optimization middleware
export const queryOptimizer = (req: Request, res: Response, next: NextFunction) => {
  // Add query optimization hints
  if (req.query.limit && Number(req.query.limit) > 100) {
    req.query.limit = '100'; // Cap limit at 100
  }
  
  if (req.query.page && Number(req.query.page) < 1) {
    req.query.page = '1'; // Ensure page is at least 1
  }
  
  // Add default sorting if not provided
  if (!req.query.sort && req.path.includes('/creators')) {
    req.query.sort = 'relevance';
  }
  
  next();
};

// Response compression middleware
export const responseOptimizer = (req: Request, res: Response, next: NextFunction) => {
  // Set cache headers for static content
  if (req.path.startsWith('/uploads/') || req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('ETag', `"${Date.now()}"`);
  }
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Database query monitoring
export const dbQueryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = process.hrtime.bigint() - start;
    const durationMs = Number(duration) / 1000000; // Convert to milliseconds
    
    // Log slow database operations
    if (durationMs > 500) {
      console.warn(`Slow DB operation: ${req.method} ${req.path} took ${durationMs.toFixed(2)}ms`);
    }
  });
  
  next();
};
