"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Notification_1 = __importDefault(require("../models/Notification"));
// Get all notifications for the logged-in user
exports.getNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const notifications = await Notification_1.default.find({ user: userId })
        .populate('fromUser', 'fullName username avatar')
        .sort({ createdAt: -1 })
        .limit(50);
    // Transform notifications to include conversationId as string
    const transformedNotifications = notifications.map(notification => {
        const notificationObj = notification.toObject();
        if (notificationObj.conversationId) {
            notificationObj.conversationId = notificationObj.conversationId.toString();
        }
        return notificationObj;
    });
    res.status(200).json({
        success: true,
        data: transformedNotifications
    });
});
// Mark a notification as read
exports.markAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const notification = await Notification_1.default.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true }).populate('fromUser', 'fullName username avatar');
    if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
    }
    res.status(200).json({
        success: true,
        data: notification
    });
});
// Mark all notifications as read for a user
exports.markAllAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const result = await Notification_1.default.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.status(200).json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`
    });
});
// Get unread notification count
exports.getUnreadCount = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const count = await Notification_1.default.countDocuments({
        user: userId,
        isRead: false
    });
    res.status(200).json({
        success: true,
        count
    });
});
