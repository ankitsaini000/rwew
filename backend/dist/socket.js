"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("./middleware/auth");
let io;
const initializeSocket = (httpServer) => {
    if (io) {
        console.log('Socket.IO already initialized');
        return io;
    }
    console.log('Initializing Socket.IO...');
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const user = await (0, auth_1.verifyToken)(token);
            if (!user) {
                return next(new Error('Authentication error'));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.user._id;
        console.log(`User connected: ${userId}`);
        // Join user's personal room
        socket.join(userId.toString());
        // Join conversation
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation ${conversationId}`);
        });
        // Leave conversation
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });
        // Handle typing status
        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit('typing', {
                userId,
                isTyping
            });
        });
        // Handle message sent
        socket.on('message_sent', ({ messageId, conversationId, receiverId, message }) => {
            // Broadcast to conversation room
            socket.to(conversationId).emit('new_message', message);
            // Notify receiver in their personal room
            socket.to(receiverId).emit('conversation_update', {
                _id: conversationId,
                lastMessage: message
            });
        });
        // Handle offer created
        socket.on('offer_created', (offer) => {
            // Broadcast to conversation room
            socket.to(offer.conversationId).emit('new_offer', offer);
            // Notify recipient in their personal room
            socket.to(offer.recipientId).emit('offer_notification', {
                type: 'new_offer',
                offer
            });
        });
        // Handle offer updated
        socket.on('offer_updated', (offer) => {
            // Broadcast to conversation room
            socket.to(offer.conversationId).emit('offer_updated', offer);
            // Notify both parties
            socket.to(offer.senderId).emit('offer_notification', {
                type: 'offer_updated',
                offer
            });
            socket.to(offer.recipientId).emit('offer_notification', {
                type: 'offer_updated',
                offer
            });
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', userId);
        });
    });
    console.log('Socket.IO initialized successfully');
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};
exports.getIO = getIO;
