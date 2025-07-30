"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentMessages = exports.deleteConversation = exports.archiveConversation = exports.createConversation = exports.getMessages = exports.getConversation = exports.getConversations = exports.markMessagesAsRead = exports.getConversationMessages = exports.sendMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
const sockets_1 = require("../sockets");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { receiverId, content, type } = req.body;
        const userId = req.user._id.toString();
        const file = req.file;
        console.log('Received message request:', {
            receiverId,
            content,
            type,
            senderId: userId,
            hasFile: !!file
        });
        // Validate required fields
        if (!receiverId) {
            res.status(400);
            throw new Error('Recipient ID is required');
        }
        // Content is only required if there's no file
        if (!content && !file) {
            res.status(400);
            throw new Error('Message content or file is required');
        }
        // Check if receiver exists
        const receiver = await User_1.default.findById(receiverId);
        console.log('Receiver lookup result:', receiver ? {
            _id: receiver._id,
            fullName: receiver.fullName,
            email: receiver.email
        } : 'Not found');
        if (!receiver) {
            res.status(404);
            throw new Error('Recipient user not found');
        }
        // Find or create conversation
        let conversation = await Conversation_1.default.findOne({
            participants: { $all: [userId, receiverId] }
        });
        console.log('Existing conversation:', conversation ? {
            _id: conversation._id,
            participants: conversation.participants
        } : 'Not found');
        if (!conversation) {
            // Create new conversation
            conversation = await Conversation_1.default.create({
                participants: [userId, receiverId],
                lastMessageAt: new Date(),
                unreadCounts: new Map([[receiverId, 1]])
            });
            console.log('Created new conversation:', {
                _id: conversation._id,
                participants: conversation.participants
            });
        }
        // Create the message
        const messageData = {
            conversation: conversation._id,
            sender: userId,
            receiver: receiverId,
            content: content || (file ? (file.mimetype.startsWith('image/') ? 'Shared an image' : 'Shared a file') : ''),
            type: file ? (file.mimetype.startsWith('image/') ? 'image' : 'file') : (type || 'text'),
            isRead: false,
            sentAt: new Date()
        };
        // Add file information if a file was uploaded
        if (file) {
            messageData.fileUrl = file.path;
            messageData.fileName = file.originalname;
            messageData.fileType = file.mimetype;
        }
        const message = await Message_1.default.create(messageData);
        console.log('Created message:', {
            _id: message._id,
            conversation: message.conversation,
            sender: message.sender,
            receiver: message.receiver,
            type: message.type,
            fileUrl: message.fileUrl
        });
        // Create notification for the receiver
        const sender = await User_1.default.findById(userId).select('fullName avatar');
        const notification = await Notification_1.default.create({
            user: receiverId,
            type: 'message',
            message: `New message from ${(sender === null || sender === void 0 ? void 0 : sender.fullName) || 'Someone'}`,
            fromUser: userId,
            conversationId: conversation._id,
            isRead: false
        });
        // Send email notification to receiver
        if (receiver && receiver.email) {
            try {
                await (0, sendEmail_1.default)({
                    email: receiver.email,
                    subject: 'You have a new message!',
                    message: `<p>${(sender === null || sender === void 0 ? void 0 : sender.fullName) || 'Someone'} sent you a new message.</p><p><a href="${process.env.FRONTEND_URL || 'https://yourfrontend.com'}/messages">View your messages</a></p>`
                });
            }
            catch (emailError) {
                console.error('Failed to send notification email:', emailError);
            }
        }
        console.log('Created notification:', {
            _id: notification._id,
            user: notification.user,
            type: notification.type,
            message: notification.message,
            fromUser: notification.fromUser
        });
        // Update conversation with latest message
        const messageId = message._id.toString();
        conversation.lastMessage = new mongoose_1.default.Types.ObjectId(messageId);
        conversation.lastMessageAt = new Date();
        // Update unread counter for receiver
        const currentUnread = conversation.unreadCounts.get(receiverId) || 0;
        conversation.unreadCounts.set(receiverId, currentUnread + 1);
        await conversation.save();
        try {
            // Get socket instance
            const io = (0, sockets_1.getIO)();
            // Emit to the conversation room
            io.to(conversation._id.toString()).emit('new_message', Object.assign(Object.assign({}, message.toObject()), { sender: {
                    _id: userId,
                    fullName: (sender === null || sender === void 0 ? void 0 : sender.fullName) || '',
                    avatar: sender === null || sender === void 0 ? void 0 : sender.avatar
                } }));
            // Emit to the receiver's personal room
            io.to(receiverId).emit('conversation_update', {
                _id: conversation._id,
                lastMessage: message,
                unreadCount: currentUnread + 1
            });
            // Emit new notification to receiver
            io.to(receiverId).emit('newNotification', {
                notification: Object.assign(Object.assign({}, notification.toObject()), { fromUser: {
                        _id: userId,
                        fullName: (sender === null || sender === void 0 ? void 0 : sender.fullName) || '',
                        avatar: sender === null || sender === void 0 ? void 0 : sender.avatar
                    } })
            });
        }
        catch (error) {
            console.warn('Socket.IO error:', error);
            // Continue with the response even if socket emission fails
        }
        // Return the created message
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(error.status || 500);
        throw new Error(error.message || 'Error sending message');
    }
});
// @desc    Get messages for a conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Private
exports.getConversationMessages = (0, express_async_handler_1.default)(async (req, res) => {
    const conversationId = req.params.conversationId;
    const userId = req.user._id.toString();
    let conversation;
    if (req.user.role === 'admin') {
        conversation = await Conversation_1.default.findById(conversationId);
    }
    else {
        conversation = await Conversation_1.default.findOne({
            _id: conversationId,
            participants: userId
        });
    }
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found or you do not have access');
    }
    // Get messages
    const messages = await Message_1.default.find({
        conversation: conversationId
    })
        .sort({ sentAt: 1 })
        .populate('sender', 'fullName avatar');
    res.json(messages);
});
// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
exports.markMessagesAsRead = (0, express_async_handler_1.default)(async (req, res) => {
    const { conversationId, messageIds } = req.body;
    const userId = req.user._id.toString();
    if (!conversationId) {
        res.status(400);
        throw new Error('Conversation ID is required');
    }
    // Verify conversation exists and user is a participant
    const conversation = await Conversation_1.default.findOne({
        _id: conversationId,
        participants: userId
    });
    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found or you do not have access');
    }
    // Update query based on whether specific message IDs were provided
    const filter = (messageIds === null || messageIds === void 0 ? void 0 : messageIds.length)
        ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId, isRead: false }
        : { conversation: conversationId, receiver: userId, isRead: false };
    // Mark messages as read
    const result = await Message_1.default.updateMany(filter, { isRead: true });
    // Reset unread counter for user
    if (conversation.unreadCounts.has(userId)) {
        conversation.unreadCounts.set(userId, 0);
        await conversation.save();
    }
    // Emit socket event for read status
    const io = (0, sockets_1.getIO)();
    io.to(conversationId).emit('message_read', {
        messageIds: messageIds || [],
        conversationId,
        userId
    });
    res.json({
        success: true,
        count: result.modifiedCount
    });
});
// @desc    Get conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id.toString();
    let conversations;
    if (req.user.role === 'admin') {
        // Admin: see all conversations
        conversations = await Conversation_1.default.find({})
            .populate('participants', 'fullName email avatar username')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });
    }
    else {
        // Normal user: only their conversations
        conversations = await Conversation_1.default.find({
            participants: userId,
            deletedFor: { $ne: userId }
        })
            .populate('participants', 'fullName email avatar username')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });
    }
    // Format response
    const formattedConversations = conversations.map(convo => {
        // Get the other participant
        const otherParticipant = convo.participants.find(p => p._id.toString() !== userId);
        return {
            _id: convo._id,
            otherUser: otherParticipant,
            lastMessage: convo.lastMessage,
            lastMessageAt: convo.lastMessageAt,
            unreadCount: convo.unreadCounts.get(userId) || 0
        };
    });
    res.json(formattedConversations);
});
// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = (0, express_async_handler_1.default)(async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id.toString();
    // Validate the other user exists
    const otherUser = await User_1.default.findById(otherUserId);
    if (!otherUser) {
        res.status(404);
        throw new Error('User not found');
    }
    // Find or create conversation between these users
    let conversation = await Conversation_1.default.findOne({
        participants: { $all: [currentUserId, otherUserId] },
        deletedFor: { $ne: currentUserId }
    });
    if (!conversation) {
        // Create new conversation
        conversation = await Conversation_1.default.create({
            participants: [currentUserId, otherUserId],
            lastMessageAt: new Date(),
            unreadCounts: new Map()
        });
    }
    // Get messages
    const messages = await Message_1.default.find({
        conversation: conversation._id
    }).sort({ sentAt: 1 });
    // Format response
    const response = {
        conversationId: conversation._id,
        otherUser: {
            _id: otherUser._id,
            fullName: otherUser.fullName,
            email: otherUser.email,
            avatar: otherUser.avatar,
            username: otherUser.username
        },
        messages,
        unreadCount: conversation.unreadCounts.get(currentUserId) || 0
    };
    res.json(response);
});
// Get messages for a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Verify user is part of the conversation
        const conversation = await Conversation_1.default.findOne({
            _id: conversationId,
            participants: req.user._id
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        const messages = await Message_1.default.find({ conversation: conversationId })
            .sort({ sentAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'fullName avatar')
            .populate('receiver', 'fullName avatar');
        // Mark messages as read
        await Message_1.default.updateMany({
            conversation: conversationId,
            receiver: req.user._id,
            isRead: false
        }, {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        });
        // Update unread count
        await Conversation_1.default.updateOne({ _id: conversationId }, {
            $set: {
                [`unreadCounts.${req.user._id}`]: 0
            }
        });
        res.json(messages.reverse());
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};
exports.getMessages = getMessages;
// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        // Check if conversation already exists
        const existingConversation = await Conversation_1.default.findOne({
            participants: { $all: [req.user._id, participantId] }
        });
        if (existingConversation) {
            return res.json(existingConversation);
        }
        const conversation = new Conversation_1.default({
            participants: [req.user._id, participantId],
            unreadCounts: new Map([[participantId, 0]])
        });
        await conversation.save();
        await conversation.populate('participants', 'fullName avatar');
        res.json(conversation);
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ message: 'Error creating conversation' });
    }
};
exports.createConversation = createConversation;
// Archive a conversation
const archiveConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Conversation_1.default.updateOne({ _id: conversationId }, {
            $addToSet: {
                archivedBy: req.user._id
            }
        });
        res.json({ message: 'Conversation archived' });
    }
    catch (error) {
        console.error('Error archiving conversation:', error);
        res.status(500).json({ message: 'Error archiving conversation' });
    }
};
exports.archiveConversation = archiveConversation;
// Delete a conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await Conversation_1.default.updateOne({ _id: conversationId }, {
            $addToSet: {
                deletedFor: req.user._id
            }
        });
        res.json({ message: 'Conversation deleted' });
    }
    catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Error deleting conversation' });
    }
};
exports.deleteConversation = deleteConversation;
// @desc    Get 5 most recent messages with sender and receiver info
// @route   GET /api/messages/recent
// @access  Private (or Public if you want)
exports.getRecentMessages = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const messages = await Message_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('senderId', 'fullName email name')
            .populate('receiverId', 'fullName email name');
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent messages' });
    }
});
