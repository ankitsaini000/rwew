import express from 'express';
import {
  getAllEventPricingRanges,
  createEventPricingRange,
  updateEventPricingRange,
  deleteEventPricingRange
} from '../controllers/eventPricingRangeController';

const router = express.Router();

router.get('/', getAllEventPricingRanges);
router.post('/', createEventPricingRange);
router.put('/:id', updateEventPricingRange);
router.delete('/:id', deleteEventPricingRange);

export default router; 