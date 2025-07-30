import express from 'express';
import { protect } from '../middleware/auth';
import upload from '../middleware/upload'; // Assuming you have this middleware
import ProfileController from '../controllers/ProfileController';

const router = express.Router();
const profileController = ProfileController; // Use the exported instance

// @route   POST /api/profile/upload-image
// @desc    Upload profile or cover image
// @access  Private
router.post('/upload-image', protect, upload.single('image'), profileController.uploadProfileImage);

export default router; 