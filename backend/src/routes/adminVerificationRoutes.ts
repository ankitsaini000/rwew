import express from 'express';
import { getAllVerificationDocuments, updateVerificationDocumentStatus } from '../controllers/adminVerificationController';
import { protect } from '../middleware/auth';

const router = express.Router();
router.get('/verification-documents', protect, getAllVerificationDocuments);
router.patch('/verification-documents/:id/status', protect, updateVerificationDocumentStatus);
export default router; 