import express from 'express';
import {
  createOffer,
  getOffersByConversation,
  getUserOffers,
  acceptOffer,
  rejectOffer,
  counterOffer,
  getOfferById
} from '../controllers/offerController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Create a new offer
router.post('/', protect, createOffer);

// Get offers for a specific conversation
router.get('/conversation/:conversationId', protect, getOffersByConversation);

// Get user's offers (sent and received)
router.get('/user', protect, getUserOffers);

// Get a specific offer by ID
router.get('/:offerId', protect, getOfferById);

// Accept an offer
router.patch('/:offerId/accept', protect, acceptOffer);

// Reject an offer
router.patch('/:offerId/reject', protect, rejectOffer);

// Counter an offer
router.patch('/:offerId/counter', protect, counterOffer);

export default router; 