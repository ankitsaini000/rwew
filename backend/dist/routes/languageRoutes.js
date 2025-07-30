"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Language_1 = __importDefault(require("../models/Language"));
const router = express_1.default.Router();
// GET /api/languages - Get all active languages
router.get('/', async (req, res) => {
    try {
        const languages = await Language_1.default.find({ isActive: true }).sort('name');
        res.json({ success: true, data: languages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch languages', error: error instanceof Error ? error.message : error });
    }
});
exports.default = router;
