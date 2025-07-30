import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';
import { getAuthUserId } from '../utils/auth';

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);

  // Find all conversations where the current user is a participant
  // And that haven't been deleted for this user
  const conversations = await Conversation.find({
    participants: userId,
    deletedFor: { $ne: userId }
  })
    .populate('participants', 'fullName email avatar')
    .sort({ lastMessageAt: -1 });

  // Format the response to be more user-friendly
  const formattedConversations = conversations.map(convo => {
    // Get the other participant (not the current user)
    const otherParticipant = convo.participants.find(
      p => p._id.toString() !== userId
    );

    // Check if archivedBy array contains userId as ObjectId
    const isArchived = convo.archivedBy?.some(id => 
      id.toString() === userId
    ) || false;

    return {
      _id: convo._id,
      otherUser: otherParticipant,
      lastMessage: convo.lastMessage,
      lastMessageAt: convo.lastMessageAt,
      unreadCount: convo.unreadCounts.get(userId) || 0,
      isArchived
    };
  });

  res.json(formattedConversations);
});

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const conversationId = req.params.id;

  // Find conversation and verify user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
    deletedFor: { $ne: userId }
  }).populate('participants', 'fullName email avatar');

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Get the other participant
  const otherParticipant = conversation.participants.find(
    p => p._id.toString() !== userId
  );

  // Get messages for this conversation
  const messages = await Message.find({ 
    conversation: conversationId,
  }).sort({ sentAt: 1 });

  // Check if archivedBy array contains userId as ObjectId
  const isArchived = conversation.archivedBy?.some(id => 
    id.toString() === userId
  ) || false;

  // Format the response
  const formattedConversation = {
    _id: conversation._id,
    otherUser: otherParticipant,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: conversation.unreadCounts.get(userId) || 0,
    isArchived,
    messages
  };

  res.json(formattedConversation);
});

// @desc    Create or get conversation with another user
// @route   POST /api/conversations
// @access  Private
export const createOrGetConversation = asyncHandler(async (req: Request, res: Response) => {
  const { otherUserId } = req.body;
  const userId = getAuthUserId(req);

  if (!otherUserId) {
    res.status(400);
    throw new Error('Other user ID is required');
  }

  // Verify the other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if conversation already exists between these users
  const existingConversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
    deletedFor: { $ne: userId }
  }).populate('participants', 'fullName email avatar');

  if (existingConversation) {
    // If conversation was deleted for other user, remove them from deletedFor
    if (existingConversation.deletedFor?.some(id => id.toString() === otherUserId)) {
      await Conversation.updateOne(
        { _id: existingConversation._id },
        { $pull: { deletedFor: otherUserId } }
      );
    }

    // Get the other participant
    const otherParticipant = existingConversation.participants.find(
      p => p._id.toString() !== userId
    );

    // Check if archivedBy array contains userId as ObjectId
    const isArchived = existingConversation.archivedBy?.some(id => 
      id.toString() === userId
    ) || false;

    // Format response
    const response = {
      _id: existingConversation._id,
      otherUser: otherParticipant,
      lastMessage: existingConversation.lastMessage,
      lastMessageAt: existingConversation.lastMessageAt,
      unreadCount: existingConversation.unreadCounts.get(userId) || 0,
      isArchived,
      isExisting: true
    };

    res.status(200).json(response);
    return;
  }

  // Create new conversation
  const newConversation = await Conversation.create({
    participants: [userId, otherUserId],
    lastMessageAt: new Date(),
    unreadCounts: new Map()
  });

  // Populate the participants
  await newConversation.populate('participants', 'fullName email avatar');

  // Get the other participant
  const otherParticipant = newConversation.participants.find(
    p => p._id.toString() !== userId
  );

  // Format response
  const response = {
    _id: newConversation._id,
    otherUser: otherParticipant,
    lastMessageAt: newConversation.lastMessageAt,
    unreadCount: 0,
    isArchived: false,
    isExisting: false
  };

  res.status(201).json(response);
});

// @desc    Archive/unarchive a conversation
// @route   PUT /api/conversations/:id/archive
// @access  Private
export const archiveConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { archive } = req.body; // true to archive, false to unarchive
  const conversationId = req.params.id;
  
  // Find the conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
    deletedFor: { $ne: userId }
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Update archive status
  if (archive) {
    // Add to archivedBy if not already there
    if (!conversation.archivedBy?.some(id => id.toString() === userId)) {
      await Conversation.updateOne(
        { _id: conversationId },
        { $addToSet: { archivedBy: userId } }
      );
    }
  } else {
    // Remove from archivedBy
    await Conversation.updateOne(
      { _id: conversationId },
      { $pull: { archivedBy: userId } }
    );
  }

  res.json({ 
    success: true, 
    archived: archive 
  });
});

// @desc    Delete a conversation (soft delete)
// @route   DELETE /api/conversations/:id
// @access  Private
export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const conversationId = req.params.id;
  
  // Find the conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
    deletedFor: { $ne: userId }
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Add user to deletedFor array
  await Conversation.updateOne(
    { _id: conversationId },
    { $addToSet: { deletedFor: userId } }
  );

  res.json({ success: true });
}); 