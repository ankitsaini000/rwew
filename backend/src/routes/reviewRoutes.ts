import express from 'express';
import { createReview, getCreatorReviews, updateReview, deleteReview, getReviewByOrderId, addReviewReply, updateReviewReply, deleteReviewReply, cleanupEmptyReplies, getBrandReviews, getAllReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public or Private (as needed)
router.get('/', getAllReviews);

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (brand)
router.post('/', protect, createReview);

// @route   GET /api/reviews/creator/:creatorId
// @desc    Get reviews for a creator
// @access  Public
router.get('/creator/:creatorId', getCreatorReviews);

// @route   GET /api/reviews/brand
// @desc    Get reviews by brand
// @access  Private (brand)
router.get('/brand', protect, getBrandReviews);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (brand)
router.put('/:id', protect, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (brand)
router.delete('/:id', protect, deleteReview);

// @route   GET /api/reviews/order/:orderId
// @desc    Get review for a specific order
// @access  Private (brand)
router.get('/order/:orderId', protect, getReviewByOrderId);

// Reply routes (creator only)
// @route   POST /api/reviews/:id/reply
// @desc    Add a reply to a review
// @access  Private (creator)
router.post('/:id/reply', protect, addReviewReply);

// @route   PUT /api/reviews/:id/reply
// @desc    Update a reply to a review
// @access  Private (creator)
router.put('/:id/reply', protect, updateReviewReply);

// @route   DELETE /api/reviews/:id/reply
// @desc    Delete a reply to a review
// @access  Private (creator)
router.delete('/:id/reply', protect, deleteReviewReply);

// @route   POST /api/reviews/cleanup-empty-replies
// @desc    Clean up empty reply objects from database
// @access  Private (admin)
router.post('/cleanup-empty-replies', protect, cleanupEmptyReplies);

export default router; 