"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandProfileController_1 = require("../controllers/brandProfileController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Assuming auth middleware
const router = express_1.default.Router();
// Admin or public route to get all brand profiles
router.get('/all', brandProfileController_1.getAllBrandProfiles);
// Public route to get brand profile by username
router.route('/:username').get(brandProfileController_1.getPublicBrandProfile);
router.route('/').get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['brand']), brandProfileController_1.getBrandProfile).post(authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['brand']), brandProfileController_1.createOrUpdateBrandProfile);
// Admin route to deactivate a brand profile
router.put('/:id/deactivate', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['admin']), brandProfileController_1.deactivateBrandProfile);
// Admin route to reactivate a brand profile
router.put('/:id/reactivate', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['admin']), brandProfileController_1.reactivateBrandProfile);
exports.default = router;
