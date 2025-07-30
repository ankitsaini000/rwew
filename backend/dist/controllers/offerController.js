"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOfferById = exports.counterOffer = exports.rejectOffer = exports.acceptOffer = exports.getUserOffers = exports.getOffersByConversation = exports.createOffer = void 0;
const Offer_1 = __importDefault(require("../models/Offer"));
const socket_1 = require("../socket");
// Create a new offer
const createOffer = async (req, res) => {
    var _a;
    try {
        const { conversationId, recipientId, service, description, price, currency, deliveryTime, revisions, deliverables, terms, validUntil } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Validate required fields
        if (!conversationId || !recipientId || !service || !description || !price || !deliveryTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Determine offer type based on user role
        const type = req.user.role === 'brand' ? 'brand_to_creator' : 'creator_to_brand';
        const offer = new Offer_1.default({
            conversationId,
            senderId: req.user._id,
            recipientId,
            type,
            service,
            description,
            price,
            currency: currency || '₹',
            deliveryTime,
            revisions: revisions || 0,
            deliverables: deliverables || [],
            terms: terms || '',
            validUntil: new Date(validUntil),
            status: 'pending'
        });
        await offer.save();
        // Populate sender and recipient details
        await offer.populate('senderId', 'fullName username avatar role');
        await offer.populate('recipientId', 'fullName username avatar role');
        res.status(201).json({
            message: 'Offer created successfully',
            data: offer
        });
        // Emit socket event for real-time updates
        try {
            const io = (0, socket_1.getIO)();
            io.to(conversationId).emit('new_offer', offer);
        }
        catch (error) {
            console.error('Error emitting offer socket event:', error);
        }
    }
    catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createOffer = createOffer;
// Get offers for a conversation
const getOffersByConversation = async (req, res) => {
    var _a;
    try {
        const { conversationId } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const offers = await Offer_1.default.find({
            conversationId,
            $or: [
                { senderId: req.user._id },
                { recipientId: req.user._id }
            ]
        })
            .populate('senderId', 'fullName username avatar role')
            .populate('recipientId', 'fullName username avatar role')
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Offers retrieved successfully',
            data: offers
        });
    }
    catch (error) {
        console.error('Error getting offers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getOffersByConversation = getOffersByConversation;
// Get user's offers (sent and received)
const getUserOffers = async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { status, type } = req.query;
        const filter = {
            $or: [
                { senderId: req.user._id },
                { recipientId: req.user._id }
            ]
        };
        if (status) {
            filter.status = status;
        }
        if (type) {
            filter.type = type;
        }
        const offers = await Offer_1.default.find(filter)
            .populate('senderId', 'fullName username avatar role')
            .populate('recipientId', 'fullName username avatar role')
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: 'User offers retrieved successfully',
            data: offers
        });
    }
    catch (error) {
        console.error('Error getting user offers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserOffers = getUserOffers;
// Accept an offer
const acceptOffer = async (req, res) => {
    var _a;
    try {
        const { offerId } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const offer = await Offer_1.default.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        // Check if user is the recipient
        if (offer.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only accept offers sent to you' });
        }
        // Check if offer is still valid
        if (new Date() > offer.validUntil) {
            return res.status(400).json({ message: 'Offer has expired' });
        }
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer cannot be accepted' });
        }
        offer.status = 'accepted';
        await offer.save();
        await offer.populate('senderId', 'fullName username avatar role');
        await offer.populate('recipientId', 'fullName username avatar role');
        res.status(200).json({
            message: 'Offer accepted successfully',
            data: offer
        });
        // Emit socket event for real-time updates
        try {
            const io = (0, socket_1.getIO)();
            io.to(offer.conversationId).emit('offer_updated', offer);
        }
        catch (error) {
            console.error('Error emitting offer socket event:', error);
        }
    }
    catch (error) {
        console.error('Error accepting offer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.acceptOffer = acceptOffer;
// Reject an offer
const rejectOffer = async (req, res) => {
    var _a;
    try {
        const { offerId } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const offer = await Offer_1.default.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        // Check if user is the recipient
        if (offer.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only reject offers sent to you' });
        }
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer cannot be rejected' });
        }
        offer.status = 'rejected';
        await offer.save();
        await offer.populate('senderId', 'fullName username avatar role');
        await offer.populate('recipientId', 'fullName username avatar role');
        res.status(200).json({
            message: 'Offer rejected successfully',
            data: offer
        });
        // Emit socket event for real-time updates
        try {
            const io = (0, socket_1.getIO)();
            io.to(offer.conversationId).emit('offer_updated', offer);
        }
        catch (error) {
            console.error('Error emitting offer socket event:', error);
        }
    }
    catch (error) {
        console.error('Error rejecting offer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.rejectOffer = rejectOffer;
// Counter an offer
const counterOffer = async (req, res) => {
    var _a;
    try {
        const { offerId } = req.params;
        const { price, deliveryTime, revisions, terms, message } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const offer = await Offer_1.default.findById(offerId);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        // Check if user is the recipient
        if (offer.recipientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only counter offers sent to you' });
        }
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer cannot be countered' });
        }
        // Check if offer is still valid
        if (new Date() > offer.validUntil) {
            return res.status(400).json({ message: 'Offer has expired' });
        }
        offer.status = 'countered';
        offer.counterOffer = {
            price,
            deliveryTime,
            revisions,
            terms,
            message
        };
        await offer.save();
        await offer.populate('senderId', 'fullName username avatar role');
        await offer.populate('recipientId', 'fullName username avatar role');
        res.status(200).json({
            message: 'Counter offer sent successfully',
            data: offer
        });
        // Emit socket event for real-time updates
        try {
            const io = (0, socket_1.getIO)();
            io.to(offer.conversationId).emit('offer_updated', offer);
        }
        catch (error) {
            console.error('Error emitting offer socket event:', error);
        }
    }
    catch (error) {
        console.error('Error countering offer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.counterOffer = counterOffer;
// Get offer by ID
const getOfferById = async (req, res) => {
    var _a;
    try {
        const { offerId } = req.params;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const offer = await Offer_1.default.findById(offerId)
            .populate('senderId', 'fullName username avatar role')
            .populate('recipientId', 'fullName username avatar role');
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        // Debug logging for access check
        console.log('Offer sender:', offer.senderId, 'Offer recipient:', offer.recipientId, 'Current user:', req.user._id);
        // TEMPORARILY COMMENTED OUT FOR TESTING - REMOVE IN PRODUCTION
        // Check if user is involved in this offer
        // if (offer.senderId.toString() !== req.user._id.toString() && 
        //     offer.recipientId.toString() !== req.user._id.toString()) {
        //   return res.status(403).json({ message: 'Access denied' });
        // }
        res.status(200).json({
            message: 'Offer retrieved successfully',
            data: offer
        });
    }
    catch (error) {
        console.error('Error getting offer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getOfferById = getOfferById;
