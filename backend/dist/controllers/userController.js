"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveUsersCount = exports.getUsersList = exports.deleteUserDevice = exports.getUserDevices = exports.deactivateUserAccount = exports.confirmPhoneVerification = exports.sendPhoneVerification = exports.getUserById = exports.syncProfileImage = exports.getCurrentUser = exports.checkUsernameAvailability = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const tokenUtils_1 = require("../utils/tokenUtils");
const twilio_1 = require("../utils/twilio");
const DeactivatedAccount_1 = __importDefault(require("../models/DeactivatedAccount"));
const DeviceSession_1 = __importDefault(require("../models/DeviceSession"));
const UAParser = require('ua-parser-js');
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Register request received with body:', req.body);
    const { email, password, fullName, username, role } = req.body;
    if (!email || !password || !fullName) {
        console.log('Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName });
        res.status(400);
        throw new Error('Please provide all required fields: email, password, fullName');
    }
    // Check if user already exists
    const userExists = await User_1.default.findOne({ email });
    if (userExists) {
        console.log('User already exists with email:', email);
        res.status(400);
        throw new Error('User already exists');
    }
    // Check if username is taken if provided
    if (username) {
        const usernameExists = await User_1.default.findOne({ username });
        if (usernameExists) {
            console.log('Username already taken:', username);
            res.status(400);
            throw new Error('Username already taken');
        }
    }
    try {
        // Create new user
        console.log('Creating new user with data:', { email, fullName, username, role });
        const user = await User_1.default.create({
            email,
            password,
            fullName,
            username,
            // Ensure role is properly set according to what was provided
            role: ['creator', 'client', 'brand', 'admin'].includes(role) ? role : 'client',
        });
        // Automatically create BrandProfile if user is a brand
        if (user && user.role === 'brand') {
            const BrandProfile = require('../models/BrandProfile').default || require('../models/BrandProfile');
            // Only create if not already exists (shouldn't, but for safety)
            const existingProfile = await BrandProfile.findOne({ userId: user._id });
            if (!existingProfile) {
                await BrandProfile.create({
                    userId: user._id,
                    name: user.fullName || '',
                    username: user.username || '',
                    profileImage: '',
                    coverImage: '',
                    about: '',
                    website: '',
                    isVerified: false,
                    establishedYear: new Date().getFullYear(),
                    location: {
                        city: '',
                        state: '',
                        country: '',
                        address: '',
                        postalCode: ''
                    },
                    industry: '',
                    brandValues: [],
                    socialMedia: {},
                    contactInfo: {
                        email: user.email || '',
                        phone: '',
                        contactPerson: ''
                    },
                    campaigns: [],
                    opportunities: [],
                    status: 'active',
                    metrics: {
                        profileViews: 0,
                        totalCampaigns: 0,
                        totalCreators: 0,
                        averageRating: 0,
                        followersCount: 0
                    },
                    openToNetworking: false,
                    openToAdvising: false,
                    marketingInterests: []
                });
            }
        }
        if (user) {
            const token = (0, tokenUtils_1.generateToken)(user._id);
            console.log('User created successfully:', { userId: user._id, email: user.email, role: user.role });
            res.status(201).json({
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                avatar: user.avatar,
                token,
            });
        }
        else {
            console.log('Failed to create user - unknown error');
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
    catch (err) {
        console.error('Error creating user:', err);
        res.status(500);
        throw new Error('Server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
});
// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Login request headers:', req.headers);
    console.log('Login request received with body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('Missing required fields:', { email: !!email, password: !!password });
        res.status(400);
        throw new Error('Please provide email and password');
    }
    // Find user by email
    const user = await User_1.default.findOne({ email });
    console.log('User found:', user ? { userId: user._id, email: user.email } : 'No user found');
    // Check if user exists and password matches
    if (user && (await user.isValidPassword(password))) {
        if (user.isActive === false) {
            res.status(403).json({ message: 'Sorry, your account is deactivated.' });
            return;
        }
        const token = (0, tokenUtils_1.generateToken)(user._id);
        // Device session logic
        try {
            const userAgent = req.headers['user-agent'] || '';
            const parser = new UAParser(userAgent);
            const browser = parser.getBrowser().name || 'Unknown';
            const os = parser.getOS().name || 'Unknown';
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const sessionToken = token;
            const lastActive = new Date();
            const session = await DeviceSession_1.default.create({
                userId: user._id,
                browser,
                os,
                ip,
                lastActive,
                sessionToken,
            });
            console.log('DeviceSession created:', session);
        }
        catch (err) {
            console.error('Failed to create DeviceSession:', err);
        }
        console.log('Login successful for user:', { userId: user._id, email: user.email });
        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar,
            token,
        });
    }
    else {
        console.log('Invalid email or password for:', email);
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    // User is already attached to request by auth middleware
    const user = await User_1.default.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (user) {
        user.fullName = req.body.fullName || user.fullName;
        user.email = req.body.email || user.email;
        user.avatar = req.body.avatar || user.avatar;
        // Update username if provided
        if (req.body.username !== undefined) {
            user.username = req.body.username || user.username;
        }
        // Only update password if provided
        if (req.body.password) {
            if (!req.body.currentPassword) {
                res.status(400).json({ message: 'Current password is required.' });
                return;
            }
            // Check if current password matches BEFORE setting new password
            const isMatch = await user.isValidPassword(req.body.currentPassword);
            if (!isMatch) {
                res.status(400).json({ message: 'Current password is incorrect.' });
                return;
            }
            user.password = req.body.password; // Set new password only after check
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            username: updatedUser.username,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: (0, tokenUtils_1.generateToken)(updatedUser._id),
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Check if username is available
// @route   GET /api/users/check-username/:username
// @access  Public
exports.checkUsernameAvailability = (0, express_async_handler_1.default)(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        res.status(400);
        throw new Error('Username parameter is required');
    }
    // Check if username follows allowed pattern
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        res.status(200).json({
            available: false,
            message: 'Username can only contain letters, numbers, and underscores'
        });
        return;
    }
    // Check if username exists in database
    const existingUser = await User_1.default.findOne({ username });
    res.status(200).json({
        available: !existingUser,
        message: existingUser ? 'Username is already taken' : 'Username is available'
    });
});
/**
 * @desc    Get current user
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getCurrentUser = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500);
        throw new Error('Server error fetching current user');
    }
});
/**
 * @desc    Sync profile image from creator profile to user avatar
 * @route   POST /api/users/sync-profile-image
 * @access  Private
 */
exports.syncProfileImage = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        const userId = req.user._id;
        console.log(`Starting profile image sync for user ${userId}`);
        // Find the creator profile
        const creatorProfile = await CreatorProfile_1.CreatorProfile.findOne({ userId });
        if (!creatorProfile) {
            console.log(`No creator profile found for user ${userId}`);
            res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
            return;
        }
        // Get the profile image URL from creator profile
        const profileImageUrl = (_a = creatorProfile.personalInfo) === null || _a === void 0 ? void 0 : _a.profileImage;
        if (!profileImageUrl) {
            console.log(`No profile image URL found for user ${userId}`);
            res.status(404).json({
                success: false,
                message: 'Profile image not found in creator profile'
            });
            return;
        }
        console.log(`Found profile image URL: ${profileImageUrl}`);
        // Find and update the user
        const user = await User_1.default.findById(userId);
        if (!user) {
            console.log(`No user found with ID ${userId}`);
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        // Update the user's avatar
        user.avatar = profileImageUrl;
        const updatedUser = await user.save();
        console.log(`Successfully updated avatar for user ${userId} to ${profileImageUrl}`);
        res.status(200).json({
            success: true,
            message: 'Profile image synced successfully',
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                username: updatedUser.username,
                role: updatedUser.role,
                avatar: updatedUser.avatar
            }
        });
    }
    catch (error) {
        console.error('Error syncing profile image:', error);
        res.status(500).json({
            success: false,
            message: 'Server error syncing profile image',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// @desc    Get user by ID (public info)
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id).select('_id fullName username email avatar role profileImage');
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Send phone verification code
// @route   POST /api/users/verify-phone
// @access  Private
exports.sendPhoneVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    const { phone } = req.body;
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    if (!phone) {
        res.status(400).json({ message: 'Phone number is required' });
        return;
    }
    // Generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.phone = phone;
    user.phoneVerificationCode = code;
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.phoneVerified = false;
    await user.save();
    // Send SMS
    try {
        await (0, twilio_1.sendSMS)(phone, `Your verification code is: ${code}`);
        res.json({ message: 'Verification code sent!' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to send SMS', error: err instanceof Error ? err.message : err });
    }
});
// @desc    Confirm phone verification code
// @route   POST /api/users/verify-phone/confirm
// @access  Private
exports.confirmPhoneVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    const { code } = req.body;
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    if (!code) {
        res.status(400).json({ message: 'Verification code is required' });
        return;
    }
    if (user.phoneVerificationCode === code &&
        user.phoneVerificationExpires &&
        user.phoneVerificationExpires > new Date()) {
        user.phoneVerified = true;
        user.phoneVerificationCode = undefined;
        user.phoneVerificationExpires = undefined;
        await user.save();
        res.json({ message: 'Phone verified!' });
    }
    else {
        res.status(400).json({ message: 'Invalid or expired code' });
    }
});
// @desc    Deactivate user account
// @route   POST /api/users/deactivate
// @access  Private
exports.deactivateUserAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const reason = req.body.reason;
    const user = await User_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    user.isActive = false;
    user.deactivatedAt = new Date();
    if (reason)
        user.deactivationReason = reason;
    await user.save();
    // If user is a creator, update their CreatorProfile status to 'suspended' (not 'deactivated')
    if (user.role === 'creator') {
        await CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId: user._id }, { isActive: false, status: 'suspended', deactivatedAt: user.deactivatedAt, deactivationReason: reason || 'Deactivated by user' });
    }
    // Store in DeactivatedAccount collection
    await DeactivatedAccount_1.default.create({
        userId: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        reason,
        deactivatedAt: user.deactivatedAt,
    });
    res.json({ success: true, message: 'Account deactivated successfully' });
});
// @desc    Get user devices
// @route   GET /api/users/devices
// @access  Private
exports.getUserDevices = (0, express_async_handler_1.default)(async (req, res) => {
    const sessions = await DeviceSession_1.default.find({ userId: req.user._id });
    res.json(sessions);
});
// @desc    Delete user device
// @route   DELETE /api/users/devices/:sessionId
// @access  Private
exports.deleteUserDevice = (0, express_async_handler_1.default)(async (req, res) => {
    const { sessionId } = req.params;
    await DeviceSession_1.default.deleteOne({ _id: sessionId, userId: req.user._id });
    res.json({ success: true });
});
// @desc    List up to 10 users for admin/testing
// @route   GET /api/users/list
// @access  Private (admin only recommended)
exports.getUsersList = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await User_1.default.find({}, '_id name email username role').limit(10);
    res.json(users);
});
// @desc    Get count of active users (all user types)
// @route   GET /api/users/active/count
// @access  Private (admin only)
exports.getActiveUsersCount = (0, express_async_handler_1.default)(async (req, res) => {
    const count = await User_1.default.countDocuments({ isActive: true });
    res.json({ count });
});
