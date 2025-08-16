"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const creatorVerificationRoutes_1 = __importDefault(require("./routes/creatorVerificationRoutes"));
const brandPreferenceRoutes_1 = __importDefault(require("./routes/brandPreferenceRoutes"));
const ollamaRoutes_1 = __importDefault(require("./routes/ollamaRoutes"));
const creatorBankAccountRoutes_1 = __importDefault(require("./routes/creatorBankAccountRoutes"));
const searchHistoryRoutes_1 = __importDefault(require("./routes/searchHistoryRoutes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
// Performance middleware
app.use((0, compression_1.default)()); // Compress responses
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://row-eight-weld.vercel.app'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing middleware with limits to prevent large payloads
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '10mb' }));
// Logging middleware - only use in development
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        skip: (req, res) => res.statusCode < 400 // Only log errors in production
    }));
}
// Serve static files with caching
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
}));
// Routes
app.use('/api', routes_1.default);
app.use('/api/creator-verification', creatorVerificationRoutes_1.default);
app.use('/api/brand-preferences', brandPreferenceRoutes_1.default);
app.use('/api/ollama', ollamaRoutes_1.default);
app.use('/api/creator-bank-accounts', creatorBankAccountRoutes_1.default);
app.use('/api/search-history', searchHistoryRoutes_1.default);
exports.default = app;
