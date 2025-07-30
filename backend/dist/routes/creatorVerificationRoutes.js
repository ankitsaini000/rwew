"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creatorVerificationController_1 = require("../controllers/creatorVerificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get creator verification status
router.get('/', authMiddleware_1.protect, creatorVerificationController_1.getCreatorVerificationStatus);
// Submit or update creator verification
router.post('/', authMiddleware_1.protect, creatorVerificationController_1.submitCreatorVerification);
// Razorpay payment endpoints
router.post('/payment/order', authMiddleware_1.protect, creatorVerificationController_1.createCreatorVerificationPaymentOrder);
router.post('/payment/verify', authMiddleware_1.protect, creatorVerificationController_1.verifyCreatorVerificationPayment);
// Email verification endpoints
router.post('/email', authMiddleware_1.protect, creatorVerificationController_1.submitCreatorEmailVerification);
router.post('/email/verify', authMiddleware_1.protect, creatorVerificationController_1.verifyCreatorEmailCode);
// Phone verification endpoints
router.post('/phone', authMiddleware_1.protect, creatorVerificationController_1.submitCreatorPhoneVerification);
router.post('/phone/verify', authMiddleware_1.protect, creatorVerificationController_1.verifyCreatorPhoneCode);
// Get creator verification status by userId (admin)
router.get('/admin/:userId', authMiddleware_1.protect, creatorVerificationController_1.getCreatorVerificationByAdmin);
exports.default = router;
