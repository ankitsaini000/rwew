import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { notFound, errorHandler } from './middleware/error';
import http from 'http';
import { initializeSocketIO } from './sockets';
import session from 'express-session';
import { configurePassport } from './config/passport';
import routes from './routes';

// Routes
import userRoutes from './routes/userRoutes';
import creatorRoutes from './routes/creatorRoutes';
import messageRoutes from './routes/messageRoutes';
import conversationRoutes from './routes/conversationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import likeRoutes from './routes/likeRoutes';
import promotionRoutes from './routes/promotionRoutes';
import promotionApplicationRoutes from './routes/promotionApplicationRoutes';
import orderRoutes from './routes/orderRoutes';
import creatorDashboardRoutes from './routes/creatorDashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import workSubmissionRoutes from './routes/workSubmissionRoutes';
import brandDashboardRoutes from './routes/brandDashboardRoutes';
import brandProfileRoutes from './routes/brandProfileRoutes';
import profileRoutes from './routes/profileRoutes';
// @ts-ignore - importing JS file
const authRoutes = require('./routes/authRoutes');
import socialMediaRoutes from './routes/socialMediaRoutes';
import customQuoteRequestRoutes from './routes/customQuoteRequestRoutes';
import notificationRoutes from './routes/notificationRoutes';
import brandVerificationRoutes from './routes/brandVerificationRoutes';
import creatorVerificationRoutes from './routes/creatorVerificationRoutes';
import brandPreferenceRoutes from './routes/brandPreferenceRoutes';
import marketingCampaignTypeRoutes from './routes/marketingCampaignTypeRoutes';
import ollamaRoutes from './routes/ollamaRoutes';
import locationRoutes from './routes/locationRoutes';
import languageRoutes from './routes/languageRoutes';
import targetAudienceGenderRoutes from './routes/targetAudienceGenderRoutes';
import targetAudienceAgeRangeRoutes from './routes/targetAudienceAgeRangeRoutes';
import socialMediaPreferenceRoutes from './routes/socialMediaPreferenceRoutes';
import creatorBankAccountRoutes from './routes/creatorBankAccountRoutes';
import searchHistoryRoutes from './routes/searchHistoryRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO before setting up routes
console.log('Initializing Socket.IO...');
const io = initializeSocketIO(server);

// Make io available globally
app.set('io', io);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (["http://localhost:3000", "http://localhost:3001"].includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"]
}));

// Configure helmet to allow images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Set up passport
const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());
app.set('passport', passport);

// Logging in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Influencer Marketplace API' });
});

// Add a test route directly in the main file
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Add a test message route directly in the main file  
app.post('/api/direct-message-test', (req, res) => {
  const { receiverId, content } = req.body;
  res.json({
    success: true,
    message: 'Direct message test successful',
    receivedData: { receiverId, content },
    timestamp: new Date().toISOString()
  });
});

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/promotion-applications', promotionApplicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/work-submissions', workSubmissionRoutes);
app.use('/api/brands', brandDashboardRoutes);
app.use('/api/brand-profiles', brandProfileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/custom-quotes', customQuoteRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/brand-verification', brandVerificationRoutes);
app.use('/api/creator-verification', creatorVerificationRoutes);
app.use('/api/brand-preferences', brandPreferenceRoutes);
app.use('/api/marketing-campaign-types', marketingCampaignTypeRoutes);
app.use('/api/ollama', ollamaRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/target-audience-genders', targetAudienceGenderRoutes);
app.use('/api/target-audience-age-ranges', targetAudienceAgeRangeRoutes);
app.use('/api/social-media-preferences', socialMediaPreferenceRoutes);
app.use('/api/creator-bank-accounts', creatorBankAccountRoutes);
app.use('/api/search-history', searchHistoryRoutes);

// Add debug logging for the route path
console.log('Mounting creator-dashboard routes at: /api/creator-dashboard');
app.use('/api/creator-dashboard', creatorDashboardRoutes);

app.use('/api/payments', paymentRoutes);

// Social media routes for Facebook/Instagram integration
app.use('/api/social-media', socialMediaRoutes);

// Log all registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
  } else if (r.name === 'router' && r.handle.stack) {
    r.handle.stack.forEach((nestedRoute: any) => {
      if (nestedRoute.route) {
        const path = r.regexp.toString().includes('/api/messages') 
          ? '/api/messages' + nestedRoute.route.path 
          : r.regexp.toString().includes('/api/conversations')
            ? '/api/conversations' + nestedRoute.route.path
            : '';
            
        if (path.includes('/api/messages') || path.includes('/api/conversations')) {
          console.log(`${Object.keys(nestedRoute.route.methods).join(',')} ${path}`);
        }
      }
    });
  }
});

// Add routes to the app
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize social media update service
import SocialMediaUpdateService from './services/socialMediaUpdateService';

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO initialized and listening for connections');
  
  // Start the social media auto-update service
  const updateService = SocialMediaUpdateService.getInstance();
  updateService.startAutoUpdate();
  console.log('🚀 Social media auto-update service started');
});

export { app, server, io };