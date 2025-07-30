"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfLiked = exports.getLikedCreators = exports.unlikeCreator = exports.likeCreator = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Like_1 = __importDefault(require("../models/Like"));
const CreatorProfile_1 = require("../models/CreatorProfile");
/**
 * @desc    Like a creator profile
 * @route   POST /api/likes
 * @access  Private
 */
exports.likeCreator = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        const { creatorId } = req.body;
        console.log('Like creator request received', {
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            creatorId,
            body: req.body
        });
        if (!creatorId) {
            res.status(400);
            throw new Error('Creator ID is required');
        }
        // Validate MongoDB ID format
        if (!mongoose_1.default.isValidObjectId(creatorId)) {
            console.error('Invalid creator ID format:', creatorId);
            res.status(400);
            throw new Error('Invalid creator ID format');
        }
        // Validate if creator exists
        const creatorExists = await CreatorProfile_1.CreatorProfile.findById(creatorId);
        if (!creatorExists) {
            console.error('Creator not found:', creatorId);
            res.status(404);
            throw new Error('Creator not found');
        }
        // Check if already liked
        const existingLike = await Like_1.default.findOne({
            userId: req.user._id,
            creatorId
        });
        if (existingLike) {
            console.log('Creator already liked', {
                likeId: existingLike._id,
                userId: req.user._id,
                creatorId
            });
            // If already liked, return the existing like
            res.status(200).json({
                success: true,
                message: 'Already liked this creator',
                data: existingLike
            });
            return;
        }
        // Create new like
        console.log('Creating new like', { userId: req.user._id, creatorId });
        const like = await Like_1.default.create({
            userId: req.user._id,
            creatorId
        });
        console.log('Like created successfully', { likeId: like._id });
        res.status(201).json({
            success: true,
            message: 'Creator liked successfully',
            data: like
        });
    }
    catch (error) {
        console.error('Error liking creator:', error);
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            res.status(400);
            throw new Error('Invalid like data: ' + error.message);
        }
        else if (error.code === 11000) {
            // Duplicate key error (already liked)
            res.status(400);
            throw new Error('You have already liked this creator');
        }
        else {
            res.status(500);
            throw new Error('Server error liking creator');
        }
    }
});
/**
 * @desc    Unlike a creator profile
 * @route   DELETE /api/likes/:creatorId
 * @access  Private
 */
exports.unlikeCreator = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { creatorId } = req.params;
        // Check if like exists
        const like = await Like_1.default.findOne({
            userId: req.user._id,
            creatorId
        });
        if (!like) {
            res.status(404);
            throw new Error('Like not found');
        }
        // Delete the like
        await like.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Creator unliked successfully'
        });
        return;
    }
    catch (error) {
        console.error('Error unliking creator:', error);
        res.status(500);
        throw new Error('Server error unliking creator');
    }
});
/**
 * @desc    Get all creators liked by the user
 * @route   GET /api/likes
 * @access  Private
 */
exports.getLikedCreators = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        // Find all likes by user
        const likes = await Like_1.default.find({ userId: req.user._id })
            .populate({
            path: 'creatorId',
            select: '-__v',
            populate: {
                path: 'userId',
                select: 'fullName username avatar'
            }
        })
            .sort({ createdAt: -1 });
        // Map to format expected by frontend
        const likedCreators = likes.map(like => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const creator = like.creatorId;
            const user = creator.userId;
            return {
                id: creator._id,
                fullName: (user === null || user === void 0 ? void 0 : user.fullName) || 'Creator',
                username: (user === null || user === void 0 ? void 0 : user.username) || ((_a = creator.personalInfo) === null || _a === void 0 ? void 0 : _a.username) || '',
                avatar: (user === null || user === void 0 ? void 0 : user.avatar) || ((_b = creator.personalInfo) === null || _b === void 0 ? void 0 : _b.profileImage) || '',
                category: ((_c = creator.professionalInfo) === null || _c === void 0 ? void 0 : _c.category) || '',
                description: ((_d = creator.descriptionFaq) === null || _d === void 0 ? void 0 : _d.briefDescription) || '',
                level: ((_e = creator.professionalInfo) === null || _e === void 0 ? void 0 : _e.title) || 'Creator',
                startingPrice: ((_g = (_f = creator.pricing) === null || _f === void 0 ? void 0 : _f.basic) === null || _g === void 0 ? void 0 : _g.price) ? `₹${creator.pricing.basic.price}` : 'Contact for price',
                rating: ((_j = (_h = creator.metrics) === null || _h === void 0 ? void 0 : _h.ratings) === null || _j === void 0 ? void 0 : _j.average) || 0,
                reviews: ((_l = (_k = creator.metrics) === null || _k === void 0 ? void 0 : _k.ratings) === null || _l === void 0 ? void 0 : _l.count) || 0,
                isLiked: true
            };
        });
        res.status(200).json({
            success: true,
            count: likes.length,
            data: likedCreators
        });
        return;
    }
    catch (error) {
        console.error('Error getting liked creators:', error);
        res.status(500);
        throw new Error('Server error getting liked creators');
    }
});
/**
 * @desc    Check if user has liked a creator
 * @route   GET /api/likes/:creatorId
 * @access  Private
 */
exports.checkIfLiked = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { creatorId } = req.params;
        const like = await Like_1.default.findOne({
            userId: req.user._id,
            creatorId
        });
        res.status(200).json({
            success: true,
            isLiked: !!like
        });
        return;
    }
    catch (error) {
        console.error('Error checking like status:', error);
        res.status(500);
        throw new Error('Server error checking like status');
    }
});
