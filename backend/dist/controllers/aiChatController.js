"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuickResponse = exports.getAIConversation = exports.getAIStatus = exports.sendAIMessage = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const aiChatService_1 = __importDefault(require("../services/aiChatService"));
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const sockets_1 = require("../sockets");
// @desc    Send a message to AI and get response
// @route   POST /api/ai-chat/send
// @access  Private
exports.sendAIMessage = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { message, conversationId, model } = req.body;
        const userId = req.user._id.toString();
        if (!message) {
            res.status(400);
            throw new Error('Message content is required');
        }
        // Check if AI is available
        const isAvailable = await aiChatService_1.default.isAvailable();
        if (!isAvailable) {
            res.status(503);
            throw new Error('AI service is currently unavailable. Please try again later.');
        }
        // Get user context for better AI responses
        const user = await User_1.default.findById(userId).select('role fullName');
        const userType = (user === null || user === void 0 ? void 0 : user.role) || 'user';
        // Get conversation history if conversationId is provided
        let conversationHistory = [];
        if (conversationId) {
            const messages = await Message_1.default.find({ conversation: conversationId })
                .sort({ sentAt: 1 })
                .limit(10); // Last 10 messages for context
            conversationHistory = messages.map(msg => ({
                role: msg.sender.toString() === userId ? 'user' : 'assistant',
                content: msg.content || ''
            }));
        }
        // Send message to AI
        const aiResponse = await aiChatService_1.default.sendMessage(message, conversationHistory, model);
        // Create AI user if it doesn't exist
        let aiUser = await User_1.default.findOne({ email: 'ai-assistant@platform.com' });
        if (!aiUser) {
            aiUser = await User_1.default.create({
                email: 'ai-assistant@platform.com',
                fullName: 'AI Assistant',
                role: 'admin',
                isVerified: true,
                avatar: '/avatars/ai-assistant.svg'
            });
        }
        // Create or get conversation with AI
        let conversation = await Conversation_1.default.findOne({
            participants: { $all: [userId, aiUser._id.toString()] }
        });
        if (!conversation) {
            conversation = await Conversation_1.default.create({
                participants: [userId, aiUser._id.toString()],
                lastMessageAt: new Date(),
                unreadCounts: new Map([[userId, 0]])
            });
        }
        // Save user message
        const userMessage = await Message_1.default.create({
            conversation: conversation._id,
            sender: userId,
            receiver: aiUser._id.toString(),
            content: message,
            type: 'text',
            isRead: true,
            sentAt: new Date()
        });
        // Save AI response
        const aiMessage = await Message_1.default.create({
            conversation: conversation._id,
            sender: aiUser._id.toString(),
            receiver: userId,
            content: aiResponse.message,
            type: 'text',
            isRead: false,
            sentAt: new Date()
        });
        // Update conversation
        conversation.lastMessage = aiMessage._id;
        conversation.lastMessageAt = new Date();
        conversation.unreadCounts.set(userId, (conversation.unreadCounts.get(userId) || 0) + 1);
        await conversation.save();
        // Emit real-time updates via Socket.IO
        try {
            const io = (0, sockets_1.getIO)();
            // Emit AI response to the user
            io.to(userId).emit('ai_message_received', {
                conversationId: conversation._id,
                message: {
                    _id: aiMessage._id,
                    conversation: conversation._id,
                    content: aiResponse.message,
                    type: 'text',
                    sender: {
                        _id: aiUser._id,
                        fullName: aiUser.fullName,
                        avatar: aiUser.avatar
                    },
                    sentAt: aiMessage.sentAt,
                    isRead: false
                }
            });
        }
        catch (socketError) {
            console.warn('Socket.IO error:', socketError);
        }
        res.status(200).json({
            success: true,
            message: aiResponse.message,
            conversationId: conversation._id,
            userMessage: userMessage,
            aiMessage: aiMessage
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        res.status(error.status || 500);
        throw new Error(error.message || 'Failed to get AI response');
    }
});
// @desc    Get AI chat status and available models
// @route   GET /api/ai-chat/status
// @access  Private
exports.getAIStatus = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const isAvailable = await aiChatService_1.default.isAvailable();
        const models = await aiChatService_1.default.getAvailableModels();
        res.status(200).json({
            isAvailable,
            models,
            defaultModel: process.env.OLLAMA_MODEL || 'llama2'
        });
    }
    catch (error) {
        console.error('AI Status Error:', error);
        res.status(500);
        throw new Error('Failed to get AI status');
    }
});
// @desc    Get AI conversation history
// @route   GET /api/ai-chat/conversation
// @access  Private
exports.getAIConversation = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const userId = req.user._id.toString();
        // Find AI user
        const aiUser = await User_1.default.findOne({ email: 'ai-assistant@platform.com' });
        if (!aiUser) {
            res.status(404);
            throw new Error('AI assistant not found');
        }
        // Find conversation with AI
        const conversation = await Conversation_1.default.findOne({
            participants: { $all: [userId, aiUser._id.toString()] }
        });
        if (!conversation) {
            res.status(200).json({
                conversation: null,
                messages: []
            });
            return;
        }
        // Get messages
        const messages = await Message_1.default.find({ conversation: conversation._id })
            .sort({ sentAt: 1 })
            .populate('sender', 'fullName avatar');
        res.status(200).json({
            conversation: {
                _id: conversation._id,
                participants: conversation.participants,
                lastMessageAt: conversation.lastMessageAt,
                unreadCount: conversation.unreadCounts.get(userId) || 0
            },
            messages
        });
    }
    catch (error) {
        console.error('Get AI Conversation Error:', error);
        res.status(500);
        throw new Error('Failed to get AI conversation');
    }
});
// @desc    Get quick AI responses for common queries
// @route   POST /api/ai-chat/quick-response
// @access  Private
exports.getQuickResponse = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            res.status(400);
            throw new Error('Query is required');
        }
        const response = await aiChatService_1.default.generateQuickResponse(query);
        res.status(200).json({
            success: true,
            response,
            hasQuickResponse: !!response
        });
    }
    catch (error) {
        console.error('Quick Response Error:', error);
        res.status(500);
        throw new Error('Failed to get quick response');
    }
});
