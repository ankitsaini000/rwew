"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// System prompt describing the platform and KITTU's role
const SYSTEM_PROMPT = `You are KITTU, the helpful AI assistant for Influencer Marketplace. Our platform connects brands and creators for influencer marketing. You can answer questions about registration, features, payments, support, and more. Always provide answers relevant to our platform and guide users to use our features. Always reply in short, simple, and easy-to-understand language.`;
// AIChatMessage Mongoose model
const aiChatMessageSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: false },
    message: { type: String, required: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    timestamp: { type: Date, default: Date.now }
});
const AIChatMessage = mongoose_1.default.models.AIChatMessage || mongoose_1.default.model('AIChatMessage', aiChatMessageSchema);
// AIChatFeedback Mongoose model
const aiChatFeedbackSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: false },
    like: { type: Boolean, required: true },
    contact: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
});
const AIChatFeedback = mongoose_1.default.models.AIChatFeedback || mongoose_1.default.model('AIChatFeedback', aiChatFeedbackSchema);
// Helper middleware to optionally attach user if token is present
const attachUserIfToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const user = await (0, auth_1.verifyToken)(token);
            if (user)
                req.user = user;
        }
        catch (e) {
            // Ignore token errors, treat as guest
        }
    }
    next();
};
router.post('/ai', attachUserIfToken, async (req, res) => {
    var _a;
    const { prompt, userId: userIdFromBody } = req.body;
    // Always prefer userId from req.user (if authenticated), fallback to body (for guests/legacy)
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || userIdFromBody || null;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }
    try {
        // Store user message
        await new AIChatMessage({ userId, message: prompt, sender: 'user' }).save();
        // Use session to track if this is the first message
        const isFirstMessage = !(req.session && req.session.kittuChatted);
        let fullPrompt;
        if (isFirstMessage) {
            fullPrompt = `${SYSTEM_PROMPT}\nUser: ${prompt}`;
            if (req.session)
                req.session.kittuChatted = true;
        }
        else {
            fullPrompt = prompt;
        }
        const response = await axios_1.default.post('http://localhost:11434/api/generate', {
            model: 'llama2',
            prompt: fullPrompt,
            stream: false
        });
        const aiReply = response.data.response;
        // Store AI reply
        await new AIChatMessage({ userId, message: aiReply, sender: 'ai' }).save();
        res.json({ response: aiReply });
    }
    catch (error) {
        res.status(500).json({ error: 'Ollama request failed', details: error.message });
    }
});
// Store feedback from frontend
router.post('/ai/feedback', async (req, res) => {
    var _a;
    const { like, contact, message } = req.body;
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null;
    if (typeof like !== 'boolean') {
        return res.status(400).json({ error: 'Like (boolean) is required.' });
    }
    try {
        await new AIChatFeedback({ userId, like, contact, message }).save();
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to store feedback', details: error.message });
    }
});
exports.default = router;
