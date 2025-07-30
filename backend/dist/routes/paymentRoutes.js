"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const paymentController = __importStar(require("../controllers/paymentController"));
const router = express_1.default.Router();
// @route   POST /api/payments
// @desc    Process a payment
// @access  Private
router.post('/', authMiddleware_1.protect, paymentController.processPayment);
// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authMiddleware_1.protect, paymentController.getUserPaymentHistory);
// @route   GET /api/payments/by-order/:orderId
// @desc    Get payment by order ID
// @access  Private
router.get('/by-order/:orderId', authMiddleware_1.protect, paymentController.getPaymentByOrderId);
// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', authMiddleware_1.protect, paymentController.getPaymentById);
// @route   POST /api/payments/razorpay/order
// @desc    Create a Razorpay order
// @access  Private
router.post('/razorpay/order', authMiddleware_1.protect, paymentController.createRazorpayOrder);
// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/razorpay/verify', authMiddleware_1.protect, paymentController.verifyRazorpayPayment);
exports.default = router;
