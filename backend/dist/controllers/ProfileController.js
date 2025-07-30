"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const BrandProfile_1 = __importDefault(require("../models/BrandProfile"));
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgzcfva4b',
    api_key: process.env.CLOUDINARY_API_KEY || '324744317225964',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mY31tPtm4lWqz33zLKK8b_JhH2w'
});
class ProfileController {
    // Update Creator Profile
    async updateCreatorProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Check if user exists and is a creator
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.role !== 'creator') {
                return res.status(403).json({ message: 'Only creators can update creator profiles' });
            }
            // Check if profile exists
            let profile = await CreatorProfile_1.CreatorProfile.findOne({ userId });
            // Prepare update data
            const updateData = Object.assign(Object.assign({}, req.body), { userId // Ensure userId is not overwritten
             });
            // Remove any undefined or null values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === null) {
                    delete updateData[key];
                }
            });
            if (profile) {
                // Update existing profile
                try {
                    profile = await CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId }, { $set: updateData }, {
                        new: true,
                        runValidators: true,
                        context: 'query'
                    });
                    if (!profile) {
                        throw new Error('Profile update failed');
                    }
                }
                catch (updateError) {
                    console.error('Validation error during profile update:', updateError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid profile data',
                        error: updateError instanceof Error ? updateError.message : 'Unknown validation error'
                    });
                }
            }
            else {
                // Create new profile
                try {
                    profile = await CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId }, { $setOnInsert: Object.assign({}, updateData) }, { new: true, upsert: true, runValidators: true, context: 'query' });
                }
                catch (createError) {
                    console.error('Validation error during profile creation:', createError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid profile data',
                        error: createError instanceof Error ? createError.message : 'Unknown validation error'
                    });
                }
            }
            return res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error updating creator profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not update creator profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update Brand Profile
    async updateBrandProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // Check if user exists and is a brand
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.role !== 'brand') {
                return res.status(403).json({ message: 'Only brands can update brand profiles' });
            }
            // Check if profile exists
            let profile = await BrandProfile_1.default.findOne({ userId });
            if (profile) {
                // Update existing profile
                profile = await BrandProfile_1.default.findOneAndUpdate({ userId }, Object.assign({}, req.body), { new: true, runValidators: true });
            }
            else {
                // Create new profile
                profile = await BrandProfile_1.default.create(Object.assign({ userId }, req.body));
            }
            return res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error updating brand profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not update brand profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get Creator Profile by userId
    async getCreatorProfile(req, res) {
        try {
            const { userId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }
            const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId }).populate('userId', 'username email');
            if (!profile) {
                return res.status(404).json({ message: 'Creator profile not found' });
            }
            return res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error fetching creator profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not fetch creator profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get Brand Profile by userId
    async getBrandProfile(req, res) {
        try {
            const { userId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'Invalid user ID' });
            }
            const profile = await BrandProfile_1.default.findOne({ userId }).populate('userId', 'username email');
            if (!profile) {
                return res.status(404).json({ message: 'Brand profile not found' });
            }
            return res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error fetching brand profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not fetch brand profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get current user's profile (works for both creator and brand)
    async getCurrentUserProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            let profile;
            if (user.role === 'creator') {
                profile = await CreatorProfile_1.CreatorProfile.findOne({ userId });
            }
            else if (user.role === 'brand') {
                profile = await BrandProfile_1.default.findOne({ userId });
            }
            else {
                return res.status(400).json({ message: 'User does not have a valid role' });
            }
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} profile not found`
                });
            }
            return res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error fetching current user profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not fetch profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Upload profile image
    async uploadProfileImage(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { imageType } = req.body;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Validate image type
            if (!['profileImage', 'coverImage'].includes(imageType)) {
                return res.status(400).json({ message: 'Invalid image type' });
            }
            // Get the Cloudinary URL directly from req.file.path
            const imageUrl = req.file.path;
            // Check if user exists
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            let profile;
            const updateField = imageType === 'profileImage' ? 'profileImage' : 'coverImage';
            if (user.role === 'creator') {
                profile = await CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId }, { [updateField]: imageUrl }, { new: true });
                if (!profile) {
                    profile = await CreatorProfile_1.CreatorProfile.create({
                        userId,
                        [updateField]: imageUrl
                    });
                }
            }
            else if (user.role === 'brand') {
                profile = await BrandProfile_1.default.findOneAndUpdate({ userId }, { [updateField]: imageUrl }, { new: true });
                if (!profile) {
                    profile = await BrandProfile_1.default.create({
                        userId,
                        [updateField]: imageUrl
                    });
                }
            }
            else {
                return res.status(400).json({ message: 'User does not have a valid role' });
            }
            return res.status(200).json({
                success: true,
                data: {
                    imageUrl,
                    profile
                }
            });
        }
        catch (error) {
            console.error('Error uploading profile image:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not upload profile image',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete profile
    async deleteProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await User_1.default.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            let deletedProfile;
            if (user.role === 'creator') {
                deletedProfile = await CreatorProfile_1.CreatorProfile.findOneAndDelete({ userId });
            }
            else if (user.role === 'brand') {
                deletedProfile = await BrandProfile_1.default.findOneAndDelete({ userId });
            }
            else {
                return res.status(400).json({ message: 'User does not have a valid role' });
            }
            if (!deletedProfile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            return res.status(200).json({
                success: true,
                message: 'Profile deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Could not delete profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.default = new ProfileController();
