"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const creatorVerificationRoutes_1 = __importDefault(require("./routes/creatorVerificationRoutes"));
const brandPreferenceRoutes_1 = __importDefault(require("./routes/brandPreferenceRoutes"));
const ollamaRoutes_1 = __importDefault(require("./routes/ollamaRoutes"));
const creatorBankAccountRoutes_1 = __importDefault(require("./routes/creatorBankAccountRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api', routes_1.default);
app.use('/api/creator-verification', creatorVerificationRoutes_1.default);
app.use('/api/brand-preferences', brandPreferenceRoutes_1.default);
app.use('/api/ollama', ollamaRoutes_1.default);
app.use('/api/creator-bank-accounts', creatorBankAccountRoutes_1.default);
exports.default = app;
