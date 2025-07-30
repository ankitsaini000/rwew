import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getConversationMessages,
  markMessagesAsRead,
  getMessages,
  createConversation,
  archiveConversation,
  deleteConversation,
  getRecentMessages
} from '../controllers/messageController';
import { protect } from '../middleware/auth';
import Message from '../models/Message';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';
import { upload } from '../utils/cloudinary';
import Conversation from '../models/Conversation';

const router = express.Router();

// Simple test route that doesn't need a controller
router.get('/simple-test', (req, res) => {
  res.json({ success: true, message: 'Message routes are accessible' });
});

// @route   GET /api/messages/test
// @desc    Test route to verify message endpoints are working
// @access  Public
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Message routes are working correctly' });
});

// @route   GET /api/messages
// @desc    Get all messages for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find all messages where the current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    }).sort({ createdAt: -1 }); // Sort from newest to oldest
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/messages/test-send
// @desc    Test sending a message without authentication
// @access  Public (for testing only)
router.post('/test-send', async (req, res) => {
  try {
    const { receiverId, content, senderEmail } = req.body;
    
    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide receiverId and content' 
      });
    }
    
    // Validate receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid receiverId format' 
      });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient user not found' 
      });
    }
    
    // For testing, either use the provided senderEmail to find a user or create a mock ID
    let sender = null;
    if (senderEmail) {
      sender = await User.findOne({ email: senderEmail });
    }
    
    if (!sender) {
      // Create a temporary sender if none provided
      sender = await User.create({
        email: 'temp_sender@example.com',
        password: 'temp123',
        fullName: 'Temporary Sender',
        role: 'client'
      });
    }

    // Create or find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [sender._id, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender._id, receiverId],
        lastMessageAt: new Date(),
        unreadCounts: new Map([[receiverId, 1]])
      });
    }
    
    // Create a test message
    const message = await Message.create({
      sender: sender._id,
      receiver: receiverId,
      conversation: conversation._id,
      content,
      isRead: false,
      sentAt: new Date()
    });

    // Create notification for the receiver
    const notification = await Notification.create({
      user: receiverId,
      type: 'message',
      message: `New message from ${sender.fullName || 'Someone'}`,
      fromUser: sender._id,
      conversationId: conversation._id,
      isRead: false
    });

    console.log('Created test notification:', {
      _id: notification._id,
      user: notification.user,
      type: notification.type,
      message: notification.message,
      fromUser: notification.fromUser
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Test message sent successfully',
      data: message,
      notification: notification
    });
  } catch (error: any) {
    console.error('Error in test-send:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error sending test message'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, upload.single('file'), sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get user conversations (list of users with latest message)
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   GET /api/messages/conversation/:conversationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get('/conversation/:conversationId', protect, getConversationMessages);

// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Private
router.get('/:userId', protect, getConversation);

// @route   PUT /api/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/read', protect, markMessagesAsRead);

// Conversation routes
router.post('/conversations', protect, createConversation);
router.post('/conversations/:conversationId/archive', protect, archiveConversation);
router.delete('/conversations/:conversationId', protect, deleteConversation);

// Message routes
router.get('/conversations/:conversationId/messages', protect, getMessages);

// Add the recent messages route
router.get('/recent', getRecentMessages);

export default router; 