"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupMessageHandlers;
const Message_1 = __importDefault(require("../../models/Message"));
const Conversation_1 = __importDefault(require("../../models/Conversation"));
const Notification_1 = __importDefault(require("../../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
function setupMessageHandlers(io, socket) {
    if (!socket.user) {
        console.error('Unauthenticated socket attempted to set up message handlers');
        socket.disconnect();
        return;
    }
    // Now we know socket.user is defined
    const currentUser = socket.user;
    const userId = currentUser._id;
    // Join a conversation room
    const joinConversation = async ({ conversationId }) => {
        try {
            // Verify the conversation exists and user is a participant
            const conversation = await Conversation_1.default.findById(conversationId);
            if (!conversation) {
                socket.emit('error', { message: 'Conversation not found' });
                return;
            }
            // Check if user is a participant
            if (!conversation.participants.some(p => p.toString() === userId)) {
                socket.emit('error', { message: 'Not authorized to join this conversation' });
                return;
            }
            // Join the room
            socket.join(conversationId);
            console.log(`User ${userId} joined conversation: ${conversationId}`);
            socket.emit('join-success', { conversationId });
        }
        catch (error) {
            console.error('Join conversation error:', error);
            socket.emit('error', { message: 'Failed to join conversation' });
        }
    };
    // Send a message
    const sendMessage = async (payload) => {
        try {
            const { conversationId, receiverId, content, attachments, type } = payload;
            if (!conversationId || !receiverId) {
                socket.emit('error', { message: 'Missing required fields' });
                return;
            }
            // Get or create conversation
            let conversation;
            if (mongoose_1.default.Types.ObjectId.isValid(conversationId)) {
                // Existing conversation
                conversation = await Conversation_1.default.findById(conversationId);
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }
                // Verify user is part of the conversation
                if (!conversation.participants.some(p => p.toString() === userId)) {
                    socket.emit('error', { message: 'Not authorized to send message in this conversation' });
                    return;
                }
            }
            else {
                // Create new conversation
                conversation = await Conversation_1.default.create({
                    participants: [userId, receiverId],
                    lastMessageAt: new Date(),
                    unreadCounts: new Map([[receiverId, 1]])
                });
            }
            // Create message
            const message = await Message_1.default.create({
                conversation: conversation._id,
                sender: userId,
                receiver: receiverId,
                content,
                attachments,
                type: type || 'text',
                isRead: false,
                sentAt: new Date()
            });
            // Create notification for the receiver
            const notification = await Notification_1.default.create({
                user: receiverId,
                type: 'message',
                message: `New message from ${currentUser.fullName}`,
                fromUser: userId,
                conversationId: conversation._id,
                isRead: false
            });
            // Update conversation with last message
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = new Date();
            // Increment unread count for receiver
            const currentUnread = conversation.unreadCounts.get(receiverId) || 0;
            conversation.unreadCounts.set(receiverId, currentUnread + 1);
            await conversation.save();
            const conversationId_string = conversation._id.toString();
            // Emit to room (includes sender for confirmation)
            io.to(conversationId_string).emit('receive-message', {
                message: Object.assign(Object.assign({}, message.toObject()), { senderName: currentUser.fullName, senderAvatar: currentUser.avatar })
            });
            // Emit new notification to receiver's room
            io.to(receiverId).emit('newNotification', {
                notification: Object.assign(Object.assign({}, notification.toObject()), { fromUser: {
                        _id: currentUser._id,
                        fullName: currentUser.fullName,
                        avatar: currentUser.avatar
                    } })
            });
            // Also emit to receiver specifically (in case they're not in the room)
            socket.to(receiverId).emit('new-message-notification', {
                conversationId: conversationId_string,
                message: Object.assign(Object.assign({}, message.toObject()), { senderName: currentUser.fullName, senderAvatar: currentUser.avatar })
            });
            socket.emit('message-sent', { success: true, messageId: message._id });
        }
        catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    };
    // Mark messages as read
    const markRead = async ({ conversationId, messageIds }) => {
        try {
            if (!conversationId) {
                socket.emit('error', { message: 'Conversation ID required' });
                return;
            }
            // Verify conversation exists and user is participant
            const conversation = await Conversation_1.default.findById(conversationId);
            if (!conversation) {
                socket.emit('error', { message: 'Conversation not found' });
                return;
            }
            if (!conversation.participants.some(p => p.toString() === userId)) {
                socket.emit('error', { message: 'Not authorized for this conversation' });
                return;
            }
            // Update messages as read
            const filter = (messageIds === null || messageIds === void 0 ? void 0 : messageIds.length)
                ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId }
                : { conversation: conversationId, receiver: userId, isRead: false };
            const result = await Message_1.default.updateMany(filter, { isRead: true });
            // Reset unread counter for user
            if (conversation.unreadCounts.has(userId)) {
                conversation.unreadCounts.set(userId, 0);
                await conversation.save();
            }
            // Notify other participants that messages were read
            socket.to(conversationId).emit('messages-read', {
                conversationId,
                readBy: userId,
                count: result.modifiedCount
            });
            socket.emit('mark-read-success', {
                conversationId,
                count: result.modifiedCount
            });
        }
        catch (error) {
            console.error('Mark read error:', error);
            socket.emit('error', { message: 'Failed to mark messages as read' });
        }
    };
    // Register event handlers for this socket
    socket.on('join-conversation', joinConversation);
    socket.on('send-message', sendMessage);
    socket.on('mark-read', markRead);
    // Handle user status (optional enhancement)
    socket.join(userId); // Join personal room for direct notifications
    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
}
