import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import brandProfileRoutes from './brandProfileRoutes'; // Import the new brand profile routes
import notificationRoutes from './notificationRoutes';
import reviewRoutes from './reviewRoutes';
import categoryRoutes from './categoryRoutes';
import { getBestCreatorMatchesForBrand } from '../controllers/matchingController';
import brandExperienceReviewRoutes from './brandExperienceReviewRoutes';
import eventTypeRoutes from './eventTypeRoutes';
import eventPricingRangeRoutes from './eventPricingRangeRoutes';
import statsRoutes from './statsRoutes';
import adminVerificationRoutes from './adminVerificationRoutes';
import offerRoutes from './offers';
import socialMediaPreferenceRoutes from './socialMediaPreferenceRoutes';
// Import other routes as needed

const router = Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/brand-profiles', brandProfileRoutes); // Mount the new brand profile routes
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/categories', categoryRoutes);
router.use('/brand-experience-reviews', brandExperienceReviewRoutes);
router.use('/event-types', eventTypeRoutes);
router.use('/event-pricing-ranges', eventPricingRangeRoutes);
router.use('/stats', statsRoutes);
router.use('/admin', adminVerificationRoutes);
router.use('/offers', offerRoutes);
router.use('/social-media-preferences', socialMediaPreferenceRoutes);
// Use other routes as needed

// Add matching endpoint (remove '/api' prefix)
router.get('/match/brand/:brandId', getBestCreatorMatchesForBrand);

export default router; 