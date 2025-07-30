"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasicInfo = exports.checkUserPermissions = exports.getUserProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const auth_1 = require("../utils/auth");
/**
 * Example controller showing best practices for handling authenticated users
 */
// Pattern 1: Using the utility function
exports.getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        // This will throw if user is not authenticated
        const userId = (0, auth_1.getAuthUserId)(req);
        // Safe to use userId after this point
        res.json({
            userId,
            userRole: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'unknown',
            isAdmin: (0, auth_1.hasRole)(req, 'admin')
        });
    }
    catch (error) {
        res.status(401);
        throw new Error('User not authenticated');
    }
});
// Pattern 2: Using null checks and optional chaining
exports.checkUserPermissions = (0, express_async_handler_1.default)(async (req, res) => {
    // Early return if user is not authenticated
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }
    // Safe to use req.user after this point
    const { _id, role } = req.user;
    res.json({
        userId: _id.toString(),
        userRole: role,
        canAccessAdminArea: role === 'admin',
        canAccessCreatorArea: (0, auth_1.hasAnyRole)(req, ['admin', 'creator'])
    });
});
// Pattern 3: Using optional chaining throughout
exports.getBasicInfo = (0, express_async_handler_1.default)(async (req, res) => {
    var _a, _b, _c;
    // Use optional chaining to safely access properties
    const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
    const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    if (!userId) {
        res.status(401);
        throw new Error('User not authenticated');
    }
    res.json({
        userId,
        userRole: userRole || 'unknown'
    });
});
