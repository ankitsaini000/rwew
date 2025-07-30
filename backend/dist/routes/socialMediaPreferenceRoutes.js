"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SocialMediaPreference_1 = __importDefault(require("../models/SocialMediaPreference"));
const router = express_1.default.Router();
// GET /api/social-media-preferences - Get all active social media preferences
router.get('/', async (req, res) => {
    try {
        const preferences = await SocialMediaPreference_1.default.find({ isActive: true }).sort('name');
        res.json({ success: true, data: preferences });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch social media preferences', error: error instanceof Error ? error.message : error });
    }
});
exports.default = router;
