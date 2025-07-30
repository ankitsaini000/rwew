"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post('/', userController_1.registerUser);
// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController_1.loginUser);
// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.protect, userController_1.getCurrentUser);
// @route   GET /api/users/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', userController_1.checkUsernameAvailability);
// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth_1.protect, userController_1.getUserProfile);
// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.protect, userController_1.updateUserProfile);
// @route   POST /api/users/sync-profile-image
// @desc    Sync profile image from creator profile to user avatar
// @access  Private
router.post('/sync-profile-image', auth_1.protect, userController_1.syncProfileImage);
// @route   GET /api/users/devices
// @desc    Get user devices
// @access  Private
router.get('/devices', auth_1.protect, userController_1.getUserDevices);
// @route   DELETE /api/users/devices/:sessionId
// @desc    Delete user device
// @access  Private
router.delete('/devices/:sessionId', auth_1.protect, userController_1.deleteUserDevice);
// @route   GET /api/users/:id
// @desc    Get user by ID (public info)
// @access  Public
router.get('/:id', userController_1.getUserById);
// @route   POST /api/users/verify-phone
// @desc    Send phone verification code
// @access  Private
router.post('/verify-phone', auth_1.protect, userController_1.sendPhoneVerification);
// @route   POST /api/users/verify-phone/confirm
// @desc    Confirm phone verification code
// @access  Private
router.post('/verify-phone/confirm', auth_1.protect, userController_1.confirmPhoneVerification);
// @route   PUT /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.put('/deactivate', auth_1.protect, userController_1.deactivateUserAccount);
// Admin user list endpoint
router.get('/list', auth_1.protect, (0, authMiddleware_1.authorize)(['admin']), userController_1.getUsersList);
// Admin: Get count of active users
router.get('/active/count', auth_1.protect, (0, authMiddleware_1.authorize)(['admin']), userController_1.getActiveUsersCount);
exports.default = router;
