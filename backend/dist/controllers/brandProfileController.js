"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateBrandProfile = exports.deactivateBrandProfile = exports.getPublicBrandProfile = exports.createOrUpdateBrandProfile = exports.getBrandProfile = exports.getAllBrandProfiles = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BrandProfile_1 = __importDefault(require("../models/BrandProfile"));
const User_1 = __importDefault(require("../models/User")); // Assuming User model is needed for userId
// @desc    Get brand profile
// @route   GET /api/brand-profiles
// @access  Private (Brand User)
const getBrandProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming req.user is populated by auth middleware
    if (!userId) {
        res.status(401);
        throw new Error('Not authorized, no user ID');
    }
    const brandProfile = await BrandProfile_1.default.findOne({ userId });
    if (!brandProfile) {
        res.status(404);
        throw new Error('Brand profile not found');
    }
    // --- Add total spend calculation ---
    // Import Order at the top if not already: import Order from '../models/Order';
    const Order = require('../models/Order').default || require('../models/Order');
    // Get all orders for this brand - try different fields
    const ordersByClient = await Order.find({ client: userId });
    const ordersByUser = await Order.find({ user: userId });
    const orders = ordersByClient.length > 0 ? ordersByClient : ordersByUser;
    const totalSpend = orders.reduce((sum, order) => {
        const orderAmount = order.totalAmount || order.amount || 0;
        return sum + orderAmount;
    }, 0);
    // Attach totalSpend to metrics
    const profileObj = brandProfile.toObject();
    if (!profileObj.metrics) {
        profileObj.metrics = {
            profileViews: 0,
            totalCampaigns: 0,
            totalCreators: 0,
            averageRating: 0,
            followersCount: 0,
        };
    }
    profileObj.metrics.totalSpend = totalSpend;
    res.status(200).json(profileObj);
});
exports.getBrandProfile = getBrandProfile;
// @desc    Create or update brand profile
// @route   POST /api/brand-profiles
// @access  Private (Brand User)
const createOrUpdateBrandProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming req.user is populated by auth middleware
    const { name, username, about, establishedYear, industry, website, location, contactInfo, socialMedia, brandValues, profileImage, coverImage, isVerified, metrics, openToNetworking, openToAdvising, marketingInterests } = req.body;
    if (!userId) {
        res.status(401);
        throw new Error('Not authorized, no user ID');
    }
    let brandProfile = await BrandProfile_1.default.findOne({ userId });
    if (brandProfile) {
        // Update existing profile
        brandProfile.name = name || brandProfile.name;
        brandProfile.username = username || brandProfile.username;
        brandProfile.about = about || brandProfile.about;
        brandProfile.establishedYear = establishedYear || brandProfile.establishedYear;
        brandProfile.industry = industry || brandProfile.industry;
        brandProfile.website = website || brandProfile.website;
        brandProfile.location = location ? Object.assign(Object.assign({}, brandProfile.location), location) : brandProfile.location;
        brandProfile.contactInfo = contactInfo ? Object.assign(Object.assign({}, brandProfile.contactInfo), contactInfo) : brandProfile.contactInfo;
        brandProfile.socialMedia = socialMedia ? Object.assign(Object.assign({}, brandProfile.socialMedia), socialMedia) : brandProfile.socialMedia;
        brandProfile.brandValues = brandValues || brandProfile.brandValues;
        brandProfile.profileImage = profileImage || brandProfile.profileImage;
        brandProfile.coverImage = coverImage || brandProfile.coverImage;
        brandProfile.isVerified = typeof isVerified === 'boolean' ? isVerified : brandProfile.isVerified;
        brandProfile.metrics = metrics ? Object.assign(Object.assign({}, brandProfile.metrics), metrics) : brandProfile.metrics;
        brandProfile.openToNetworking = typeof openToNetworking === 'boolean' ? openToNetworking : brandProfile.openToNetworking;
        brandProfile.openToAdvising = typeof openToAdvising === 'boolean' ? openToAdvising : brandProfile.openToAdvising;
        brandProfile.marketingInterests = marketingInterests || brandProfile.marketingInterests;
        const updatedProfile = await brandProfile.save();
        res.status(200).json(updatedProfile);
    }
    else {
        // Create new profile
        if (!name || !username) {
            res.status(400);
            throw new Error('Please add all required fields: name and username');
        }
        const newProfile = await BrandProfile_1.default.create({
            userId,
            name,
            username,
            about,
            establishedYear,
            industry,
            website,
            location,
            contactInfo,
            socialMedia,
            brandValues,
            profileImage,
            coverImage,
            isVerified,
            metrics,
            openToNetworking,
            openToAdvising,
            marketingInterests,
        });
        res.status(201).json(newProfile);
    }
});
exports.createOrUpdateBrandProfile = createOrUpdateBrandProfile;
// @desc    Get brand profile by username (public)
// @route   GET /api/brand-profiles/:username
// @access  Public
const getPublicBrandProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        const { username } = req.params;
        // Find brand profile by username
        const brandProfile = await BrandProfile_1.default.findOne({ username }).populate('userId', 'fullName');
        if (!brandProfile) {
            res.status(404);
            throw new Error('Brand profile not found');
        }
        // --- Add total spend calculation for public view ---
        const Order = require('../models/Order').default || require('../models/Order');
        const BrandVerification = require('../models/BrandVerification').default || require('../models/BrandVerification');
        const userId = ((_a = brandProfile.userId) === null || _a === void 0 ? void 0 : _a._id) || brandProfile.userId;
        const ordersByClient = await Order.find({ client: userId });
        const ordersByUser = await Order.find({ user: userId });
        const orders = ordersByClient.length > 0 ? ordersByClient : ordersByUser;
        const totalSpend = orders.reduce((sum, order) => {
            const orderAmount = order.totalAmount || order.amount || 0;
            return sum + orderAmount;
        }, 0);
        // Calculate completed orders
        const completedOrders = orders.filter((order) => order.status === 'completed').length;
        const profileObj = brandProfile.toObject();
        if (!profileObj.metrics) {
            profileObj.metrics = {
                profileViews: 0,
                totalCampaigns: 0,
                totalCreators: 0,
                averageRating: 0,
                followersCount: 0,
            };
        }
        profileObj.metrics.totalSpend = totalSpend;
        profileObj.metrics.completedOrders = completedOrders;
        // Calculate average response time (in hours) for the brand
        let avgResponseTime = null;
        try {
            const Message = require('../models/Message').default || require('../models/Message');
            // Find all messages where the brand is the receiver (client)
            const messages = await Message.find({ receiver: userId }).sort({ createdAt: 1 });
            if (messages.length > 0) {
                // For each conversation, find the first message from a creator and the first reply from the brand
                const responseTimes = [];
                const convMap = new Map();
                messages.forEach((msg) => {
                    var _a;
                    const convId = (_a = msg.conversation) === null || _a === void 0 ? void 0 : _a.toString();
                    if (!convId)
                        return;
                    if (!convMap.has(convId))
                        convMap.set(convId, []);
                    convMap.get(convId).push(msg);
                });
                convMap.forEach((msgs) => {
                    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    let firstCreatorMsg = null;
                    let firstBrandReply = null;
                    for (let i = 0; i < msgs.length; i++) {
                        if (!firstCreatorMsg && msgs[i].sender.toString() !== userId.toString()) {
                            firstCreatorMsg = msgs[i];
                        }
                        if (firstCreatorMsg && msgs[i].sender.toString() === userId.toString() && new Date(msgs[i].createdAt).getTime() > new Date(firstCreatorMsg.createdAt).getTime()) {
                            firstBrandReply = msgs[i];
                            break;
                        }
                    }
                    if (firstCreatorMsg && firstBrandReply) {
                        const diffMs = new Date(firstBrandReply.createdAt).getTime() - new Date(firstCreatorMsg.createdAt).getTime();
                        const diffHours = diffMs / (1000 * 60 * 60);
                        if (diffHours >= 0 && diffHours < 168)
                            responseTimes.push(diffHours);
                    }
                });
                if (responseTimes.length > 0) {
                    avgResponseTime = Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10;
                }
            }
        }
        catch (e) {
            avgResponseTime = null;
        }
        profileObj.metrics.responseTime = avgResponseTime;
        // --- Add phone and payment verification status for public view ---
        const verification = await BrandVerification.findOne({ userId });
        if (verification) {
            profileObj.verificationStatus = {
                phone: verification.phone,
                payment: verification.payment
            };
        }
        res.status(200).json({
            success: true,
            data: profileObj,
        });
    }
    catch (error) {
        console.error('Error fetching public brand profile:', error);
        res.status(500);
        throw new Error('Server error fetching brand profile');
    }
});
exports.getPublicBrandProfile = getPublicBrandProfile;
// @desc    Deactivate brand profile (admin only)
// @route   PUT /api/brand-profiles/:id/deactivate
// @access  Private (Admin only)
const deactivateBrandProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const brandId = req.params.id;
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
    const brandProfile = await BrandProfile_1.default.findById(brandId);
    if (!brandProfile) {
        res.status(404);
        throw new Error('Brand profile not found');
    }
    brandProfile.status = 'inactive';
    await brandProfile.save();
    // Also deactivate the associated user
    if (brandProfile.userId) {
        await User_1.default.findByIdAndUpdate(brandProfile.userId, { isActive: false });
    }
    res.json({ success: true, message: 'Brand account deactivated' });
});
exports.deactivateBrandProfile = deactivateBrandProfile;
// @desc    Reactivate brand profile (admin only)
// @route   PUT /api/brand-profiles/:id/reactivate
// @access  Private (Admin only)
const reactivateBrandProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const brandId = req.params.id;
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
    const brandProfile = await BrandProfile_1.default.findById(brandId);
    if (!brandProfile) {
        res.status(404);
        throw new Error('Brand profile not found');
    }
    brandProfile.status = 'active';
    await brandProfile.save();
    // Also reactivate the associated user
    if (brandProfile.userId) {
        await User_1.default.findByIdAndUpdate(brandProfile.userId, { isActive: true });
    }
    res.json({ success: true, message: 'Brand account reactivated' });
});
exports.reactivateBrandProfile = reactivateBrandProfile;
// @desc    Get all brand profiles (admin use)
// @route   GET /api/brand-profiles/all
// @access  Public or Admin (adjust as needed)
exports.getAllBrandProfiles = (0, express_async_handler_1.default)(async (req, res) => {
    const brands = await BrandProfile_1.default.find();
    res.status(200).json({ count: brands.length, data: brands });
});
