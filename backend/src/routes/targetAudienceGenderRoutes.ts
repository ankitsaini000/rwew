import express from 'express';
import TargetAudienceGender from '../models/TargetAudienceGender';

const router = express.Router();

// GET /api/target-audience-genders - Get all active target audience genders
router.get('/', async (req, res) => {
  try {
    const genders = await TargetAudienceGender.find({ isActive: true }).sort('name');
    res.json({ success: true, data: genders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch target audience genders', error: error instanceof Error ? error.message : error });
  }
});

export default router; 