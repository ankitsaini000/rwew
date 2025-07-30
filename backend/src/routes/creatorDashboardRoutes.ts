// Use require syntax to avoid TypeScript import issues
const express = require('express');
import { Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import * as creatorDashboardController from '../controllers/creatorDashboardController';

const router = express.Router();

// Add a test route that doesn't require authorization for debugging
router.get('/test', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Creator dashboard routes are working' });
});

// Apply protection middleware to all protected routes
router.use(protect);
router.use(authorize('creator'));

// Dashboard routes
router.get('/', creatorDashboardController.getDashboardData);
router.put('/metrics', creatorDashboardController.updateCreatorMetrics);
router.put('/performance', creatorDashboardController.updatePerformanceData);

// New specific dashboard endpoints
router.get('/metrics', creatorDashboardController.getDashboardMetrics);
router.get('/social-metrics', creatorDashboardController.getSocialMetrics);
router.post('/test-response-data', creatorDashboardController.createTestResponseData);

// Log registered routes
console.log('Creator Dashboard Routes:');
router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(`${Object.keys(r.route.methods).join(',')} /api/creator-dashboard${r.route.path}`);
  }
});

export default router; 