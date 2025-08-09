import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as searchHistoryController from '../controllers/searchHistoryController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Save search to history
router.post('/', searchHistoryController.saveSearchHistory);

// Get user's search history
router.get('/', searchHistoryController.getSearchHistory);

// Get recent searches for recommendations
router.get('/recent', searchHistoryController.getRecentSearches);

// Get search analytics (brand only)
router.get('/analytics', searchHistoryController.getSearchAnalytics);

// Get search recommendations based on history
router.get('/recommendations', searchHistoryController.getSearchRecommendations);

// Update search history with clicked creator
router.put('/:id/click', searchHistoryController.updateSearchClick);

// Clear user's search history
router.delete('/', searchHistoryController.clearSearchHistory);

export default router;
