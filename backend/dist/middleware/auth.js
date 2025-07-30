"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.authorize = exports.protect = exports.verifyToken = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Middleware to check if user is authenticated via JWT or session
const isAuthenticated = async (req, res, next) => {
    var _a;
    try {
        // First try JWT token from Authorization header
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (token) {
            const user = await (0, exports.verifyToken)(token);
            if (user) {
                req.user = user;
                return next();
            }
        }
        // Try JWT token from query parameter (for browser redirects)
        const queryToken = req.query.token;
        if (queryToken) {
            const user = await (0, exports.verifyToken)(queryToken);
            if (user) {
                req.user = user;
                return next();
            }
        }
        // Fallback to session authentication
        if (req.session && req.session.userId) {
            // Try to find user by session ID
            const user = await User_1.default.findById(req.session.userId).select('-password');
            if (user) {
                req.user = user;
                return next();
            }
        }
        // If neither JWT nor session works, return error
        return res.status(401).json({ error: 'Not authenticated' });
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Not authenticated' });
    }
};
exports.isAuthenticated = isAuthenticated;
const verifyToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.default.findById(decoded.id).select('-password');
        return user;
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Protect routes (ensure user is authenticated)
const protect = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }
        const user = await (0, exports.verifyToken)(token);
        if (!user) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
// Authorize by role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('User not authenticated');
        }
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Role '${req.user.role}' is not authorized to access this route`);
        }
        next();
    };
};
exports.authorize = authorize;
// Admin middleware
const admin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};
exports.admin = admin;
