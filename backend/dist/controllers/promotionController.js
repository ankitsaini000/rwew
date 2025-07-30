"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndUpdatePromotionStatuses = exports.publishPromotion = exports.getBrandPromotions = exports.deletePromotion = exports.updatePromotion = exports.getPromotionById = exports.getPromotions = exports.createPromotion = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
const User_1 = __importDefault(require("../models/User"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const Notification_1 = __importDefault(require("../models/Notification"));
/**
 * @desc    Create a new promotion
 * @route   POST /api/promotions
 * @access  Private (brands only)
 */
exports.createPromotion = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        console.log('Create promotion request received with body:', req.body);
        // Validate brand role
        if (req.user.role !== 'brand') {
            res.status(403);
            throw new Error('Only brands can create promotions');
        }
        // Extract data from request body
        const { title, description, budget, category, platform, deadline, promotionType, deliverables, tags, requirements, status = 'draft', } = req.body;
        // Validate required fields
        if (!title || !description || !budget || !category || !platform || !deadline || !promotionType) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }
        // Create new promotion
        const promotion = await Promotion_1.default.create({
            brandId: req.user._id,
            title,
            description,
            budget,
            category, // now an array
            platform,
            deadline: new Date(deadline),
            promotionType,
            deliverables: deliverables || [],
            tags: tags || [],
            requirements: requirements || '',
            status
        });
        if (promotion) {
            console.log('Promotion created successfully:', { promotionId: promotion._id });
            // Respond to the client immediately
            res.status(201).json({
                success: true,
                data: promotion
            });
            // Trigger notifications in the background (do not await)
            (async () => {
                try {
                    const matchingCreators = await CreatorProfile_1.CreatorProfile.find({
                        'professionalInfo.categories': { $in: promotion.category }
                    }).select('userId');
                    const brandUser = await User_1.default.findById(promotion.brandId).select('fullName username avatar');
                    const io = require('../sockets').getIO();
                    for (const creator of matchingCreators) {
                        // Create notification
                        const notification = await Notification_1.default.create({
                            user: creator.userId,
                            type: 'promotion',
                            message: `New promotion posted in your categories: ${promotion.title}`,
                            fromUser: promotion.brandId,
                            isRead: false
                        });
                        // Emit real-time notification
                        io.to(creator.userId.toString()).emit('newNotification', {
                            notification: Object.assign(Object.assign({}, notification.toObject()), { fromUser: {
                                    _id: promotion.brandId,
                                    fullName: (brandUser === null || brandUser === void 0 ? void 0 : brandUser.fullName) || (brandUser === null || brandUser === void 0 ? void 0 : brandUser.username) || 'Brand',
                                    avatar: (brandUser === null || brandUser === void 0 ? void 0 : brandUser.avatar) || null
                                } })
                        });
                        // Send email notification to creator
                        try {
                            const creatorUser = await User_1.default.findById(creator.userId).select('email fullName');
                            if (creatorUser && creatorUser.email) {
                                const sendEmail = require('../utils/sendEmail').default || require('../utils/sendEmail');
                                await sendEmail({
                                    email: creatorUser.email,
                                    subject: 'New Promotion Opportunity!',
                                    message: `Hi ${creatorUser.fullName || ''},<br><br>
                   A new promotion matching your categories has been posted: <b>${promotion.title}</b>.<br><br>
                   Description: ${promotion.description}<br><br>
                   <a href="http://localhost:3000/promotion/${promotion._id}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">View Promotion</a><br><br>
                   Or log in to your dashboard to view and apply.<br><br>
                   Best,<br>The Team`
                                });
                            }
                        }
                        catch (emailError) {
                            console.error('Failed to send promotion email notification:', emailError);
                        }
                    }
                    console.log(`Notified ${matchingCreators.length} creators about new promotion.`);
                }
                catch (notifyError) {
                    console.error('Error notifying creators about new promotion:', notifyError);
                }
            })();
            // End of background notification
            return;
        }
        else {
            console.log('Failed to create promotion - unknown error');
            res.status(400);
            throw new Error('Invalid promotion data');
        }
    }
    catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get all promotions
 * @route   GET /api/promotions
 * @access  Public
 */
