import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { getBrandDashboardStats, createTestOrders, getDashboardRecommendations, getProfilesYouMayLike, getBestCreatorsForBrand } from '../controllers/brandDashboardController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Brand routes
router.get('/dashboard-stats', authorize('brand'), getBrandDashboardStats);
router.post('/test-orders', authorize('brand'), createTestOrders);
router.post('/dashboard-recommendations', authorize('brand'), getDashboardRecommendations);
router.get('/dashboard-profiles-you-may-like', authorize('brand'), getProfilesYouMayLike);
router.get('/dashboard-best-creators', authorize('brand'), getBestCreatorsForBrand);

export default router; 