import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getAutomaticRecommendations,
  refreshRecommendations,
  getSmartRecommendations
} from '../controllers/brandRecommendationController';

const router = express.Router();

// All routes require authentication and brand role
router.use(protect);
router.use(authorize('brand'));

// @route   GET /api/brand-recommendations/auto
// @desc    Get automatic recommendations for brand
// @access  Private (Brand only)
router.get('/auto', getAutomaticRecommendations);

// @route   POST /api/brand-recommendations/refresh
// @desc    Refresh recommendations for brand
// @access  Private (Brand only)
router.post('/refresh', refreshRecommendations);

// @route   GET /api/brand-recommendations/smart
// @desc    Get smart recommendations (preference-based or automatic fallback)
// @access  Private (Brand only)
router.get('/smart', getSmartRecommendations);

export default router;