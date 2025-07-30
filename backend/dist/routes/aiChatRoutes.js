"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiChatController_1 = require("../controllers/aiChatController");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Send message to AI
router.post('/send', aiChatController_1.sendAIMessage);
// Get AI status and available models
router.get('/status', aiChatController_1.getAIStatus);
// Get AI conversation history
router.get('/conversation', aiChatController_1.getAIConversation);
// Get quick response for common queries
router.post('/quick-response', aiChatController_1.getQuickResponse);
exports.default = router;
