import express from 'express';
import User from '../models/User';
import { CreatorProfile } from '../models/CreatorProfile';
import BrandProfile from '../models/BrandProfile';

const router = express.Router();

// Helper to get monthly counts for a model
async function getMonthlyCounts(model: any, dateField = 'createdAt') {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = await model.countDocuments({
      [dateField]: { $gte: start, $lt: end }
    });
    months.push({ month: start.toLocaleString('default', { month: 'short' }), value: count });
  }
  return months;
}

router.get('/active-users/monthly', async (req, res) => {
  // You may want to filter for isActive: true, or use login logs if you have them
  const data = await getMonthlyCounts(User);
  res.json({ data });
});

router.get('/creators/monthly', async (req, res) => {
  const data = await getMonthlyCounts(CreatorProfile);
  res.json({ data });
});

router.get('/brands/monthly', async (req, res) => {
  const data = await getMonthlyCounts(BrandProfile);
  res.json({ data });
});

export default router; 