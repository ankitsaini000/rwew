"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.creatorOnly = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
// Protect routes - verify token and set user in req.user
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // Check if auth header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (remove "Bearer ")
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            // Get user from the token
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            // Set user in request
            req.user = user;
            next();
        }
        catch (error) {
            console.error('Token verification failed:', error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
// Authorize roles middleware
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error('Not authorized to access this route');
        }
        next();
    };
};
exports.authorize = authorize;
// Creator only middleware
exports.creatorOnly = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'creator') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized, creator access only');
    }
});
// Admin only middleware
exports.adminOnly = (0, express_async_handler_1.default)(async (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized, admin access only');
    }
});
