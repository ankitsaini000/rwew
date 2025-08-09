"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const brandProfileRoutes_1 = __importDefault(require("./brandProfileRoutes")); // Import the new brand profile routes
const brandRecommendationRoutes_1 = __importDefault(require("./brandRecommendationRoutes")); // Import brand recommendation routes
const notificationRoutes_1 = __importDefault(require("./notificationRoutes"));
const reviewRoutes_1 = __importDefault(require("./reviewRoutes"));
const categoryRoutes_1 = __importDefault(require("./categoryRoutes"));
const matchingController_1 = require("../controllers/matchingController");
const brandExperienceReviewRoutes_1 = __importDefault(require("./brandExperienceReviewRoutes"));
const eventTypeRoutes_1 = __importDefault(require("./eventTypeRoutes"));
const eventPricingRangeRoutes_1 = __importDefault(require("./eventPricingRangeRoutes"));
const statsRoutes_1 = __importDefault(require("./statsRoutes"));
const adminVerificationRoutes_1 = __importDefault(require("./adminVerificationRoutes"));
const offers_1 = __importDefault(require("./offers"));
const socialMediaPreferenceRoutes_1 = __importDefault(require("./socialMediaPreferenceRoutes"));
// Import other routes as needed
const router = (0, express_1.Router)();
router.use('/users', userRoutes_1.default);
router.use('/auth', authRoutes_1.default);
router.use('/brand-profiles', brandProfileRoutes_1.default); // Mount the new brand profile routes
router.use('/brand-recommendations', brandRecommendationRoutes_1.default); // Mount brand recommendation routes
router.use('/notifications', notificationRoutes_1.default);
router.use('/reviews', reviewRoutes_1.default);
router.use('/categories', categoryRoutes_1.default);
router.use('/brand-experience-reviews', brandExperienceReviewRoutes_1.default);
router.use('/event-types', eventTypeRoutes_1.default);
router.use('/event-pricing-ranges', eventPricingRangeRoutes_1.default);
router.use('/stats', statsRoutes_1.default);
router.use('/admin', adminVerificationRoutes_1.default);
router.use('/offers', offers_1.default);
router.use('/social-media-preferences', socialMediaPreferenceRoutes_1.default);
// Use other routes as needed
// Add matching endpoint (remove '/api' prefix)
router.get('/match/brand/:brandId', matchingController_1.getBestCreatorMatchesForBrand);
exports.default = router;
