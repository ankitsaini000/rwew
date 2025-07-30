"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandVerificationController_1 = require("../controllers/brandVerificationController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image and PDF files are allowed'));
        }
    }
});
// Initialize verification for new user
router.post('/initialize', auth_1.protect, brandVerificationController_1.initializeBrandVerification);
// Get verification status for logged-in user
router.get('/', auth_1.protect, brandVerificationController_1.getBrandVerificationStatus);
// Submit verification data routes
router.post('/email', auth_1.protect, brandVerificationController_1.submitEmailVerification);
router.post('/email/verify', auth_1.protect, brandVerificationController_1.verifyEmailCode);
router.post('/phone', auth_1.protect, brandVerificationController_1.submitPhoneVerification);
router.post('/phone/verify', auth_1.protect, brandVerificationController_1.verifyPhoneCode);
router.post('/pan', auth_1.protect, upload.single('document'), brandVerificationController_1.submitPANVerification);
router.post('/gst', auth_1.protect, upload.single('document'), brandVerificationController_1.submitGSTVerification);
router.post('/id-proof', auth_1.protect, upload.single('document'), brandVerificationController_1.submitIDProofVerification);
router.post('/upi', auth_1.protect, brandVerificationController_1.submitUPIVerification);
router.post('/card', auth_1.protect, brandVerificationController_1.submitCardVerification);
// Razorpay payment endpoints
router.post('/payment/order', auth_1.protect, brandVerificationController_1.createBrandVerificationPaymentOrder);
router.post('/payment/verify', auth_1.protect, brandVerificationController_1.verifyBrandVerificationPayment);
// Add this route before admin routes
router.get('/:userId', auth_1.protect, brandVerificationController_1.getBrandVerificationByUserId);
// Admin routes
router.get('/admin/all', auth_1.protect, auth_1.admin, brandVerificationController_1.getAllBrandVerifications);
router.get('/admin/:id', auth_1.protect, auth_1.admin, brandVerificationController_1.getBrandVerificationById);
router.put('/admin/:id/status', auth_1.protect, auth_1.admin, brandVerificationController_1.updateVerificationStatus);
exports.default = router;
