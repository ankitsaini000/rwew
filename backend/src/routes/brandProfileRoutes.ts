import express from 'express';
import { getBrandProfile, createOrUpdateBrandProfile, getPublicBrandProfile, getAllBrandProfiles, deactivateBrandProfile, reactivateBrandProfile } from '../controllers/brandProfileController';
import { protect, authorize } from '../middleware/authMiddleware'; // Assuming auth middleware

const router = express.Router();

// Admin or public route to get all brand profiles
router.get('/all', getAllBrandProfiles);

// Public route to get brand profile by username
router.route('/:username').get(getPublicBrandProfile);

router.route('/').get(protect, authorize(['brand']), getBrandProfile).post(protect, authorize(['brand']), createOrUpdateBrandProfile);

// Admin route to deactivate a brand profile
router.put('/:id/deactivate', protect, authorize(['admin']), deactivateBrandProfile);

// Admin route to reactivate a brand profile
router.put('/:id/reactivate', protect, authorize(['admin']), reactivateBrandProfile);

export default router; 