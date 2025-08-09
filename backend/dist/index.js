"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const error_1 = require("./middleware/error");
const http_1 = __importDefault(require("http"));
const sockets_1 = require("./sockets");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = require("./config/passport");
const routes_1 = __importDefault(require("./routes"));
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const creatorRoutes_1 = __importDefault(require("./routes/creatorRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const likeRoutes_1 = __importDefault(require("./routes/likeRoutes"));
const promotionRoutes_1 = __importDefault(require("./routes/promotionRoutes"));
const promotionApplicationRoutes_1 = __importDefault(require("./routes/promotionApplicationRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const creatorDashboardRoutes_1 = __importDefault(require("./routes/creatorDashboardRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const workSubmissionRoutes_1 = __importDefault(require("./routes/workSubmissionRoutes"));
const brandDashboardRoutes_1 = __importDefault(require("./routes/brandDashboardRoutes"));
const brandProfileRoutes_1 = __importDefault(require("./routes/brandProfileRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
// @ts-ignore - importing JS file
const authRoutes = require('./routes/authRoutes');
const socialMediaRoutes_1 = __importDefault(require("./routes/socialMediaRoutes"));
const customQuoteRequestRoutes_1 = __importDefault(require("./routes/customQuoteRequestRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const brandVerificationRoutes_1 = __importDefault(require("./routes/brandVerificationRoutes"));
const creatorVerificationRoutes_1 = __importDefault(require("./routes/creatorVerificationRoutes"));
const brandPreferenceRoutes_1 = __importDefault(require("./routes/brandPreferenceRoutes"));
const marketingCampaignTypeRoutes_1 = __importDefault(require("./routes/marketingCampaignTypeRoutes"));
const ollamaRoutes_1 = __importDefault(require("./routes/ollamaRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const languageRoutes_1 = __importDefault(require("./routes/languageRoutes"));
const targetAudienceGenderRoutes_1 = __importDefault(require("./routes/targetAudienceGenderRoutes"));
const targetAudienceAgeRangeRoutes_1 = __importDefault(require("./routes/targetAudienceAgeRangeRoutes"));
const socialMediaPreferenceRoutes_1 = __importDefault(require("./routes/socialMediaPreferenceRoutes"));
const creatorBankAccountRoutes_1 = __importDefault(require("./routes/creatorBankAccountRoutes"));
const searchHistoryRoutes_1 = __importDefault(require("./routes/searchHistoryRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
(0, database_1.connectDB)();
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
// Create HTTP server from Express app
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO before setting up routes
console.log('Initializing Socket.IO...');
const io = (0, sockets_1.initializeSocketIO)(server);
exports.io = io;
// Make io available globally
app.set('io', io);
// Middleware
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
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
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Session configuration for passport
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
// Set up passport
const passport = (0, passport_1.configurePassport)();
app.use(passport.initialize());
app.use(passport.session());
app.set('passport', passport);
// Logging in development mode
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
// Make uploads folder static
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Create uploads directory if it doesn't exist
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
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
app.use('/api/users', userRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/creators', creatorRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/conversations', conversationRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/likes', likeRoutes_1.default);
app.use('/api/promotions', promotionRoutes_1.default);
app.use('/api/promotion-applications', promotionApplicationRoutes_1.default);
app.use('/api/auth', authRoutes);
app.use('/api/work-submissions', workSubmissionRoutes_1.default);
app.use('/api/brands', brandDashboardRoutes_1.default);
app.use('/api/brand-profiles', brandProfileRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/custom-quotes', customQuoteRequestRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/brand-verification', brandVerificationRoutes_1.default);
app.use('/api/creator-verification', creatorVerificationRoutes_1.default);
app.use('/api/brand-preferences', brandPreferenceRoutes_1.default);
app.use('/api/marketing-campaign-types', marketingCampaignTypeRoutes_1.default);
app.use('/api/ollama', ollamaRoutes_1.default);
app.use('/api/locations', locationRoutes_1.default);
app.use('/api/languages', languageRoutes_1.default);
app.use('/api/target-audience-genders', targetAudienceGenderRoutes_1.default);
app.use('/api/target-audience-age-ranges', targetAudienceAgeRangeRoutes_1.default);
app.use('/api/social-media-preferences', socialMediaPreferenceRoutes_1.default);
app.use('/api/creator-bank-accounts', creatorBankAccountRoutes_1.default);
app.use('/api/search-history', searchHistoryRoutes_1.default);
// Add debug logging for the route path
console.log('Mounting creator-dashboard routes at: /api/creator-dashboard');
app.use('/api/creator-dashboard', creatorDashboardRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
// Social media routes for Facebook/Instagram integration
app.use('/api/social-media', socialMediaRoutes_1.default);
// Log all registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
    }
    else if (r.name === 'router' && r.handle.stack) {
        r.handle.stack.forEach((nestedRoute) => {
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
app.use('/api', routes_1.default);
// Error handling middleware
app.use(error_1.notFound);
app.use(error_1.errorHandler);
// Initialize social media update service
const socialMediaUpdateService_1 = __importDefault(require("./services/socialMediaUpdateService"));
// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.IO initialized and listening for connections');
    // Start the social media auto-update service
    const updateService = socialMediaUpdateService_1.default.getInstance();
    updateService.startAutoUpdate();
    console.log('🚀 Social media auto-update service started');
});
