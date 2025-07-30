import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  updateSubmissionStatus,
  getBrandSubmissions,
  releasePayment,
  getAllWorkSubmissionsAdmin,
  getWorkSubmissionById
} from '../controllers/workSubmissionController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Brand routes
router.get('/brand', authorize('brand'), getBrandSubmissions);
router.put('/:submissionId/status', authorize('brand'), updateSubmissionStatus);
router.post('/:submissionId/release-payment', authorize('brand'), releasePayment);

// Admin route
router.get('/admin/all', protect, getAllWorkSubmissionsAdmin);
// Single work submission by ID
router.get('/:id', protect, getWorkSubmissionById);

export default router; 