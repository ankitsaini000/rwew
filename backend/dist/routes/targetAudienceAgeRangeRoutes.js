"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TargetAudienceAgeRange_1 = __importDefault(require("../models/TargetAudienceAgeRange"));
const router = express_1.default.Router();
// GET /api/target-audience-age-ranges - Get all active target audience age ranges
router.get('/', async (req, res) => {
    try {
        const ageRanges = await TargetAudienceAgeRange_1.default.find({ isActive: true }).sort('min');
        res.json({ success: true, data: ageRanges });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch target audience age ranges', error: error instanceof Error ? error.message : error });
    }
});
exports.default = router;
