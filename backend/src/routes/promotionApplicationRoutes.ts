import express from 'express';
import { protect, authorize } from '../middleware/auth';
import * as promotionApplicationController from '../controllers/promotionApplicationController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes for creators to apply to promotions
router.post('/', authorize('creator'), promotionApplicationController.applyToPromotion);
router.get('/creator', authorize('creator'), promotionApplicationController.getCreatorApplications);

// Routes for brands to view and manage applications
router.get('/promotion/:promotionId', authorize('brand', 'admin'), promotionApplicationController.getPromotionApplications);
router.put('/:id/status', authorize('brand'), promotionApplicationController.updateApplicationStatus);

// Route for both creators and brands to view a specific application (access control in controller)
router.get('/:id', promotionApplicationController.getApplicationById);

export default router; 