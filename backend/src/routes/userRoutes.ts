import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  checkUsernameAvailability,
  getCurrentUser,
  syncProfileImage,
  getUserById,
  sendPhoneVerification,
  confirmPhoneVerification,
  deactivateUserAccount,
  getUserDevices,
  deleteUserDevice,
  getUsersList,
  getActiveUsersCount
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authMiddleware';

const router = express.Router();

// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post('/', registerUser);

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   GET /api/users/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', checkUsernameAvailability);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/users/sync-profile-image
// @desc    Sync profile image from creator profile to user avatar
// @access  Private
router.post('/sync-profile-image', protect, syncProfileImage);

// @route   GET /api/users/devices
// @desc    Get user devices
// @access  Private
router.get('/devices', protect, getUserDevices);

// @route   DELETE /api/users/devices/:sessionId
// @desc    Delete user device
// @access  Private
router.delete('/devices/:sessionId', protect, deleteUserDevice);

// @route   GET /api/users/:id
// @desc    Get user by ID (public info)
// @access  Public
router.get('/:id', getUserById);

// @route   POST /api/users/verify-phone
// @desc    Send phone verification code
// @access  Private
router.post('/verify-phone', protect, sendPhoneVerification);

// @route   POST /api/users/verify-phone/confirm
// @desc    Confirm phone verification code
// @access  Private
router.post('/verify-phone/confirm', protect, confirmPhoneVerification);

// @route   PUT /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.put('/deactivate', protect, deactivateUserAccount);

// Admin user list endpoint
router.get('/list', protect, authorize(['admin']), getUsersList);

// Admin: Get count of active users
router.get('/active/count', protect, authorize(['admin']), getActiveUsersCount);

export default router; 