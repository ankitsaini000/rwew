import express from 'express';
import { createBrandExperienceReview, getBrandExperienceReviews, getBrandExperienceReviewByOrder } from '../controllers/brandExperienceReviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Creator rates brand for an order
router.post('/', protect, createBrandExperienceReview);

// Get all reviews for a brand
router.get('/brand/:brandId', getBrandExperienceReviews);

// Get review for a specific order
router.get('/order/:orderId', protect, getBrandExperienceReviewByOrder);

export default router; 