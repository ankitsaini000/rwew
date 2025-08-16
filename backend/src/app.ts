import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import routes from './routes';
import creatorVerificationRoutes from './routes/creatorVerificationRoutes';
import brandPreferenceRoutes from './routes/brandPreferenceRoutes';
import ollamaRoutes from './routes/ollamaRoutes';
import creatorBankAccountRoutes from './routes/creatorBankAccountRoutes';
import searchHistoryRoutes from './routes/searchHistoryRoutes';
import performanceRoutes from './routes/performanceRoutes';
import { 
  performanceMonitor, 
  cacheMiddleware, 
  rateLimiter, 
  queryOptimizer, 
  responseOptimizer,
  dbQueryMonitor 
} from './middleware/performance';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Performance middleware
app.use(compression({ 
  level: 6, // Optimal compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Performance monitoring
app.use(performanceMonitor);
app.use(dbQueryMonitor);

// Rate limiting (100 requests per minute)
app.use(rateLimiter(100, 60000));

// Query optimization
app.use(queryOptimizer);

// Response optimization
app.use(responseOptimizer);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://row-eight-weld.vercel.app',
    'https://rwew.onrender.com'
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range", "X-Response-Time", "X-Cache", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
}));

// Body parsing middleware with limits to prevent large payloads
app.use(express.json({ 
  limit: '10mb',
  strict: true // Strict JSON parsing
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10mb',
  parameterLimit: 100 // Limit number of parameters
}));

// Logging middleware - only use in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Only log errors in production
  }));
}

// Serve static files with aggressive caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d', // Cache static files for 7 days
  etag: true,
  lastModified: true,
  immutable: true, // Files won't change
  setHeaders: (res, path) => {
    // Set specific cache headers for different file types
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days for images
    } else if (path.endsWith('.mp4') || path.endsWith('.mov')) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days for videos
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes with caching for GET requests
app.use('/api', cacheMiddleware(300), routes); // Cache API responses for 5 minutes
app.use('/api/creator-verification', cacheMiddleware(180), creatorVerificationRoutes); // Cache for 3 minutes
app.use('/api/brand-preferences', cacheMiddleware(600), brandPreferenceRoutes); // Cache for 10 minutes
app.use('/api/ollama', ollamaRoutes); // No caching for AI responses
app.use('/api/creator-bank-accounts', cacheMiddleware(180), creatorBankAccountRoutes); // Cache for 3 minutes
app.use('/api/search-history', cacheMiddleware(120), searchHistoryRoutes); // Cache for 2 minutes
app.use('/api/performance', performanceRoutes); // Performance monitoring routes

export default app;