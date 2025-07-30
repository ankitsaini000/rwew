import { 
  AuthenticatedSocket, 
  MessagePayload, 
  JoinConversationPayload, 
  MarkReadPayload,
  SocketIOServer
} from '../../types/socket';
import Message from '../../models/Message';
import Conversation, { IConversation } from '../../models/Conversation';
import Notification from '../../models/Notification';
import mongoose from 'mongoose';

export default function setupMessageHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  if (!socket.user) {
    console.error('Unauthenticated socket attempted to set up message handlers');
    socket.disconnect();
    return;
  }

  // Now we know socket.user is defined
  const currentUser = socket.user;
  const userId = currentUser._id;

  // Join a conversation room
  const joinConversation = async ({ conversationId }: JoinConversationPayload) => {
    try {
      // Verify the conversation exists and user is a participant
      const conversation = await Conversation.findById(conversationId);
      
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
    } catch (error) {
      console.error('Join conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  };

  // Send a message
  const sendMessage = async (payload: MessagePayload) => {
    try {
      const { conversationId, receiverId, content, attachments, type } = payload;
      
      if (!conversationId || !receiverId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Get or create conversation
      let conversation: IConversation | null;

      if (mongoose.Types.ObjectId.isValid(conversationId)) {
        // Existing conversation
        conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Verify user is part of the conversation
        if (!conversation.participants.some(p => p.toString() === userId)) {
          socket.emit('error', { message: 'Not authorized to send message in this conversation' });
          return;
        }
      } else {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [userId, receiverId],
          lastMessageAt: new Date(),
          unreadCounts: new Map([[receiverId, 1]])
        });
      }

      // Create message
      const message = await Message.create({
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
      const notification = await Notification.create({
        user: receiverId,
        type: 'message',
        message: `New message from ${currentUser.fullName}`,
        fromUser: userId,
        conversationId: conversation._id,
        isRead: false
      });

      // Update conversation with last message
      conversation.lastMessage = message._id as unknown as mongoose.Types.ObjectId;
      conversation.lastMessageAt = new Date();
      
      // Increment unread count for receiver
      const currentUnread = conversation.unreadCounts.get(receiverId) || 0;
      conversation.unreadCounts.set(receiverId, currentUnread + 1);
      
      await conversation.save();

      const conversationId_string = conversation._id.toString();

      // Emit to room (includes sender for confirmation)
      io.to(conversationId_string).emit('receive-message', {
        message: {
          ...message.toObject(),
          senderName: currentUser.fullName,
          senderAvatar: currentUser.avatar
        }
      });

      // Emit new notification to receiver's room
      io.to(receiverId).emit('newNotification', {
        notification: {
          ...notification.toObject(),
          fromUser: {
            _id: currentUser._id,
            fullName: currentUser.fullName,
            avatar: currentUser.avatar
          }
        }
      });

      // Also emit to receiver specifically (in case they're not in the room)
      socket.to(receiverId).emit('new-message-notification', {
        conversationId: conversationId_string,
        message: {
          ...message.toObject(),
          senderName: currentUser.fullName,
          senderAvatar: currentUser.avatar
        }
      });

      socket.emit('message-sent', { success: true, messageId: message._id });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  };

  // Mark messages as read
  const markRead = async ({ conversationId, messageIds }: MarkReadPayload) => {
    try {
      if (!conversationId) {
        socket.emit('error', { message: 'Conversation ID required' });
        return;
      }

      // Verify conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      if (!conversation.participants.some(p => p.toString() === userId)) {
        socket.emit('error', { message: 'Not authorized for this conversation' });
        return;
      }

      // Update messages as read
      const filter = messageIds?.length 
        ? { _id: { $in: messageIds }, conversation: conversationId, receiver: userId } 
        : { conversation: conversationId, receiver: userId, isRead: false };
        
      const result = await Message.updateMany(filter, { isRead: true });

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
    } catch (error) {
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