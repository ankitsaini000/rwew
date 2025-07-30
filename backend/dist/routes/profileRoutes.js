"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload")); // Assuming you have this middleware
const ProfileController_1 = __importDefault(require("../controllers/ProfileController"));
const router = express_1.default.Router();
const profileController = ProfileController_1.default; // Use the exported instance
// @route   POST /api/profile/upload-image
// @desc    Upload profile or cover image
// @access  Private
router.post('/upload-image', auth_1.protect, upload_1.default.single('image'), profileController.uploadProfileImage);
exports.default = router;
