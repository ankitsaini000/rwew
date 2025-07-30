"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrderReview = exports.deleteBrandReview = exports.updateBrandReview = exports.getBrandReviews = exports.getCreatorReviews = exports.submitBrandReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Review_1 = __importDefault(require("../models/Review"));
const Order_1 = __importDefault(require("../models/Order"));
const CreatorProfile_1 = require("../models/CreatorProfile");
// @desc    Submit a review for a completed order
// @route   POST /api/brand-reviews
// @access  Private (Brand only)
exports.submitBrandReview = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const brandId = req.user._id;
        console.log('=== BRAND REVIEW SUBMISSION STARTED ===');
        console.log('Order ID:', orderId);
        console.log('Brand ID:', brandId);
        console.log('Rating:', rating);
        console.log('Comment:', comment);
        // Check if the user is a brand
        if (req.user.role !== 'brand') {
            console.log('❌ User is not a brand, role:', req.user.role);
            res.status(403).json({
                success: false,
                message: 'Only brands can submit reviews'
            });
            return;
        }
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            console.log('❌ Invalid rating:', rating);
            res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
            return;
        }
        // Validate comment
        if (!comment || comment.trim() === '') {
            console.log('❌ Empty comment');
            res.status(400).json({
                success: false,
                message: 'Review comment cannot be empty'
            });
            return;
        }
        if (comment.trim().length < 10) {
            console.log('❌ Comment too short, length:', comment.trim().length);
            res.status(400).json({
                success: false,
                message: 'Review comment must be at least 10 characters long'
            });
            return;
        }
        // Find the order
        console.log('🔍 Finding order...');
        const order = await Order_1.default.findOne({
            _id: orderId,
            client: brandId
        });
        if (!order) {
            console.log('❌ Order not found or not authorized');
            res.status(404).json({
                success: false,
                message: 'Order not found or not authorized to review'
            });
            return;
        }
        console.log('✅ Order found');
        console.log('Order status:', order.status);
        console.log('Creator ID:', order.creator);
        // Check if order is completed
        if (order.status !== 'completed') {
            console.log('❌ Order is not completed');
            res.status(400).json({
                success: false,
                message: 'Reviews can only be submitted for completed orders'
            });
            return;
        }
        // Check if brand has already reviewed this order
        console.log('🔍 Checking for existing review...');
        const existingReview = await Review_1.default.findOne({ orderId });
        if (existingReview) {
            console.log('❌ Review already exists for this order');
            res.status(400).json({
                success: false,
                message: 'You have already reviewed this order'
            });
            return;
        }
        // Create the review in reviews collection
        console.log('📝 Creating review in reviews collection...');
        const review = await Review_1.default.create({
            orderId,
            creatorId: order.creator,
            brandId,
            rating,
            comment: comment.trim()
        });
        console.log('✅ Review created in reviews collection successfully');
        console.log('Review ID:', review._id);
        console.log('Review data:', {
            orderId: review.orderId,
            creatorId: review.creatorId,
            brandId: review.brandId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt
        });
        // Also add the review to the creator's profile
        console.log('🔍 Finding creator profile for userId:', order.creator);
        const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId: order.creator });
        if (profile) {
            console.log('✅ Creator profile found');
            console.log('Profile ID:', profile._id);
            if (!profile.reviews) {
                console.log('📝 Initializing reviews array in creator profile');
                profile.reviews = [];
            }
            const alreadyExists = profile.reviews.some((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === orderId.toString(); });
            if (!alreadyExists) {
                const reviewPayload = {
                    brandId,
                    rating,
                    comment,
                    createdAt: review.createdAt,
                    orderId
                };
                console.log('📝 Adding review to creator profile...');
                console.log('Review payload for creator profile:', reviewPayload);
                profile.reviews.push(reviewPayload);
                await profile.save();
                console.log('✅ Review successfully added to creator profile');
                console.log('Total reviews in creator profile:', profile.reviews.length);
            }
            else {
                console.log('⚠️ Review already exists in creator profile, skipping duplicate');
            }
        }
        else {
            console.log('❌ No creator profile found for userId:', order.creator);
            console.log('⚠️ Review was created in reviews collection but not added to creator profile');
        }
        console.log('=== BRAND REVIEW SUBMISSION COMPLETED ===');
        console.log('✅ Review submitted to reviews collection and creatorprofiles collection properly');
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully to both collections',
            data: review
        });
    }
    catch (error) {
        console.error('❌ Error submitting brand review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting review'
        });
    }
});
// @desc    Get reviews for a creator
// @route   GET /api/brand-reviews/creator/:creatorId
// @access  Public
exports.getCreatorReviews = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { creatorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log('=== FETCHING CREATOR REVIEWS ===');
        console.log('Creator ID:', creatorId);
        console.log('Page:', page);
        console.log('Limit:', limit);
        // Verify the creator exists
        const creatorExists = await CreatorProfile_1.CreatorProfile.findById(creatorId);
        if (!creatorExists) {
            console.log('❌ Creator profile not found');
            res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
            return;
        }
        const skip = (page - 1) * limit;
        // Get reviews with pagination
        const reviews = await Review_1.default.find({ creatorId })
            .populate('brandId', 'name firstName lastName username profileImage')
            .populate('orderId', 'orderID service')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Get total count
        const total = await Review_1.default.countDocuments({ creatorId });
        console.log('✅ Reviews fetched successfully');
        console.log('Total reviews:', total);
        console.log('Reviews returned:', reviews.length);
        res.json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching creator reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});
