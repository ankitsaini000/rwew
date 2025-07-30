"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TargetAudienceGender_1 = __importDefault(require("../models/TargetAudienceGender"));
const router = express_1.default.Router();
// GET /api/target-audience-genders - Get all active target audience genders
router.get('/', async (req, res) => {
    try {
        const genders = await TargetAudienceGender_1.default.find({ isActive: true }).sort('name');
        res.json({ success: true, data: genders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch target audience genders', error: error instanceof Error ? error.message : error });
    }
});
exports.default = router;
