import express from 'express';
import { getCreatorVerificationStatus, submitCreatorVerification, createCreatorVerificationPaymentOrder, verifyCreatorVerificationPayment, submitCreatorEmailVerification, verifyCreatorEmailCode, submitCreatorPhoneVerification, verifyCreatorPhoneCode, getCreatorVerificationByAdmin } from '../controllers/creatorVerificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Get creator verification status
router.get('/', protect, getCreatorVerificationStatus);

// Submit or update creator verification
router.post('/', protect, submitCreatorVerification);

// Razorpay payment endpoints
router.post('/payment/order', protect, createCreatorVerificationPaymentOrder);
router.post('/payment/verify', protect, verifyCreatorVerificationPayment);

// Email verification endpoints
router.post('/email', protect, submitCreatorEmailVerification);
router.post('/email/verify', protect, verifyCreatorEmailCode);

// Phone verification endpoints
router.post('/phone', protect, submitCreatorPhoneVerification);
router.post('/phone/verify', protect, verifyCreatorPhoneCode);

// Get creator verification status by userId (admin)
router.get('/admin/:userId', protect, getCreatorVerificationByAdmin);

export default router; 