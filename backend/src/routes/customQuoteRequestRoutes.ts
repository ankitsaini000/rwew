import express from 'express';
import CustomQuoteRequestController from '../controllers/customQuoteRequestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new quote request (brand only)
router.post('/', protect, CustomQuoteRequestController.createCustomQuoteRequest);

// Get all quote requests for the currently logged-in creator
router.get('/creator', protect, CustomQuoteRequestController.getRequestsForCurrentCreator);

// Get all quote requests for a creator
router.get('/creator/:creatorId', protect, CustomQuoteRequestController.getRequestsForCreator);

// Get all custom quote requests made by a specific brand
router.get('/brand/:brandId', protect, CustomQuoteRequestController.getRequestsByBrand);

// Get all custom quote requests for a brand by username
router.get('/brand-username/:username', protect, CustomQuoteRequestController.getRequestsByBrandUsername);

// Get all quote requests (admin only)
router.get('/admin/all', protect, CustomQuoteRequestController.getAllQuoteRequestsAdmin);

// Get a single custom quote request by ID
router.get('/:requestId', protect, CustomQuoteRequestController.getCustomQuoteRequestById);

// Update the status of a custom quote request (creator only)
router.patch('/:requestId/status', protect, CustomQuoteRequestController.updateRequestStatus);

// Accept a quote request (creator only)
router.post('/:requestId/accept', protect, CustomQuoteRequestController.acceptQuoteRequest);

// Reject a quote request (creator only)
router.post('/:requestId/reject', protect, CustomQuoteRequestController.rejectQuoteRequest);

export default router; 