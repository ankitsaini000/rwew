import express from 'express';
import Language from '../models/Language';

const router = express.Router();

// GET /api/languages - Get all active languages
router.get('/', async (req, res) => {
  try {
    const languages = await Language.find({ isActive: true }).sort('name');
    res.json({ success: true, data: languages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch languages', error: error instanceof Error ? error.message : error });
  }
});

export default router; 