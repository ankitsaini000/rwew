import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// System prompt describing the platform and KITTU's role
const SYSTEM_PROMPT = `You are KITTU, the helpful AI assistant for Influencer Marketplace. Our platform connects brands and creators for influencer marketing. You can answer questions about registration, features, payments, support, and more. Always provide answers relevant to our platform and guide users to use our features. Always reply in short, simple, and easy-to-understand language.`;

// AIChatMessage Mongoose model
const aiChatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  timestamp: { type: Date, default: Date.now }
});
const AIChatMessage = mongoose.models.AIChatMessage || mongoose.model('AIChatMessage', aiChatMessageSchema);

// AIChatFeedback Mongoose model
const aiChatFeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  like: { type: Boolean, required: true },
  contact: { type: String },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const AIChatFeedback = mongoose.models.AIChatFeedback || mongoose.model('AIChatFeedback', aiChatFeedbackSchema);

// Helper middleware to optionally attach user if token is present
const attachUserIfToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const user = await verifyToken(token);
      if (user) req.user = user;
    } catch (e) {
      // Ignore token errors, treat as guest
    }
  }
  next();
};

router.post('/ai', attachUserIfToken, async (req, res) => {
  const { prompt, userId: userIdFromBody } = req.body;
  // Always prefer userId from req.user (if authenticated), fallback to body (for guests/legacy)
  const userId = req.user?._id || userIdFromBody || null;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    // Store user message
    await new AIChatMessage({ userId, message: prompt, sender: 'user' }).save();

    // Use session to track if this is the first message
    const isFirstMessage = !(req.session && (req.session as any).kittuChatted);
    let fullPrompt;
    if (isFirstMessage) {
      fullPrompt = `${SYSTEM_PROMPT}\nUser: ${prompt}`;
      if (req.session) (req.session as any).kittuChatted = true;
    } else {
      fullPrompt = prompt;
    }

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama2',
      prompt: fullPrompt,
      stream: false
    });
    const aiReply = response.data.response;
    // Store AI reply
    await new AIChatMessage({ userId, message: aiReply, sender: 'ai' }).save();
    res.json({ response: aiReply });
  } catch (error: any) {
    res.status(500).json({ error: 'Ollama request failed', details: error.message });
  }
});

// Store feedback from frontend
router.post('/ai/feedback', async (req, res) => {
  const { like, contact, message } = req.body;
  const userId = req.user?._id || null;
  if (typeof like !== 'boolean') {
    return res.status(400).json({ error: 'Like (boolean) is required.' });
  }
  try {
    await new AIChatFeedback({ userId, like, contact, message }).save();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to store feedback', details: error.message });
  }
});

export default router; 