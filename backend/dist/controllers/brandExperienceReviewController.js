"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandExperienceReviewByOrder = exports.getBrandExperienceReviews = exports.createBrandExperienceReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BrandExperienceReview_1 = __importDefault(require("../models/BrandExperienceReview"));
const Order_1 = __importDefault(require("../models/Order"));
const BrandProfile_1 = __importDefault(require("../models/BrandProfile"));
// Helper to update brand's average rating
async function updateBrandAverageRating(brandId) {
    const reviews = await BrandExperienceReview_1.default.find({ brandId });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = reviews.length ? total / reviews.length : 0;
    await BrandProfile_1.default.findOneAndUpdate({ userId: brandId }, { 'metrics.averageRating': avg }, { new: true });
}
// POST /api/brand-experience-reviews
// Creator rates brand for an order
exports.createBrandExperienceReview = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const creatorId = req.user._id;
    // Find order and check status
    const order = await Order_1.default.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }
    if (order.status !== 'completed') {
        res.status(400);
        throw new Error('You can only review completed orders');
    }
    if (order.creator.toString() !== creatorId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to review this order');
    }
    // Check if review already exists
    const existing = await BrandExperienceReview_1.default.findOne({ orderId });
    if (existing) {
        res.status(400);
        throw new Error('You have already reviewed this brand for this order');
    }
    // Create review
    const review = await BrandExperienceReview_1.default.create({
        orderId,
        creatorId,
        brandId: order.client, // assuming client is the brand
        rating,
        comment
    });
    await updateBrandAverageRating(order.client.toString());
    res.status(201).json({ success: true, data: review });
});
// GET /api/brand-experience-reviews/brand/:brandId
exports.getBrandExperienceReviews = (0, express_async_handler_1.default)(async (req, res) => {
    const { brandId } = req.params;
    const reviews = await BrandExperienceReview_1.default.find({ brandId })
        .sort({ createdAt: -1 })
        .populate('creatorId', 'fullName username avatar');
    res.json({ success: true, data: reviews });
});
// GET /api/brand-experience-reviews/order/:orderId
exports.getBrandExperienceReviewByOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { orderId } = req.params;
    const review = await BrandExperienceReview_1.default.findOne({ orderId });
    if (!review) {
        res.status(404).json({ success: false, message: 'No review found' });
        return;
    }
    res.json({ success: true, data: review });
});
