"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversationController_1 = require("../controllers/conversationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/', auth_1.protect, conversationController_1.getConversations);
// @route   GET /api/conversations/:id
// @desc    Get single conversation by ID
// @access  Private
router.get('/:id', auth_1.protect, conversationController_1.getConversationById);
// @route   POST /api/conversations
// @desc    Create or get conversation with another user
// @access  Private
router.post('/', auth_1.protect, conversationController_1.createOrGetConversation);
// @route   PUT /api/conversations/:id/archive
// @desc    Archive/unarchive a conversation
// @access  Private
router.put('/:id/archive', auth_1.protect, conversationController_1.archiveConversation);
// @route   DELETE /api/conversations/:id
// @desc    Delete a conversation (soft delete)
// @access  Private
router.delete('/:id', auth_1.protect, conversationController_1.deleteConversation);
exports.default = router;
