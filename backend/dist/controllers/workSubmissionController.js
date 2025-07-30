"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkSubmissionById = exports.getAllWorkSubmissionsAdmin = exports.submitWorkForApproval = exports.releasePayment = exports.getBrandSubmissions = exports.updateSubmissionStatus = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Order_1 = __importDefault(require("../models/Order"));
const WorkSubmission_1 = __importDefault(require("../models/WorkSubmission"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const sockets_1 = require("../sockets");
// @desc    Update work submission status (approve/reject)
// @route   PUT /api/work-submissions/:submissionId/status
// @access  Private (Brand only)
exports.updateSubmissionStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { submissionId } = req.params;
    const { status, rejectionReason } = req.body;
    const brandId = req.user._id;
    // Find the work submission and populate the order details
    const submission = await WorkSubmission_1.default.findById(submissionId)
        .populate({
        path: 'order',
        select: 'client creator amount status'
    });
    if (!submission) {
        res.status(404);
        throw new Error('Work submission not found');
    }
    // Verify that the brand owns this order
    if (submission.order.client.toString() !== brandId.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this submission');
    }
    // Update submission status
    submission.approvalStatus = status;
    submission.approvalDate = new Date();
    if (status === 'rejected' && rejectionReason) {
        submission.rejectionReason = rejectionReason;
    }
    await submission.save();
    // Update order status based on submission status
    const orderDoc = await Order_1.default.findById(submission.order._id);
    if (orderDoc) {
        if (status === 'approved') {
            // Generate a unique transaction ID
            const transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Create payment record
            const payment = await Payment_1.default.create({
                user: brandId,
                order: submission.order._id,
                transactionId,
                amount: submission.order.amount,
                status: 'completed',
                paymentMethod: 'bankTransfer',
                paymentDetails: {
                    upiId: 'platform_payment'
                }
            });
            // Update order status to completed
            orderDoc.status = 'completed';
            orderDoc.paymentId = payment._id;
            orderDoc.completedAt = new Date();
            orderDoc.statusHistory.push({
                status: 'completed',
                date: new Date()
            });
            // Credit the creator
            const creator = await User_1.default.findById(submission.order.creator);
            if (creator) {
                creator.balance = (creator.balance || 0) + submission.order.amount;
                await creator.save();
            }
        }
        else if (status === 'rejected') {
            // Update order status back to in_progress
            orderDoc.status = 'in_progress';
            orderDoc.statusHistory.push({
                status: 'in_progress',
                date: new Date()
            });
        }
        await orderDoc.save();
    }
    // Create notification for creator about work approval/rejection
    try {
        const notificationMessage = status === 'approved'
            ? `Your work has been approved! Payment will be released soon.`
            : `Your work has been rejected. Please review and resubmit.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
        const creatorNotification = await Notification_1.default.create({
            user: submission.order.creator,
            type: 'order',
            message: notificationMessage,
            fromUser: brandId,
            isRead: false
        });
        // Emit real-time notification to creator
        const io = (0, sockets_1.getIO)();
        io.to(submission.order.creator.toString()).emit('newNotification', {
            notification: Object.assign(Object.assign({}, creatorNotification.toObject()), { fromUser: {
                    _id: brandId,
                    fullName: req.user.fullName || req.user.email,
                    avatar: req.user.avatar
                } })
        });
        console.log('Created work approval/rejection notification for creator:', {
            notificationId: creatorNotification._id,
            creatorId: submission.order.creator,
            status: status,
            orderId: submission.order._id
        });
    }
    catch (notificationError) {
        console.error('Error creating work approval/rejection notification:', notificationError);
        // Don't fail the operation if notification fails
    }
    res.json({
        success: true,
        data: {
            submission,
            order: orderDoc
        }
    });
});
// @desc    Get work submissions for a brand
// @route   GET /api/work-submissions/brand
// @access  Private (Brand only)
exports.getBrandSubmissions = (0, express_async_handler_1.default)(async (req, res) => {
    const brandId = req.user._id;
    console.log('Fetching submissions for brand:', brandId);
    // First try to find submissions directly linked to the brand
    const directSubmissions = await WorkSubmission_1.default.find({ client: brandId })
        .populate({
        path: 'order',
        select: 'service amount status description orderID'
    })
        .populate('files')
        .sort('-createdAt');
    // Then find submissions through orders
    const orderSubmissions = await WorkSubmission_1.default.find()
        .populate({
        path: 'order',
        match: { client: brandId },
        select: 'service amount status description orderID'
    })
        .populate('files')
        .sort('-createdAt');
    // Filter out submissions where the order doesn't match
    const filteredOrderSubmissions = orderSubmissions.filter(sub => sub.order);
    // Combine both results, removing duplicates
    const allSubmissions = [...directSubmissions, ...filteredOrderSubmissions];
    const uniqueSubmissions = Array.from(new Map(allSubmissions.map(item => [item._id.toString(), item])).values());
    console.log('Found submissions:', uniqueSubmissions.length);
    res.json({
        success: true,
        data: uniqueSubmissions
    });
});
// @desc    Release payment for an approved work submission
// @route   POST /api/work-submissions/:submissionId/release-payment
// @access  Private (Brand only)
exports.releasePayment = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { submissionId } = req.params;
        const brandId = req.user._id;
        console.log('Releasing payment for submission:', submissionId);
        console.log('Brand ID:', brandId);
        // Find the work submission and populate the order details
        const submission = await WorkSubmission_1.default.findById(submissionId)
            .populate({
            path: 'order',
            select: 'client creator amount status paymentId'
        });
        console.log('Found submission:', JSON.stringify(submission, null, 2));
        if (!submission) {
            res.status(404);
            throw new Error('Work submission not found');
        }
        // Verify that the brand owns this order
        if (submission.order.client.toString() !== brandId.toString()) {
            res.status(403);
            throw new Error('Not authorized to release payment for this submission');
        }
        // Verify that the submission is approved
        if (submission.approvalStatus !== 'approved') {
            res.status(400);
            throw new Error('Can only release payment for approved submissions');
        }
        // Find the order and update its status
        const order = await Order_1.default.findById(submission.order._id);
        console.log('Found order:', JSON.stringify(order, null, 2));
        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }
        // Update order status to completed
        order.status = 'completed';
        order.completedAt = new Date();
        order.statusHistory.push({
            status: 'completed',
            date: new Date()
        });
        try {
            // Create a new payment record (brand)
            const payment = await Payment_1.default.create({
                user: brandId,
                order: order._id,
                amount: order.amount,
                status: 'completed',
                paymentDate: new Date(),
                paymentMethod: 'platform',
                transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });
            // Create a payment record for the creator (credit)
            await Payment_1.default.create({
                user: order.creator,
                order: order._id,
                amount: order.amount,
                status: 'completed',
                paymentDate: new Date(),
                paymentMethod: 'platform',
                transactionId: `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });
            console.log('Created payment:', JSON.stringify(payment, null, 2));
            // Update order with payment reference
            order.paymentId = payment._id;
            order.paymentStatus = 'paid';
            order.paymentDate = new Date();
            await order.save();
            // Update submission with payment released status
            submission.paymentReleased = true;
            await submission.save();
            // Create notification for creator about payment release
            try {
                const creatorNotification = await Notification_1.default.create({
                    user: submission.order.creator,
                    type: 'order',
                    message: `Payment has been released for your work! Amount: $${order.amount}`,
                    fromUser: brandId,
                    isRead: false
                });
                // Emit real-time notification to creator
                const io = (0, sockets_1.getIO)();
                io.to(submission.order.creator.toString()).emit('newNotification', {
                    notification: Object.assign(Object.assign({}, creatorNotification.toObject()), { fromUser: {
                            _id: brandId,
                            fullName: req.user.fullName || req.user.email,
                            avatar: req.user.avatar
                        } })
                });
                console.log('Created payment release notification for creator:', {
                    notificationId: creatorNotification._id,
                    creatorId: submission.order.creator,
                    amount: order.amount,
                    orderId: order._id
                });
            }
            catch (notificationError) {
                console.error('Error creating payment release notification:', notificationError);
                // Don't fail the operation if notification fails
            }
            res.json({
                success: true,
                message: 'Payment released successfully',
                data: {
                    order,
                    payment
                }
            });
        }
        catch (paymentError) {
            console.error('Error creating payment:', paymentError);
            throw paymentError;
        }
    }
    catch (error) {
        console.error('Error in releasePayment:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to release payment'
        });
    }
});
// Add notification for work submission
exports.submitWorkForApproval = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { orderId } = req.params;
        const { files, description } = req.body;
        const creatorId = req.user._id;
        // Find the order and populate the client information
        const order = await Order_1.default.findOne({ _id: orderId, creator: creatorId })
            .populate('client', 'fullName email avatar');
        if (!order) {
            res.status(404);
            throw new Error('Order not found or does not belong to this creator');
        }
        // Create work submission
        const workSubmission = await WorkSubmission_1.default.create({
            order: orderId,
            creator: creatorId,
            files: files || [],
            description: description || '',
            submissionDate: new Date()
        });
        // Update order status
        order.status = 'delivered';
        order.submittedDeliverables = {
            files: files || [],
            description: description || '',
            submissionDate: new Date()
        };
        await order.save();
        // Create notification for client about work submission
        try {
            const orderData = order;
            if (orderData.client) {
                const clientNotification = await Notification_1.default.create({
                    user: orderData.client._id,
                    type: 'order',
                    message: `Work has been submitted for your order! Please review and approve.`,
                    fromUser: creatorId,
                    isRead: false
                });
                // Emit real-time notification to client
                const io = (0, sockets_1.getIO)();
                io.to(orderData.client._id.toString()).emit('newNotification', {
                    notification: Object.assign(Object.assign({}, clientNotification.toObject()), { fromUser: {
                            _id: creatorId,
                            fullName: req.user.fullName || req.user.email,
                            avatar: req.user.avatar
                        } })
                });
                console.log('Created work submission notification for client:', {
                    notificationId: clientNotification._id,
                    clientId: orderData.client._id,
                    orderId: orderId
                });
            }
            else {
                console.log('No client found for order:', orderId);
            }
        }
        catch (notificationError) {
            console.error('Error creating work submission notification:', notificationError);
            // Don't fail the work submission if notification fails
        }
        res.status(201).json({
            success: true,
            message: 'Work submitted successfully',
            data: workSubmission
        });
    }
    catch (error) {
        console.error('Error submitting work:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit work'
        });
    }
});
exports.getAllWorkSubmissionsAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        res.status(403).json({ message: 'Access denied.' });
        return;
    }
    const submissions = await WorkSubmission_1.default.find()
        .populate({
        path: 'order',
        select: 'service amount status description orderID client creator',
        populate: [
            { path: 'client', select: 'fullName email username avatar' },
            { path: 'creator', select: 'fullName email username avatar' }
        ]
    })
        .populate('files')
        .sort('-createdAt');
    res.json({ success: true, data: submissions });
});
exports.getWorkSubmissionById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const submission = await WorkSubmission_1.default.findById(id)
        .populate({
        path: 'order',
        select: 'service amount status description orderID client creator',
        populate: [
            { path: 'client', select: 'fullName email username avatar' },
            { path: 'creator', select: 'fullName email username avatar' }
        ]
    })
        .populate('files');
    if (!submission) {
        res.status(404).json({ message: 'Work submission not found.' });
        return;
    }
    res.json({ success: true, data: submission });
});
