import express from 'express';
import {
  initializeBrandVerification,
  getBrandVerificationStatus,
  submitEmailVerification,
  submitPhoneVerification,
  submitPANVerification,
  submitGSTVerification,
  submitIDProofVerification,
  submitUPIVerification,
  submitCardVerification,
  getAllBrandVerifications,
  getBrandVerificationById,
  updateVerificationStatus,
  createBrandVerificationPaymentOrder,
  verifyBrandVerificationPayment,
  verifyEmailCode,
  verifyPhoneCode,
  getBrandVerificationByUserId
} from '../controllers/brandVerificationController';
import { protect, admin } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Initialize verification for new user
router.post('/initialize', protect, initializeBrandVerification);

// Get verification status for logged-in user
router.get('/', protect, getBrandVerificationStatus);

// Submit verification data routes
router.post('/email', protect, submitEmailVerification);
router.post('/email/verify', protect, verifyEmailCode);
router.post('/phone', protect, submitPhoneVerification);
router.post('/phone/verify', protect, verifyPhoneCode);
router.post('/pan', protect, upload.single('document'), submitPANVerification);
router.post('/gst', protect, upload.single('document'), submitGSTVerification);
router.post('/id-proof', protect, upload.single('document'), submitIDProofVerification);
router.post('/upi', protect, submitUPIVerification);
router.post('/card', protect, submitCardVerification);

// Razorpay payment endpoints
router.post('/payment/order', protect, createBrandVerificationPaymentOrder);
router.post('/payment/verify', protect, verifyBrandVerificationPayment);

// Add this route before admin routes
router.get('/:userId', protect, getBrandVerificationByUserId);

// Admin routes
router.get('/admin/all', protect, admin, getAllBrandVerifications);
router.get('/admin/:id', protect, admin, getBrandVerificationById);
router.put('/admin/:id/status', protect, admin, updateVerificationStatus);

export default router; 