"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public or Private (as needed)
router.get('/', reviewController_1.getAllReviews);
// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (brand)
router.post('/', auth_1.protect, reviewController_1.createReview);
// @route   GET /api/reviews/creator/:creatorId
// @desc    Get reviews for a creator
// @access  Public
router.get('/creator/:creatorId', reviewController_1.getCreatorReviews);
// @route   GET /api/reviews/brand
// @desc    Get reviews by brand
// @access  Private (brand)
router.get('/brand', auth_1.protect, reviewController_1.getBrandReviews);
// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (brand)
router.put('/:id', auth_1.protect, reviewController_1.updateReview);
// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (brand)
router.delete('/:id', auth_1.protect, reviewController_1.deleteReview);
// @route   GET /api/reviews/order/:orderId
// @desc    Get review for a specific order
// @access  Private (brand)
router.get('/order/:orderId', auth_1.protect, reviewController_1.getReviewByOrderId);
// Reply routes (creator only)
// @route   POST /api/reviews/:id/reply
// @desc    Add a reply to a review
// @access  Private (creator)
router.post('/:id/reply', auth_1.protect, reviewController_1.addReviewReply);
// @route   PUT /api/reviews/:id/reply
// @desc    Update a reply to a review
// @access  Private (creator)
router.put('/:id/reply', auth_1.protect, reviewController_1.updateReviewReply);
// @route   DELETE /api/reviews/:id/reply
// @desc    Delete a reply to a review
// @access  Private (creator)
router.delete('/:id/reply', auth_1.protect, reviewController_1.deleteReviewReply);
// @route   POST /api/reviews/cleanup-empty-replies
// @desc    Clean up empty reply objects from database
// @access  Private (admin)
router.post('/cleanup-empty-replies', auth_1.protect, reviewController_1.cleanupEmptyReplies);
exports.default = router;
