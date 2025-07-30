import express from 'express';
import SocialMediaPreference from '../models/SocialMediaPreference';

const router = express.Router();

// GET /api/social-media-preferences - Get all active social media preferences
router.get('/', async (req, res) => {
  try {
    const preferences = await SocialMediaPreference.find({ isActive: true }).sort('name');
    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch social media preferences', error: error instanceof Error ? error.message : error });
  }
});

export default router; 