"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const brandRecommendationController_1 = require("../controllers/brandRecommendationController");
const router = express_1.default.Router();
// All routes require authentication and brand role
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('brand'));
// @route   GET /api/brand-recommendations/auto
// @desc    Get automatic recommendations for brand
// @access  Private (Brand only)
router.get('/auto', brandRecommendationController_1.getAutomaticRecommendations);
// @route   POST /api/brand-recommendations/refresh
// @desc    Refresh recommendations for brand
// @access  Private (Brand only)
router.post('/refresh', brandRecommendationController_1.refreshRecommendations);
// @route   GET /api/brand-recommendations/smart
// @desc    Get smart recommendations (preference-based or automatic fallback)
// @access  Private (Brand only)
router.get('/smart', brandRecommendationController_1.getSmartRecommendations);
exports.default = router;
