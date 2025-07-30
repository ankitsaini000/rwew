import express from 'express';
import { protect, authorize } from '../middleware/auth';
import * as promotionController from '../controllers/promotionController';

const router = express.Router();

// Public routes (no auth required)
router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);

// Protected routes (requires authentication)
router.use(protect);

// Brand-specific routes
router.post('/', authorize('brand'), promotionController.createPromotion);
router.get('/brand/all', authorize('brand'), promotionController.getBrandPromotions);

// Routes requiring ownership verification (handled in the controller)
router.route('/:id')
  .put(authorize('brand'), promotionController.updatePromotion)
  .delete(authorize('brand'), promotionController.deletePromotion);

router.put('/:id/publish', authorize('brand'), promotionController.publishPromotion);

// Admin routes
router.get('/admin/check-deadlines', authorize('admin'), async (req, res) => {
  try {
    const result = await promotionController.checkAndUpdatePromotionStatuses();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deadline check route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check promotion deadlines'
    });
  }
});

export default router; 