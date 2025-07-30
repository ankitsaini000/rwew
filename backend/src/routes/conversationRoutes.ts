import express from 'express';
import {
  getConversations,
  getConversationById,
  createOrGetConversation,
  archiveConversation,
  deleteConversation
} from '../controllers/conversationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/', protect, getConversations);

// @route   GET /api/conversations/:id
// @desc    Get single conversation by ID
// @access  Private
router.get('/:id', protect, getConversationById);

// @route   POST /api/conversations
// @desc    Create or get conversation with another user
// @access  Private
router.post('/', protect, createOrGetConversation);

// @route   PUT /api/conversations/:id/archive
// @desc    Archive/unarchive a conversation
// @access  Private
router.put('/:id/archive', protect, archiveConversation);

// @route   DELETE /api/conversations/:id
// @desc    Delete a conversation (soft delete)
// @access  Private
router.delete('/:id', protect, deleteConversation);

export default router; 