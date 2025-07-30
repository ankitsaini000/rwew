"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandExperienceReviewController_1 = require("../controllers/brandExperienceReviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Creator rates brand for an order
router.post('/', auth_1.protect, brandExperienceReviewController_1.createBrandExperienceReview);
// Get all reviews for a brand
router.get('/brand/:brandId', brandExperienceReviewController_1.getBrandExperienceReviews);
// Get review for a specific order
router.get('/order/:orderId', auth_1.protect, brandExperienceReviewController_1.getBrandExperienceReviewByOrder);
exports.default = router;
