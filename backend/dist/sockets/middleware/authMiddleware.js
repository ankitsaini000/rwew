"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/User"));
const socketAuth = async (socket, next) => {
    var _a;
    try {
        // Get token from handshake query or auth header
        const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        if (!decoded || !decoded.id) {
            return next(new Error('Authentication error: Invalid token'));
        }
        // Find user
        const user = await User_1.default.findById(decoded.id).select('-passwordHash');
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }
        // Create simplified user object for socket
        const socketUser = {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar || undefined,
            role: user.role
        };
        // Attach user to socket
        socket.user = socketUser;
        next();
    }
    catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};
exports.socketAuth = socketAuth;
