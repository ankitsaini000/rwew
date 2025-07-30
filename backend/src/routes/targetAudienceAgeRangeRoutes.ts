import express from 'express';
import TargetAudienceAgeRange from '../models/TargetAudienceAgeRange';

const router = express.Router();

// GET /api/target-audience-age-ranges - Get all active target audience age ranges
router.get('/', async (req, res) => {
  try {
    const ageRanges = await TargetAudienceAgeRange.find({ isActive: true }).sort('min');
    res.json({ success: true, data: ageRanges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch target audience age ranges', error: error instanceof Error ? error.message : error });
  }
});

export default router; 