exports.getPromotions = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build filter object
        const filter = { status: 'active' };
        // Apply category filter if provided
        if (req.query.category) {
            filter.category = req.query.category;
        }
        // Apply platform filter if provided
        if (req.query.platform) {
            filter.platform = req.query.platform;
        }
        // Apply tag filter if provided
        if (req.query.tag) {
            filter.tags = req.query.tag;
        }
        // Count total documents for pagination
        const total = await Promotion_1.default.countDocuments(filter);
        // Get promotions
        const promotions = await Promotion_1.default.find(filter)
            .populate('brandId', 'fullName username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        console.log(`Returning ${promotions.length} promotions for page ${page}`);
        res.status(200).json({
            success: true,
            data: promotions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error getting promotions:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get a single promotion by ID
 * @route   GET /api/promotions/:id
 * @access  Public
 */
exports.getPromotionById = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const promotionId = req.params.id;
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Find promotion
        const promotion = await Promotion_1.default.findById(promotionId)
            .populate('brandId', 'fullName username avatar');
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        res.status(200).json({
            success: true,
            data: promotion
        });
    }
    catch (error) {
        console.error('Error getting promotion:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Update a promotion
 * @route   PUT /api/promotions/:id
 * @access  Private (brand owner only)
 */
exports.updatePromotion = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const promotionId = req.params.id;
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Find promotion
        const promotion = await Promotion_1.default.findById(promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        // Check if user owns the promotion
        if (promotion.brandId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this promotion');
        }
        // Update promotion
        const updatedPromotion = await Promotion_1.default.findByIdAndUpdate(promotionId, req.body, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedPromotion
        });
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Delete a promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private (brand owner only)
 */
exports.deletePromotion = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const promotionId = req.params.id;
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Find promotion
        const promotion = await Promotion_1.default.findById(promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        // Check if user owns the promotion
        if (promotion.brandId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this promotion');
        }
        // Delete promotion
        await Promotion_1.default.findByIdAndDelete(promotionId);
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get promotions by brand ID
 * @route   GET /api/promotions/brand
 * @access  Private (brand only)
 */
exports.getBrandPromotions = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Optional status filter
        const filter = { brandId: req.user._id };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // Count total documents for pagination
        const total = await Promotion_1.default.countDocuments(filter);
        // Get promotions
        const promotions = await Promotion_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            data: promotions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error getting brand promotions:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Publish a promotion (change status to active)
 * @route   PUT /api/promotions/:id/publish
 * @access  Private (brand owner only)
 */
exports.publishPromotion = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const promotionId = req.params.id;
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Find promotion
        const promotion = await Promotion_1.default.findById(promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        // Check if user owns the promotion
        if (promotion.brandId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to publish this promotion');
        }
        // Update promotion status to active
        const publishedPromotion = await Promotion_1.default.findByIdAndUpdate(promotionId, { status: 'active' }, { new: true });
        res.status(200).json({
            success: true,
            data: publishedPromotion
        });
    }
    catch (error) {
        console.error('Error publishing promotion:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Check and update promotion statuses based on deadlines
 * @route   Not directly exposed as API - for internal use
 * @access  Private (system only)
 */
const checkAndUpdatePromotionStatuses = async () => {
    try {
        console.log('Running scheduled task to check promotion deadlines');
        // Get current date
        const now = new Date();
        // Find all active promotions with deadlines in the past
        const expiredPromotions = await Promotion_1.default.find({
            status: 'active',
            deadline: { $lt: now }
        });
        console.log(`Found ${expiredPromotions.length} expired promotions to close`);
        // Update each expired promotion to 'closed' status
        const updatePromises = expiredPromotions.map(promotion => Promotion_1.default.findByIdAndUpdate(promotion._id, { status: 'closed' }, { new: true }));
        // Wait for all updates to complete
        const updatedPromotions = await Promise.all(updatePromises);
        console.log('Successfully closed expired promotions:', updatedPromotions
            .filter(p => p !== null)
            .map(p => ({ id: p._id, title: p.title })));
        return {
            success: true,
            closedCount: updatedPromotions.length,
            promotions: updatedPromotions
        };
    }
    catch (error) {
        console.error('Error checking and updating promotion statuses:', error);
        throw error;
    }
};
exports.checkAndUpdatePromotionStatuses = checkAndUpdatePromotionStatuses;
