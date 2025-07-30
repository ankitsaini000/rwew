import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import * as paymentController from '../controllers/paymentController';

const router = express.Router();

// @route   POST /api/payments
// @desc    Process a payment
// @access  Private
router.post('/', protect, paymentController.processPayment);

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', protect, paymentController.getUserPaymentHistory);

// @route   GET /api/payments/by-order/:orderId
// @desc    Get payment by order ID
// @access  Private
router.get('/by-order/:orderId', protect, paymentController.getPaymentByOrderId);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, paymentController.getPaymentById);

// @route   POST /api/payments/razorpay/order
// @desc    Create a Razorpay order
// @access  Private
router.post('/razorpay/order', protect, paymentController.createRazorpayOrder);

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/razorpay/verify', protect, paymentController.verifyRazorpayPayment);

export default router; 