// @desc    Get brand's reviews
// @route   GET /api/brand-reviews/brand
// @access  Private (Brand only)
exports.getBrandReviews = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const brandId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log('=== FETCHING BRAND REVIEWS ===');
        console.log('Brand ID:', brandId);
        console.log('Page:', page);
        console.log('Limit:', limit);
        // Check if the user is a brand
        if (req.user.role !== 'brand') {
            console.log('❌ User is not a brand, role:', req.user.role);
            res.status(403).json({
                success: false,
                message: 'Only brands can access their reviews'
            });
            return;
        }
        const skip = (page - 1) * limit;
        // Get reviews with pagination
        const reviews = await Review_1.default.find({ brandId })
            .populate('creatorId', 'name firstName lastName username profileImage')
            .populate('orderId', 'orderID service')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Get total count
        const total = await Review_1.default.countDocuments({ brandId });
        console.log('✅ Brand reviews fetched successfully');
        console.log('Total reviews:', total);
        console.log('Reviews returned:', reviews.length);
        res.json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('❌ Error fetching brand reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});
// @desc    Update a review
// @route   PUT /api/brand-reviews/:reviewId
// @access  Private (Brand only)
exports.updateBrandReview = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const brandId = req.user._id;
        console.log('=== UPDATING BRAND REVIEW ===');
        console.log('Review ID:', reviewId);
        console.log('Brand ID:', brandId);
        console.log('New rating:', rating);
        console.log('New comment:', comment);
        // Check if the user is a brand
        if (req.user.role !== 'brand') {
            console.log('❌ User is not a brand, role:', req.user.role);
            res.status(403).json({
                success: false,
                message: 'Only brands can update reviews'
            });
            return;
        }
        // Find the review
        const review = await Review_1.default.findOne({
            _id: reviewId,
            brandId
        });
        if (!review) {
            console.log('❌ Review not found or not authorized');
            res.status(404).json({
                success: false,
                message: 'Review not found or not authorized to update'
            });
            return;
        }
        console.log('✅ Review found');
        // Validate rating if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            console.log('❌ Invalid rating:', rating);
            res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
            return;
        }
        // Validate comment if provided
        if (comment !== undefined) {
            if (!comment.trim()) {
                console.log('❌ Empty comment');
                res.status(400).json({
                    success: false,
                    message: 'Review comment cannot be empty'
                });
                return;
            }
            if (comment.trim().length < 10) {
                console.log('❌ Comment too short, length:', comment.trim().length);
                res.status(400).json({
                    success: false,
                    message: 'Review comment must be at least 10 characters long'
                });
                return;
            }
        }
        // Update the review
        if (rating !== undefined)
            review.rating = rating;
        if (comment !== undefined)
            review.comment = comment.trim();
        const updatedReview = await review.save();
        console.log('✅ Review updated successfully');
        // Also update the review in the creator's profile
        console.log('🔍 Updating review in creator profile...');
        const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId: review.creatorId });
        if (profile && profile.reviews) {
            const reviewIndex = profile.reviews.findIndex((r) => { var _a, _b; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = review.orderId) === null || _b === void 0 ? void 0 : _b.toString()); });
            if (reviewIndex !== -1) {
                profile.reviews[reviewIndex] = Object.assign(Object.assign({}, profile.reviews[reviewIndex]), { rating: updatedReview.rating, comment: updatedReview.comment });
                await profile.save();
                console.log('✅ Review updated in creator profile');
            }
            else {
                console.log('⚠️ Review not found in creator profile for update');
            }
        }
        else {
            console.log('⚠️ Creator profile not found for update');
        }
        console.log('=== BRAND REVIEW UPDATE COMPLETED ===');
        res.json({
            success: true,
            message: 'Review updated successfully in both collections',
            data: updatedReview
        });
    }
    catch (error) {
        console.error('❌ Error updating brand review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating review'
        });
    }
});
// @desc    Delete a review
// @route   DELETE /api/brand-reviews/:reviewId
// @access  Private (Brand only)
exports.deleteBrandReview = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { reviewId } = req.params;
        const brandId = req.user._id;
        console.log('=== DELETING BRAND REVIEW ===');
        console.log('Review ID:', reviewId);
        console.log('Brand ID:', brandId);
        // Check if the user is a brand
        if (req.user.role !== 'brand') {
            console.log('❌ User is not a brand, role:', req.user.role);
            res.status(403).json({
                success: false,
                message: 'Only brands can delete reviews'
            });
            return;
        }
        // Find the review
        const review = await Review_1.default.findOne({
            _id: reviewId,
            brandId
        });
        if (!review) {
            console.log('❌ Review not found or not authorized');
            res.status(404).json({
                success: false,
                message: 'Review not found or not authorized to delete'
            });
            return;
        }
        console.log('✅ Review found');
        // Capture creatorId and orderId to update creator profile
        const creatorId = review.creatorId;
        const orderId = review.orderId;
        // Delete the review from reviews collection
        await Review_1.default.deleteOne({ _id: reviewId });
        console.log('✅ Review deleted from reviews collection');
        // Also remove the review from the creator's profile
        console.log('🔍 Removing review from creator profile...');
        const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId: creatorId });
        if (profile && profile.reviews) {
            const initialLength = profile.reviews.length;
            profile.reviews = profile.reviews.filter((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) !== (orderId === null || orderId === void 0 ? void 0 : orderId.toString()); });
            if (profile.reviews.length < initialLength) {
                await profile.save();
                console.log('✅ Review removed from creator profile');
                console.log('Reviews removed:', initialLength - profile.reviews.length);
            }
            else {
                console.log('⚠️ Review not found in creator profile for deletion');
            }
        }
        else {
            console.log('⚠️ Creator profile not found for deletion');
        }
        console.log('=== BRAND REVIEW DELETION COMPLETED ===');
        res.json({
            success: true,
            message: 'Review deleted successfully from both collections'
        });
    }
    catch (error) {
        console.error('❌ Error deleting brand review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting review'
        });
    }
});
// @desc    Check if order has been reviewed
// @route   GET /api/brand-reviews/check/:orderId
// @access  Private (Brand only)
exports.checkOrderReview = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { orderId } = req.params;
        const brandId = req.user._id;
        console.log('=== CHECKING ORDER REVIEW ===');
        console.log('Order ID:', orderId);
        console.log('Brand ID:', brandId);
        // Check if the user is a brand
        if (req.user.role !== 'brand') {
            console.log('❌ User is not a brand, role:', req.user.role);
            res.status(403).json({
                success: false,
                message: 'Only brands can check order reviews'
            });
            return;
        }
        // Find the review
        const review = await Review_1.default.findOne({ orderId, brandId });
        console.log('✅ Review check completed');
        console.log('Review exists:', !!review);
        res.json({
            success: true,
            hasReview: !!review,
            review: review || null
        });
    }
    catch (error) {
        console.error('❌ Error checking order review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking review'
        });
    }
});
