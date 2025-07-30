"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookCallback = exports.facebookLogin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tokenUtils_1 = require("../utils/tokenUtils");
const authIntent_1 = require("../middleware/authIntent");
// @desc    Facebook login handler
// @route   GET /api/auth/facebook, /api/auth/facebook/brand, /api/auth/facebook/creator
// @access  Public
exports.facebookLogin = (0, express_async_handler_1.default)(async (req, res) => {
    // Log auth intent for debugging
    const authIntent = (0, authIntent_1.getAuthIntent)(req);
    console.log(`Starting Facebook auth flow with intent: ${authIntent || 'generic'}`);
    const passport = req.app.get('passport');
    passport.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res);
});
// @desc    Facebook callback handler
// @route   GET /api/auth/facebook/callback
// @access  Public
exports.facebookCallback = (0, express_async_handler_1.default)(async (req, res) => {
    // User is already authenticated by passport at this point
    const user = req.user;
    if (!user) {
        console.error('Facebook callback received with no user');
        res.status(401);
        throw new Error('Facebook authentication failed');
    }
    console.log(`Facebook authentication successful for user: ${user._id}, current role: ${user.role}`);
    // Check if there's a registration intent (brand or creator)
    const authIntent = (0, authIntent_1.getAuthIntent)(req);
    console.log(`Auth intent from session: ${authIntent || 'none'}`);
    // Update user role based on registration intent if this is a new registration
    // or if the user is currently a client (default role)
    if (authIntent && (user.role === 'client' || user.isNew)) {
        const previousRole = user.role;
        user.role = authIntent;
        await user.save();
        console.log(`Updated user role from ${previousRole} to: ${authIntent}`);
    }
    // Clear the auth intent from session
    (0, authIntent_1.clearAuthIntent)(req);
    // Generate JWT token
    const token = (0, tokenUtils_1.generateToken)(user._id);
    console.log(`Generated JWT token for user: ${user._id}`);
    // Get the redirect URL based on the user's role
    let redirectPath = '/auth/facebook/success';
    if (user.role === 'brand') {
        redirectPath = '/brand/dashboard';
    }
    else if (user.role === 'creator') {
        redirectPath = '/creator/dashboard';
    }
    console.log(`Redirecting user to: ${redirectPath}`);
    // Set a cookie with the token for the frontend
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    // Add user info to the redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}${redirectPath}?token=${token}&userId=${user._id}&role=${user.role}`;
    // Redirect to the frontend with success
    res.redirect(redirectUrl);
});
