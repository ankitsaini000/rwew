"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomQuoteRequest_1 = __importDefault(require("../models/CustomQuoteRequest"));
const User_1 = __importDefault(require("../models/User")); // Assuming User model is available for creatorId
const Notification_1 = __importDefault(require("../models/Notification"));
const sockets_1 = require("../sockets");
const mongoose_1 = require("mongoose");
class CustomQuoteRequestController {
    /**
     * @route POST /api/custom-quotes
     * @desc Create a new custom quote request
     * @access Private (Brand users)
     */
    async createCustomQuoteRequest(req, res) {
        var _a, _b, _c;
        try {
            // Ensure the requesting user is a brand
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'brand') {
                return res.status(403).json({ message: 'Access denied. Only brands can request custom quotes.' });
            }
            const { creatorId, promotionType, campaignObjective, platformPreference, contentFormat, contentGuidelines, attachments, audienceTargeting, timeline, budget, additionalNotes, isPrivateEvent, eventDetails } = req.body;
            // Basic validation
            if (!creatorId || !promotionType || !campaignObjective || !contentGuidelines || !timeline || !budget) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }
            // Validate private event data if isPrivateEvent is true
            if (isPrivateEvent) {
                if (!(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.eventName) || !(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.eventType) || !(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.eventDate) ||
                    !(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.eventLocation) || !(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.expectedAttendance) || !(eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.eventDescription)) {
                    return res.status(400).json({ message: 'Missing required private event details.' });
                }
            }
            // Check if creator exists
            const creator = await User_1.default.findById(creatorId);
            if (!creator) {
                return res.status(404).json({ message: 'Creator not found.' });
            }
            const newRequest = new CustomQuoteRequest_1.default({
                requesterId: req.user._id, // ID of the logged-in brand user
                creatorId,
                promotionType,
                campaignObjective,
                platformPreference: platformPreference || [],
                contentFormat: contentFormat || [],
                contentGuidelines,
                attachments: attachments || [],
                audienceTargeting: audienceTargeting || {},
                timeline,
                budget,
                additionalNotes: additionalNotes || '',
                status: 'pending', // Initial status
                isPrivateEvent: isPrivateEvent || false,
                eventDetails: isPrivateEvent ? {
                    eventName: eventDetails.eventName,
                    eventType: eventDetails.eventType,
                    eventDate: new Date(eventDetails.eventDate),
                    eventLocation: eventDetails.eventLocation,
                    expectedAttendance: parseInt(eventDetails.expectedAttendance),
                    eventDescription: eventDetails.eventDescription,
                    specialRequirements: eventDetails.specialRequirements || '',
                } : undefined,
            });
            await newRequest.save();
            // Get requester details for notification
            const requesterName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.fullName) || 'a brand';
            const requesterAvatar = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.avatar) || '/avatars/placeholder-1.svg';
            // Create notification for the creator
            const notification = new Notification_1.default({
                user: creatorId,
                type: 'quote_request',
                message: `New custom quote request from ${requesterName}`,
                fromUser: req.user._id,
            });
            await notification.save();
            // Emit socket event for real-time notification
            const io = (0, sockets_1.getIO)();
            console.log('Emitting newNotification to user:', creatorId.toString());
            console.log('Notification data:', {
                _id: notification._id,
                user: creatorId,
                type: 'quote_request',
                message: `New custom quote request from ${requesterName}`,
                fromUser: {
                    _id: req.user._id,
                    fullName: requesterName,
                    avatar: requesterAvatar
                },
                isRead: false,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt
            });
            io.to(creatorId.toString()).emit('newNotification', {
                notification: {
                    _id: notification._id,
                    user: creatorId,
                    type: 'quote_request',
                    message: `New custom quote request from ${requesterName}`,
                    fromUser: {
                        _id: req.user._id,
                        fullName: requesterName,
                        avatar: requesterAvatar
                    },
                    isRead: false,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt
                }
            });
            return res.status(201).json({
                message: 'Custom quote request created successfully.',
                data: newRequest
            });
        }
        catch (error) {
            console.error('Error creating custom quote request:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    }
    /**
     * @route GET /api/custom-quotes/creator/:creatorId
     * @desc Get all custom quote requests for a specific creator
     * @access Private (Creator users)
     */
    async getRequestsForCreator(req, res) {
        var _a, _b, _c, _d;
        try {
            // Ensure the requesting user is the creator or an admin
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'creator' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                console.warn('Access denied: User is not creator or admin. Current user role:', (_c = req.user) === null || _c === void 0 ? void 0 : _c.role);
                return res.status(403).json({ message: 'Access denied.' });
            }
            const { creatorId } = req.params;
            console.log('Received request for creatorId in getRequestsForCreator:', creatorId);
            // Ensure the logged-in user is the creator whose requests are being fetched
            if (!req.user || req.user._id.toString() !== creatorId) {
                console.warn('Unauthorized: Logged-in user ID mismatch or not logged in. Logged-in user ID:', (_d = req.user) === null || _d === void 0 ? void 0 : _d._id, 'Requested creator ID:', creatorId);
                return res.status(403).json({ message: 'Unauthorized to view these requests.' });
            }
            if (!mongoose_1.Types.ObjectId.isValid(creatorId)) {
                console.error('Invalid creatorId format provided to getRequestsForCreator:', creatorId);
                return res.status(400).json({ message: 'Invalid creator ID format.' });
            }
            console.log('Proceeding to fetch quote requests for creator with ID:', creatorId);
            const requests = await CustomQuoteRequest_1.default.find({ creatorId })
                .populate('requesterId', 'fullName email avatar username')
                .sort({ createdAt: -1 });
            console.log(`Successfully found ${requests.length} quote requests for creator ${creatorId}.`);
            return res.status(200).json({ message: 'Custom quote requests fetched successfully.', data: requests });
        }
        catch (error) {
            console.error('Caught error in getRequestsForCreator method:', error);
            return res.status(500).json({ message: 'Server error while fetching custom quote requests.', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * @route GET /api/custom-quotes/brand/:brandId
     * @desc Get all custom quote requests made by a specific brand
     * @access Private (Brand users)
     */
    async getRequestsByBrand(req, res) {
        var _a, _b;
        try {
            // Ensure the requesting user is the brand or an admin
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'brand' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                return res.status(403).json({ message: 'Access denied.' });
            }
            const { brandId } = req.params;
            // Ensure the logged-in user is the brand whose requests are being fetched
            if (req.user._id.toString() !== brandId) {
                return res.status(403).json({ message: 'Unauthorized to view these requests.' });
            }
            const requests = await CustomQuoteRequest_1.default.find({ requesterId: brandId }).populate('creatorId', 'fullName username avatar');
            return res.status(200).json({ message: 'Custom quote requests fetched successfully.', data: requests });
        }
        catch (error) {
            console.error('Error fetching custom quote requests by brand:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    }
    /**
     * @route GET /api/custom-quotes/brand-username/:username
     * @desc Get all custom quote requests made by a brand (by username)
     * @access Private (Brand users)
     */
    async getRequestsByBrandUsername(req, res) {
        try {
            const { username } = req.params;
            // Find the brand user by username
            const brandUser = await User_1.default.findOne({ username, role: 'brand' });
            if (!brandUser) {
                return res.status(404).json({ message: 'Brand user not found.' });
            }
            // Only allow the brand user or admin to access
            if (req.user.username !== username && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized to view these requests.' });
            }
            const requests = await CustomQuoteRequest_1.default.find({ requesterId: brandUser._id }).populate('creatorId', 'fullName username avatar');
            return res.status(200).json({ message: 'Custom quote requests fetched successfully.', data: requests });
        }
        catch (error) {
            console.error('Error fetching custom quote requests by brand username:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    }
    /**
     * @route PUT /api/custom-quotes/:requestId/status
     * @desc Update the status of a custom quote request (e.g., accepted, rejected, completed)
     * @access Private (Creator or Admin users)
     */
    async updateRequestStatus(req, res) {
        var _a, _b, _c, _d;
        try {
            // Only creators or admins can update status
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'creator' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                return res.status(403).json({ message: 'Access denied.' });
            }
            const { requestId } = req.params;
            const { status, response } = req.body;
            if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status provided.' });
            }
            const request = await CustomQuoteRequest_1.default.findById(requestId);
            if (!request) {
                return res.status(404).json({ message: 'Custom quote request not found.' });
            }
            // If creator, ensure they own the request
            if (req.user.role === 'creator' && request.creatorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized to update this request.' });
            }
            request.status = status;
            if (response) {
                request.response = response;
            }
            request.updatedAt = new Date();
            await request.save();
            // Get updater details for notification
            const updaterName = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.fullName) || 'a brand';
            const updaterAvatar = ((_d = req.user) === null || _d === void 0 ? void 0 : _d.avatar) || '/avatars/placeholder-1.svg';
            // Create notification for status change
            const statusMessages = {
                accepted: 'Your quote request has been accepted',
                rejected: 'Your quote request has been rejected',
                completed: 'Your quote request has been completed'
            };
            const notification = new Notification_1.default({
                user: request.requesterId,
                type: 'quote_request',
                message: statusMessages[status] || `Quote request status updated to ${status}`,
                fromUser: req.user._id,
            });
            await notification.save();
            // Emit socket event for real-time notification
            const io = (0, sockets_1.getIO)();
            console.log('Emitting status update notification to user:', request.requesterId.toString());
            console.log('Status update notification data:', {
                _id: notification._id,
                user: request.requesterId,
                type: 'quote_request',
                message: statusMessages[status] || `Quote request status updated to ${status}`,
                fromUser: {
                    _id: req.user._id,
                    fullName: updaterName,
                    avatar: updaterAvatar
                },
                isRead: false,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt
            });
            io.to(request.requesterId.toString()).emit('newNotification', {
                notification: {
                    _id: notification._id,
                    user: request.requesterId,
                    type: 'quote_request',
                    message: statusMessages[status] || `Quote request status updated to ${status}`,
                    fromUser: {
                        _id: req.user._id,
                        fullName: updaterName,
                        avatar: updaterAvatar
                    },
                    isRead: false,
                    createdAt: notification.createdAt,
                    updatedAt: notification.updatedAt
                }
            });
            return res.status(200).json({ message: `Request status updated to ${status}.`, data: request });
        }
        catch (error) {
            console.error('Error updating custom quote request status:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    }
    /**
     * @route GET /api/custom-quotes/:requestId
     * @desc Get a single custom quote request by ID
     * @access Private (Requester, Creator, or Admin)
     */
    async getCustomQuoteRequestById(req, res) {
        var _a, _b, _c;
        try {
            const { requestId } = req.params;
            const request = await CustomQuoteRequest_1.default.findById(requestId).populate('requesterId creatorId', 'fullName username email avatar');
            if (!request) {
                return res.status(404).json({ message: 'Custom quote request not found.' });
            }
            // Ensure user has permission to view this request
            const isRequester = request.requesterId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString());
            const isCreator = request.creatorId.toString() === ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString());
            const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'admin';
            if (!isRequester && !isCreator && !isAdmin) {
                return res.status(403).json({ message: 'Access denied to this request.' });
            }
            return res.status(200).json({ message: 'Custom quote request fetched successfully.', data: request });
        }
        catch (error) {
            console.error('Error fetching custom quote request by ID:', error);
            return res.status(500).json({ message: 'Server error.' });
        }
    }
    /**
     * @route GET /api/custom-quotes/creator
     * @desc Get all custom quote requests for the currently logged-in creator
     * @access Private (Creator users)
     */
    async getRequestsForCurrentCreator(req, res) {
        var _a;
        try {
            // Ensure the requesting user is a creator
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'creator') {
                return res.status(403).json({ message: 'Access denied. Only creators can view their quote requests.' });
            }
            const creatorId = req.user._id;
            console.log('Fetching quote requests for current creator:', creatorId);
            const requests = await CustomQuoteRequest_1.default.find({ creatorId })
                .populate('requesterId', 'fullName email avatar username companyName')
                .sort({ createdAt: -1 });
            console.log(`Found ${requests.length} quote requests for creator ${creatorId}`);
            // Return the full request object as-is (with populated requesterId)
            return res.status(200).json({
                success: true,
                message: 'Quote requests fetched successfully.',
                data: requests
            });
        }
        catch (error) {
            console.error('Error fetching quote requests for current creator:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching quote requests.',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * @route POST /api/custom-quotes/:requestId/accept
     * @desc Accept a quote request
     * @access Private (Creator users)
     */
    async acceptQuoteRequest(req, res) {
        var _a;
        try {
            const { requestId } = req.params;
            const creatorId = req.user._id;
            // Ensure the requesting user is a creator
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'creator') {
                return res.status(403).json({ message: 'Access denied. Only creators can accept quote requests.' });
            }
            const quoteRequest = await CustomQuoteRequest_1.default.findById(requestId);
            if (!quoteRequest) {
                return res.status(404).json({ message: 'Quote request not found.' });
            }
            // Ensure the creator owns this quote request
            if (quoteRequest.creatorId.toString() !== creatorId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to accept this quote request.' });
            }
            // Update the status
            quoteRequest.status = 'accepted';
            await quoteRequest.save();
            // Create notification for the brand
            const notification = new Notification_1.default({
                user: quoteRequest.requesterId,
                type: 'quote_accepted',
                message: `Your quote request has been accepted by the creator`,
                fromUser: creatorId,
            });
            await notification.save();
            return res.status(200).json({
                success: true,
                message: 'Quote request accepted successfully.'
            });
        }
        catch (error) {
            console.error('Error accepting quote request:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while accepting quote request.',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * @route POST /api/custom-quotes/:requestId/reject
     * @desc Reject a quote request
     * @access Private (Creator users)
     */
    async rejectQuoteRequest(req, res) {
        var _a;
        try {
            const { requestId } = req.params;
            const creatorId = req.user._id;
            // Ensure the requesting user is a creator
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'creator') {
                return res.status(403).json({ message: 'Access denied. Only creators can reject quote requests.' });
            }
            const quoteRequest = await CustomQuoteRequest_1.default.findById(requestId);
            if (!quoteRequest) {
                return res.status(404).json({ message: 'Quote request not found.' });
            }
            // Ensure the creator owns this quote request
            if (quoteRequest.creatorId.toString() !== creatorId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to reject this quote request.' });
            }
            // Update the status
            quoteRequest.status = 'rejected';
            await quoteRequest.save();
            // Create notification for the brand
            const notification = new Notification_1.default({
                user: quoteRequest.requesterId,
                type: 'quote_rejected',
                message: `Your quote request has been declined by the creator`,
                fromUser: creatorId,
            });
            await notification.save();
            return res.status(200).json({
                success: true,
                message: 'Quote request rejected successfully.'
            });
        }
        catch (error) {
            console.error('Error rejecting quote request:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while rejecting quote request.'
            });
        }
    }
    /**
     * @route GET /api/custom-quotes/admin/all
     * @desc Get all custom quote requests (admin only)
     * @access Private (Admin users)
     */
    async getAllQuoteRequestsAdmin(req, res) {
        var _a;
        try {
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
                return res.status(403).json({ message: 'Access denied.' });
            }
            const requests = await CustomQuoteRequest_1.default.find()
                .populate('requesterId', 'fullName email avatar username')
                .populate('creatorId', 'fullName email avatar username')
                .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: requests });
        }
        catch (error) {
            return res.status(500).json({ message: 'Server error.', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}
exports.default = new CustomQuoteRequestController();
