"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const brandReviewController_1 = require("../controllers/brandReviewController");
const router = express_1.default.Router();
// @route   POST /api/brand-reviews
// @desc    Submit a review for a completed order
// @access  Private (Brand only)
router.post('/', auth_1.protect, (0, auth_1.authorize)('brand'), brandReviewController_1.submitBrandReview);
// @route   GET /api/brand-reviews/creator/:creatorId
// @desc    Get reviews for a creator
// @access  Public
router.get('/creator/:creatorId', brandReviewController_1.getCreatorReviews);
// @route   GET /api/brand-reviews/brand
// @desc    Get brand's reviews
// @access  Private (Brand only)
router.get('/brand', auth_1.protect, (0, auth_1.authorize)('brand'), brandReviewController_1.getBrandReviews);
// @route   PUT /api/brand-reviews/:reviewId
// @desc    Update a review
// @access  Private (Brand only)
router.put('/:reviewId', auth_1.protect, (0, auth_1.authorize)('brand'), brandReviewController_1.updateBrandReview);
// @route   DELETE /api/brand-reviews/:reviewId
// @desc    Delete a review
// @access  Private (Brand only)
router.delete('/:reviewId', auth_1.protect, (0, auth_1.authorize)('brand'), brandReviewController_1.deleteBrandReview);
// @route   GET /api/brand-reviews/check/:orderId
// @desc    Check if brand has reviewed an order
// @access  Private (Brand only)
router.get('/check/:orderId', auth_1.protect, (0, auth_1.authorize)('brand'), brandReviewController_1.checkOrderReview);
exports.default = router;
