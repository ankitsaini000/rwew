"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = exports.getBrandReviews = exports.cleanupEmptyReplies = exports.deleteReviewReply = exports.updateReviewReply = exports.addReviewReply = exports.getReviewByOrderId = exports.deleteReview = exports.updateReview = exports.getCreatorReviews = exports.createReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Review_1 = __importDefault(require("../models/Review"));
const Order_1 = __importDefault(require("../models/Order"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const CreatorMetrics_1 = __importDefault(require("../models/CreatorMetrics"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Create a new review for a completed order
// @route   POST /api/reviews
// @access  Private (brand)
exports.createReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const brandId = req.user._id;
    // Find the order and check status
    const order = await Order_1.default.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    if (order.status !== 'completed') {
        res.status(400);
        throw new Error('You can only review completed orders');
    }
    if (order.client.toString() !== brandId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to review this order');
    }
    // Check if review already exists for this order
    const existingReview = await Review_1.default.findOne({ orderId });
    if (existingReview) {
        res.status(400);
        throw new Error('A review for this order already exists');
    }
    // Create the review in the reviews collection
    const review = await Review_1.default.create({
        orderId,
        creatorId: order.creator,
        brandId,
        rating,
        comment
    });
    console.log('[REVIEWS] Review created in reviews collection:', review._id);
    // Add or update the review in the creator's profile (creatorprofiles collection)
    const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId: order.creator });
    if (profile) {
        if (!Array.isArray(profile.reviews))
            profile.reviews = [];
        const reviewPayload = {
            brandId: brandId.toString(),
            rating,
            comment,
            createdAt: review.createdAt,
            orderId: orderId.toString()
        };
        // Check if review already exists in creator profile
        const existingReviewIndex = profile.reviews.findIndex((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === orderId.toString(); });
        if (existingReviewIndex !== -1) {
            // Update existing review in creator profile
            profile.reviews[existingReviewIndex] = reviewPayload;
            console.log('[CREATORPROFILES] Review updated in creator profile:', profile._id);
        }
        else {
            // Add new review to creator profile
            profile.reviews.push(reviewPayload);
            console.log('[CREATORPROFILES] Review added to creator profile:', profile._id);
        }
        try {
            await profile.save();
            console.log('[CREATORPROFILES] Profile saved successfully');
        }
        catch (error) {
            console.error('[CREATORPROFILES] Error saving profile:', error);
            // Continue with the response even if profile save fails
        }
    }
    else {
        console.warn('[CREATORPROFILES] No creator profile found for userId:', order.creator, 'when adding review for order:', orderId);
    }
    // Also add or update the review in the creator's metrics (creatormetrics collection)
    const creatorMetrics = await CreatorMetrics_1.default.findOne({ creator: order.creator });
    if (creatorMetrics) {
        if (!Array.isArray(creatorMetrics.reviews))
            creatorMetrics.reviews = [];
        const metricsReviewPayload = {
            brandId: brandId,
            rating,
            comment,
            createdAt: review.createdAt,
            orderId: orderId
        };
        // Check if review already exists in creator metrics
        const existingMetricsReviewIndex = creatorMetrics.reviews.findIndex((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === orderId.toString(); });
        if (existingMetricsReviewIndex !== -1) {
            // Update existing review in creator metrics
            creatorMetrics.reviews[existingMetricsReviewIndex] = metricsReviewPayload;
            console.log('[CREATORMETRICS] Review updated in creator metrics:', creatorMetrics._id);
        }
        else {
            // Add new review to creator metrics
            creatorMetrics.reviews.push(metricsReviewPayload);
            console.log('[CREATORMETRICS] Review added to creator metrics:', creatorMetrics._id);
        }
        try {
            await creatorMetrics.save();
            console.log('[CREATORMETRICS] Creator metrics saved successfully');
        }
        catch (error) {
            console.error('[CREATORMETRICS] Error saving creator metrics:', error);
            // Continue with the response even if metrics save fails
        }
    }
    else {
        console.warn('[CREATORMETRICS] No creator metrics found for userId:', order.creator, 'when adding review for order:', orderId);
    }
    // Create notification for the creator about the new review
    try {
        const Notification = mongoose_1.default.model('Notification');
        const brandUser = req.user;
        const creatorNotification = await Notification.create({
            user: order.creator,
            type: 'order',
            message: `${brandUser.fullName || brandUser.username || 'A client'} has left you a ${rating}-star review!`,
            fromUser: brandId,
            isRead: false
        });
        // Emit real-time notification to creator
        const io = require('../sockets').getIO();
        io.to(order.creator.toString()).emit('newNotification', {
            notification: Object.assign(Object.assign({}, creatorNotification.toObject()), { fromUser: {
                    _id: brandId,
                    fullName: brandUser.fullName || brandUser.username || 'Client',
                    avatar: brandUser.avatar
                } })
        });
        console.log('Created review notification for creator:', {
            notificationId: creatorNotification._id,
            creatorId: order.creator,
            brandId: brandId,
            reviewId: review._id,
            rating: rating
        });
    }
    catch (notificationError) {
        console.error('Error creating review notification:', notificationError);
        // Don't fail the review creation if notification fails
    }
    console.log('[SUCCESS] Review submitted to reviews, creatorprofiles, and creatormetrics collections');
    res.status(201).json({
        success: true,
        message: 'Review submitted to reviews, creatorprofiles, and creatormetrics collections',
        data: review
    });
});
// @desc    Get reviews for a creator
// @route   GET /api/reviews/creator/:creatorId
// @access  Public
exports.getCreatorReviews = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const creatorId = req.params.creatorId;
        const { limit } = req.query;
        console.log('Getting reviews for creator ID:', creatorId);
        const limitNum = limit ? parseInt(limit) : 10;
        let reviews = await Review_1.default.find({ creatorId })
            .populate('brandId', 'fullName avatar username')
            .populate('orderId', 'orderID service')
            .sort({ createdAt: -1 })
            .limit(limitNum);
        // If no reviews found in the reviews collection, check embedded reviews in CreatorProfile
        if (reviews.length === 0) {
            const { CreatorProfile } = require('../models/CreatorProfile');
            // Try to find by _id or userId
            let profile = await CreatorProfile.findOne({ _id: creatorId });
            if (!profile) {
                profile = await CreatorProfile.findOne({ userId: creatorId });
            }
            if (profile && Array.isArray(profile.reviews) && profile.reviews.length > 0) {
                // Sort by createdAt descending (ensure both are Date objects)
                const sortedReviews = [...profile.reviews].sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
                const limitedReviews = sortedReviews.slice(0, limitNum);
                const totalReviews = limitedReviews.length;
                const averageRating = totalReviews > 0
                    ? limitedReviews.reduce((sum, review) => sum + (typeof review.rating === 'number' ? review.rating : 0), 0) / totalReviews
                    : 0;
                res.json({
                    success: true,
                    data: {
                        reviews: limitedReviews,
                        averageRating: Math.round(averageRating * 10) / 10,
                        totalReviews
                    }
                });
                return;
            }
        }
        console.log(`Found ${reviews.length} reviews for creator ${creatorId}`);
        // Calculate average rating and total reviews
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;
        res.json({
            success: true,
            data: {
                reviews,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                totalReviews
            }
        });
    }
    catch (error) {
        console.error('Error fetching reviews by creator ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});
// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (brand)
exports.updateReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { rating, comment } = req.body;
    const brandId = req.user._id;
    console.log('=== REVIEW UPDATE STARTED ===');
    console.log('Review ID:', req.params.id);
    console.log('Brand ID:', brandId);
    console.log('New Rating:', rating);
    console.log('New Comment:', comment);
    // Find the review
    const review = await Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check authorization
    if (review.brandId.toString() !== brandId.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }
    // Update the review in the reviews collection
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    const updatedReview = await review.save();
    console.log('[REVIEWS] Review updated in reviews collection:', updatedReview._id);
    // Also update the review in the creator's profile (creatorprofiles collection)
    const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId: review.creatorId });
    if (profile) {
        if (!Array.isArray(profile.reviews))
            profile.reviews = [];
        const reviewPayload = {
            brandId: brandId.toString(),
            rating: updatedReview.rating,
            comment: updatedReview.comment,
            createdAt: updatedReview.createdAt,
            orderId: review.orderId.toString()
        };
        // Find and update the review in creator profile
        const existingReviewIndex = profile.reviews.findIndex((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === review.orderId.toString(); });
        if (existingReviewIndex !== -1) {
            // Update existing review in creator profile
            profile.reviews[existingReviewIndex] = reviewPayload;
            console.log('[CREATORPROFILES] Review updated in creator profile:', profile._id);
        }
        else {
            // Add new review to creator profile if not found
            profile.reviews.push(reviewPayload);
            console.log('[CREATORPROFILES] Review added to creator profile (was missing):', profile._id);
        }
        try {
            await profile.save();
            console.log('[CREATORPROFILES] Profile saved successfully after update');
        }
        catch (error) {
            console.error('[CREATORPROFILES] Error saving profile after update:', error);
            // Continue with the response even if profile save fails
        }
    }
    else {
        console.warn('[CREATORPROFILES] No creator profile found for userId:', review.creatorId, 'when updating review:', req.params.id);
    }
    // Also add or update the review in the creator's metrics (creatormetrics collection)
    const creatorMetrics = await CreatorMetrics_1.default.findOne({ creator: review.creatorId });
    if (creatorMetrics) {
        if (!Array.isArray(creatorMetrics.reviews))
            creatorMetrics.reviews = [];
        const metricsReviewPayload = {
            brandId: brandId,
            rating: updatedReview.rating,
            comment: updatedReview.comment,
            createdAt: updatedReview.createdAt,
            orderId: review.orderId
        };
        // Check if review already exists in creator metrics
        const existingMetricsReviewIndex = creatorMetrics.reviews.findIndex((r) => { var _a; return ((_a = r.orderId) === null || _a === void 0 ? void 0 : _a.toString()) === review.orderId.toString(); });
        if (existingMetricsReviewIndex !== -1) {
            // Update existing review in creator metrics
            creatorMetrics.reviews[existingMetricsReviewIndex] = metricsReviewPayload;
            console.log('[CREATORMETRICS] Review updated in creator metrics:', creatorMetrics._id);
        }
        else {
            // Add new review to creator metrics
            creatorMetrics.reviews.push(metricsReviewPayload);
            console.log('[CREATORMETRICS] Review added to creator metrics:', creatorMetrics._id);
        }
        try {
            await creatorMetrics.save();
            console.log('[CREATORMETRICS] Creator metrics saved successfully');
        }
        catch (error) {
            console.error('[CREATORMETRICS] Error saving creator metrics:', error);
            // Continue with the response even if metrics save fails
        }
    }
    else {
        console.warn('[CREATORMETRICS] No creator metrics found for userId:', review.creatorId, 'when updating review:', req.params.id);
    }
    // Create notification for the creator about the review update
    try {
        const Notification = mongoose_1.default.model('Notification');
        const brandUser = req.user;
        const creatorNotification = await Notification.create({
            user: review.creatorId,
            type: 'order',
            message: `${brandUser.fullName || brandUser.username || 'A client'} has updated their review to ${updatedReview.rating} stars!`,
            fromUser: brandId,
            isRead: false
        });
        // Emit real-time notification to creator
        const io = require('../sockets').getIO();
        io.to(review.creatorId.toString()).emit('newNotification', {
            notification: Object.assign(Object.assign({}, creatorNotification.toObject()), { fromUser: {
                    _id: brandId,
                    fullName: brandUser.fullName || brandUser.username || 'Client',
                    avatar: brandUser.avatar
                } })
        });
        console.log('Created review update notification for creator:', {
            notificationId: creatorNotification._id,
            creatorId: review.creatorId,
            brandId: brandId,
            reviewId: review._id,
            newRating: updatedReview.rating
        });
    }
    catch (notificationError) {
        console.error('Error creating review update notification:', notificationError);
        // Don't fail the review update if notification fails
    }
    console.log('[SUCCESS] Review updated in reviews, creatorprofiles, and creatormetrics collections');
    res.json({
        success: true,
        message: 'Review updated successfully in reviews, creatorprofiles, and creatormetrics collections',
        data: updatedReview
    });
});
// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (brand)
exports.deleteReview = (0, express_async_handler_1.default)(async (req, res) => {
    const review = await Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    if (review.brandId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }
    // Store creator ID before deleting the review
    const creatorId = review.creatorId;
    const brandId = req.user._id;
    await review.deleteOne();
    // Create notification for the creator about the review deletion
    try {
        const Notification = mongoose_1.default.model('Notification');
        const brandUser = req.user;
        const creatorNotification = await Notification.create({
            user: creatorId,
            type: 'order',
            message: `${brandUser.fullName || brandUser.username || 'A client'} has removed their review.`,
            fromUser: brandId,
            isRead: false
        });
        // Emit real-time notification to creator
        const io = require('../sockets').getIO();
        io.to(creatorId.toString()).emit('newNotification', {
            notification: Object.assign(Object.assign({}, creatorNotification.toObject()), { fromUser: {
                    _id: brandId,
                    fullName: brandUser.fullName || brandUser.username || 'Client',
                    avatar: brandUser.avatar
                } })
        });
        console.log('Created review deletion notification for creator:', {
            notificationId: creatorNotification._id,
            creatorId: creatorId,
            brandId: brandId,
            reviewId: review._id
        });
    }
    catch (notificationError) {
        console.error('Error creating review deletion notification:', notificationError);
        // Don't fail the review deletion if notification fails
    }
    res.json({ message: 'Review removed' });
});
// @desc    Get review for a specific order
// @route   GET /api/reviews/order/:orderId
// @access  Private (brand)
exports.getReviewByOrderId = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId } = req.params;
    const review = await Review_1.default.findOne({ orderId });
    if (!review) {
        res.status(404);
        throw new Error('Review not found for this order');
    }
    res.json(review);
});
// @desc    Add a reply to a review (creator only)
// @route   POST /api/reviews/:id/reply
// @access  Private (creator)
exports.addReviewReply = (0, express_async_handler_1.default)(async (req, res) => {
    const { text } = req.body;
    const creatorId = req.user._id;
    // Enhanced validation to prevent empty replies
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400);
        throw new Error('Reply text is required and cannot be empty');
    }
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
        res.status(400);
        throw new Error('Reply text cannot be only whitespace');
    }
    if (trimmedText.length > 1000) {
        res.status(400);
        throw new Error('Reply text cannot exceed 1000 characters');
    }
    // Find the review
    const review = await Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check if the user is the creator of this review
    if (review.creatorId.toString() !== creatorId.toString()) {
        res.status(403);
        throw new Error('Not authorized to reply to this review');
    }
    // Check if a reply already exists
    if (review.reply && review.reply.text && review.reply.text.trim().length > 0) {
        res.status(400);
        throw new Error('A reply already exists for this review');
    }
    // Add the reply
    review.reply = {
        text: trimmedText,
        createdAt: new Date()
    };
    const updatedReview = await review.save();
    // Populate the brand information for the response
    await updatedReview.populate('brandId', 'fullName avatar username');
    // Create notification for the brand about the reply
    try {
        const Notification = mongoose_1.default.model('Notification');
        const creatorUser = req.user;
        const brandNotification = await Notification.create({
            user: review.brandId,
            type: 'review',
            message: `${creatorUser.fullName || creatorUser.username || 'A creator'} has replied to your review!`,
            fromUser: creatorId,
            isRead: false
        });
        // Emit real-time notification to brand
        const io = require('../sockets').getIO();
        io.to(review.brandId.toString()).emit('newNotification', {
            notification: Object.assign(Object.assign({}, brandNotification.toObject()), { fromUser: {
                    _id: creatorId,
                    fullName: creatorUser.fullName || creatorUser.username || 'Creator',
                    avatar: creatorUser.avatar
                } })
        });
        console.log('Created review reply notification for brand:', {
            notificationId: brandNotification._id,
            brandId: review.brandId,
            creatorId: creatorId,
            reviewId: review._id,
            replyText: trimmedText.substring(0, 50) + '...'
        });
    }
    catch (notificationError) {
        console.error('Error creating review reply notification:', notificationError);
        // Don't fail the reply creation if notification fails
    }
    res.status(200).json({
        success: true,
        message: 'Reply added successfully',
        review: updatedReview
    });
});
// @desc    Update a reply to a review (creator only)
// @route   PUT /api/reviews/:id/reply
// @access  Private (creator)
exports.updateReviewReply = (0, express_async_handler_1.default)(async (req, res) => {
    const { text } = req.body;
    const creatorId = req.user._id;
    // Enhanced validation to prevent empty replies
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400);
        throw new Error('Reply text is required and cannot be empty');
    }
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
        res.status(400);
        throw new Error('Reply text cannot be only whitespace');
    }
    if (trimmedText.length > 1000) {
        res.status(400);
        throw new Error('Reply text cannot exceed 1000 characters');
    }
    // Find the review
    const review = await Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check if the user is the creator of this review
    if (review.creatorId.toString() !== creatorId.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this reply');
    }
    // Check if a reply exists
    if (!review.reply || !review.reply.text || review.reply.text.trim().length === 0) {
        res.status(400);
        throw new Error('No reply exists for this review');
    }
    // Update the reply
    review.reply.text = trimmedText;
    review.reply.createdAt = new Date(); // Update timestamp
    const updatedReview = await review.save();
    // Populate the brand information for the response
    await updatedReview.populate('brandId', 'fullName avatar username');
    res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
        review: updatedReview
    });
});
// @desc    Delete a reply to a review (creator only)
// @route   DELETE /api/reviews/:id/reply
// @access  Private (creator)
exports.deleteReviewReply = (0, express_async_handler_1.default)(async (req, res) => {
    const creatorId = req.user._id;
    // Find the review
    const review = await Review_1.default.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }
    // Check if the user is the creator of this review
    if (review.creatorId.toString() !== creatorId.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this reply');
    }
    // Check if a reply exists and is not empty
    if (!review.reply || !review.reply.text || review.reply.text.trim().length === 0) {
        res.status(400);
        throw new Error('No reply exists for this review');
    }
    // Remove the reply using $unset to properly remove the field from the database
    const updatedReview = await Review_1.default.findByIdAndUpdate(req.params.id, { $unset: { reply: 1 } }, { new: true });
    if (!updatedReview) {
        res.status(404);
        throw new Error('Review not found after update');
    }
    // Populate the brand information for the response
    await updatedReview.populate('brandId', 'fullName avatar username');
    res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
        review: updatedReview
    });
});
// @desc    Clean up empty reply objects from database (admin only)
// @route   POST /api/reviews/cleanup-empty-replies
// @access  Private (admin)
exports.cleanupEmptyReplies = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Find all reviews with empty or invalid reply objects
        const reviewsWithEmptyReplies = await Review_1.default.find({
            $or: [
                { reply: { $exists: true, $eq: null } },
                { 'reply.text': { $exists: true, $in: [null, '', ' ', undefined] } },
                { 'reply.text': { $exists: true, $regex: /^\s*$/ } } // Only whitespace
            ]
        });
        console.log(`Found ${reviewsWithEmptyReplies.length} reviews with empty replies`);
        // Remove empty reply objects
        const result = await Review_1.default.updateMany({
            $or: [
                { reply: { $exists: true, $eq: null } },
                { 'reply.text': { $exists: true, $in: [null, '', ' ', undefined] } },
                { 'reply.text': { $exists: true, $regex: /^\s*$/ } } // Only whitespace
            ]
        }, { $unset: { reply: 1 } });
        console.log(`Cleaned up ${result.modifiedCount} reviews with empty replies`);
        res.status(200).json({
            success: true,
            message: `Cleaned up ${result.modifiedCount} reviews with empty replies`,
            totalFound: reviewsWithEmptyReplies.length,
            totalCleaned: result.modifiedCount
        });
    }
    catch (error) {
        console.error('Error cleaning up empty replies:', error);
        res.status(500);
        throw new Error('Failed to clean up empty replies');
    }
});
// @desc    Get reviews by brand
// @route   GET /api/reviews/brand
// @access  Private (brand)
exports.getBrandReviews = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const brandId = req.user._id;
        console.log('Getting reviews for brand ID:', brandId);
        const reviews = await Review_1.default.find({ brandId })
            .populate('creatorId', 'fullName username avatar')
            .populate('orderId', 'orderID service packageName')
            .sort({ createdAt: -1 });
        console.log(`Found ${reviews.length} reviews for brand ${brandId}`);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('Error fetching reviews by brand ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});
// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public or Private (as needed)
exports.getAllReviews = (0, express_async_handler_1.default)(async (req, res) => {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 50;
    const reviews = await Review_1.default.find({})
        .populate('brandId', 'fullName avatar username')
        .populate('orderId', 'orderID service')
        .sort({ createdAt: -1 })
        .limit(limitNum);
    res.json({ success: true, data: { reviews, total: reviews.length } });
});
