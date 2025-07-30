"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationById = exports.getCreatorApplications = exports.updateApplicationStatus = exports.getPromotionApplications = exports.applyToPromotion = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const PromotionApplication_1 = __importDefault(require("../models/PromotionApplication"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const User_1 = __importDefault(require("../models/User"));
/**
 * @desc    Apply to a promotion
 * @route   POST /api/promotion-applications
 * @access  Private (creators only)
 */
exports.applyToPromotion = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        console.log('Application request received with body:', req.body);
        // Validate creator role
        if (req.user.role !== 'creator') {
            res.status(403);
            throw new Error('Only creators can apply to promotions');
        }
        // Extract data from request body
        const { promotionId, message, proposedRate, availability, deliverables, portfolio } = req.body;
        // Validate required fields
        if (!promotionId || !message || !proposedRate || !availability) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Check if promotion exists and is active
        const promotion = await Promotion_1.default.findById(promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        if (promotion.status !== 'active') {
            res.status(400);
            throw new Error('This promotion is not currently accepting applications');
        }
        // Check if creator has already applied to this promotion
        const existingApplication = await PromotionApplication_1.default.findOne({
            promotionId,
            creatorId: req.user._id
        });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this promotion'
            });
        }
        // Create new application
        const application = await PromotionApplication_1.default.create({
            promotionId,
            creatorId: req.user._id,
            message,
            proposedRate,
            availability,
            deliverables: deliverables || '',
            portfolio: portfolio || [],
            status: 'pending'
        });
        if (application) {
            console.log('Application created successfully:', { applicationId: application._id });
            // Add application to promotion's applications array
            await Promotion_1.default.findByIdAndUpdate(promotionId, { $push: { applications: application._id } });
            res.status(201).json({
                success: true,
                data: application
            });
            // Notify the brand (in-app and email) in the background
            (async () => {
                try {
                    // Get the promotion and brand user
                    const promotion = await Promotion_1.default.findById(promotionId);
                    if (!promotion)
                        return;
                    const brandUser = await User_1.default.findById(promotion.brandId).select('email fullName');
                    // Get creator info
                    const creatorUser = await User_1.default.findById(req.user._id).select('fullName');
                    // In-app notification
                    const Notification = require('../models/Notification').default || require('../models/Notification');
                    const notification = await Notification.create({
                        user: promotion.brandId,
                        type: 'promotion',
                        message: `${(creatorUser === null || creatorUser === void 0 ? void 0 : creatorUser.fullName) || 'A creator'} applied to your promotion: ${promotion.title}`,
                        fromUser: req.user._id,
                        isRead: false
                    });
                    console.log('Notification created for brand:', notification);
                    // Email notification
                    if (brandUser && brandUser.email) {
                        const sendEmail = require('../utils/sendEmail').default || require('../utils/sendEmail');
                        await sendEmail({
                            email: brandUser.email,
                            subject: 'New Application for Your Promotion',
                            message: `Hi ${brandUser.fullName || ''},<br><br>
                ${(creatorUser === null || creatorUser === void 0 ? void 0 : creatorUser.fullName) || 'A creator'} has applied to your promotion: <b>${promotion.title}</b>.<br><br>
                <a href="http://localhost:3000/promotion/${promotion._id}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">View Promotion</a><br><br>
                Log in to your dashboard to review and respond.<br><br>
                Best,<br>The Team`
                        });
                    }
                }
                catch (notifyError) {
                    console.error('Error notifying brand about new application:', notifyError);
                }
            })();
            return;
        }
        else {
            console.log('Failed to create application - unknown error');
            res.status(400);
            throw new Error('Invalid application data');
        }
    }
    catch (error) {
        console.error('Error creating application:', error);
        // Handle duplicate key error (already applied)
        if (error.code === 11000) {
            res.status(400);
            throw new Error('You have already applied to this promotion');
        }
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get applications for a promotion
 * @route   GET /api/promotion-applications/promotion/:promotionId
 * @access  Private (brand owner only)
 */
exports.getPromotionApplications = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { promotionId } = req.params;
        // Debug logging
        console.log('getPromotionApplications: req.user =', req.user);
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(promotionId)) {
            res.status(400);
            throw new Error('Invalid promotion ID format');
        }
        // Check if promotion exists and belongs to the requesting brand or user is admin
        const promotion = await Promotion_1.default.findById(promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Promotion not found');
        }
        console.log('getPromotionApplications: promotion.brandId =', promotion.brandId);
        // Allow admin users to view all applicants
        if (req.user.role !== 'admin' && promotion.brandId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view applications for this promotion');
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Optional status filter
        const filter = { promotionId };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // Count total documents for pagination
        const total = await PromotionApplication_1.default.countDocuments(filter);
        // Get applications with populated creator profile data
        const applications = await PromotionApplication_1.default.find(filter)
            .populate({
            path: 'creatorId',
            select: 'fullName username avatar _id',
            options: { lean: true }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Get creator profiles for these users
        const creatorIds = applications.map(app => app.creatorId._id);
        const creatorProfiles = await CreatorProfile_1.CreatorProfile.find({
            userId: { $in: creatorIds }
        }).lean();
        // Create a lookup map for faster access
        const profileMap = {};
        creatorProfiles.forEach(profile => {
            if (profile.userId) {
                profileMap[profile.userId.toString()] = profile;
            }
        });
        // Merge creator profile data with applications
        const enhancedApplications = applications.map(app => {
            // Convert to plain object for manipulation
            const appObj = app.toObject ? app.toObject() : app;
            // Handle type casting for TypeScript
            const creatorId = appObj.creatorId;
            const userId = creatorId._id.toString();
            if (profileMap[userId]) {
                // Add profile data to the creatorId object
                creatorId.personalInfo = profileMap[userId].personalInfo;
            }
            return appObj;
        });
        res.status(200).json({
            success: true,
            data: enhancedApplications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error getting promotion applications:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Update application status (accept/reject)
 * @route   PUT /api/promotion-applications/:id/status
 * @access  Private (brand owner only)
 */
exports.updateApplicationStatus = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate status value
        if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
            res.status(400);
            throw new Error('Invalid status value');
        }
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid application ID format');
        }
        // Get application
        const application = await PromotionApplication_1.default.findById(id);
        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }
        // Check if user owns the promotion
        const promotion = await Promotion_1.default.findById(application.promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Associated promotion not found');
        }
        if (promotion.brandId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this application');
        }
        // Update application status
        const updatedApplication = await PromotionApplication_1.default.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({
            success: true,
            data: updatedApplication
        });
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get creator's applications
 * @route   GET /api/promotion-applications/creator
 * @access  Private (creator only)
 */
exports.getCreatorApplications = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Validate creator role
        if (req.user.role !== 'creator') {
            res.status(403);
            throw new Error('Only creators can access their applications');
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Optional status filter
        const filter = { creatorId: req.user._id };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // Count total documents for pagination
        const total = await PromotionApplication_1.default.countDocuments(filter);
        // Get applications
        const applications = await PromotionApplication_1.default.find(filter)
            .populate({
            path: 'promotionId',
            select: 'title budget platform deadline status',
            populate: {
                path: 'brandId',
                select: 'fullName username avatar'
            }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            data: applications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error getting creator applications:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
/**
 * @desc    Get a single application by ID
 * @route   GET /api/promotion-applications/:id
 * @access  Private (brand owner or application creator)
 */
exports.getApplicationById = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { id } = req.params;
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid application ID format');
        }
        // Get application with populated fields
        const application = await PromotionApplication_1.default.findById(id)
            .populate('creatorId', 'fullName username avatar')
            .populate({
            path: 'promotionId',
            populate: {
                path: 'brandId',
                select: 'fullName username avatar'
            }
        });
        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }
        // Check if user is authorized (brand owner or the creator)
        const promotion = await Promotion_1.default.findById(application.promotionId);
        if (!promotion) {
            res.status(404);
            throw new Error('Associated promotion not found');
        }
        const isCreator = application.creatorId._id.toString() === req.user._id.toString();
        const isBrandOwner = promotion.brandId.toString() === req.user._id.toString();
        if (!isCreator && !isBrandOwner) {
            res.status(403);
            throw new Error('Not authorized to view this application');
        }
        // Get creator profile information
        const creatorProfile = await CreatorProfile_1.CreatorProfile.findOne({
            userId: application.creatorId._id
        }).lean();
        // Convert to a manipulable object
        const responseData = application.toObject();
        // Add creator profile data if available
        if (creatorProfile) {
            responseData.creatorId.personalInfo = creatorProfile.personalInfo;
        }
        res.status(200).json({
            success: true,
            data: responseData
        });
    }
    catch (error) {
        console.error('Error getting application:', error);
        res.status(500);
        throw new Error('Server error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
});
