import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SearchHistory from '../models/SearchHistory';
import User from '../models/User';

/**
 * @desc    Save search to history
 * @route   POST /api/search-history
 * @access  Private
 */
export const saveSearchHistory = asyncHandler(async (req: Request, res: Response) => {
  const { query, searchType, filters, resultsCount } = req.body;
  const userId = req.user._id;

  if (!query || !searchType) {
    res.status(400);
    throw new Error('Query and searchType are required');
  }

  // Get user agent and IP address
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // Check if user is a brand
  const user = await User.findById(userId);
  const brandId = user?.role === 'brand' ? userId : undefined;

  // Create search history entry
  const searchHistory = await SearchHistory.create({
    userId,
    brandId,
    query: query.trim(),
    searchType,
    filters,
    resultsCount,
    sessionId: req.sessionID,
    userAgent,
    ipAddress
  });

  res.status(201).json({
    success: true,
    data: searchHistory
  });
});

/**
 * @desc    Get user's search history
 * @route   GET /api/search-history
 * @access  Private
 */
export const getSearchHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { limit = 20, page = 1, searchType } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  // Build query
  const query: any = { userId };
  if (searchType) {
    query.searchType = searchType;
  }

  const searchHistory = await SearchHistory.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-userAgent -ipAddress -sessionId');

  const total = await SearchHistory.countDocuments(query);

  res.json({
    success: true,
    data: searchHistory,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * @desc    Get recent searches for recommendations
 * @route   GET /api/search-history/recent
 * @access  Private
 */
export const getRecentSearches = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { limit = 10 } = req.query;

  const recentSearches = await SearchHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('query searchType createdAt')
    .distinct('query');

  // Get unique queries with their latest timestamp
  const uniqueSearches = await SearchHistory.aggregate([
    { $match: { userId: userId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$query',
        query: { $first: '$query' },
        searchType: { $first: '$searchType' },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: Number(limit) }
  ]);

  res.json({
    success: true,
    data: uniqueSearches
  });
});

/**
 * @desc    Get search analytics for brand
 * @route   GET /api/search-history/analytics
 * @access  Private
 */
export const getSearchAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { days = 30 } = req.query;

  const user = await User.findById(userId);
  if (user?.role !== 'brand') {
    res.status(403);
    throw new Error('Only brands can access search analytics');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  // Get search statistics
  const searchStats = await SearchHistory.aggregate([
    { 
      $match: { 
        brandId: userId,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          searchType: "$searchType"
        },
        count: { $sum: 1 },
        uniqueQueries: { $addToSet: "$query" }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        totalSearches: { $sum: "$count" },
        searchTypes: {
          $push: {
            type: "$_id.searchType",
            count: "$count",
            uniqueQueries: { $size: "$uniqueQueries" }
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get popular search terms
  const popularSearches = await SearchHistory.aggregate([
    { 
      $match: { 
        brandId: userId,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: "$query",
        count: { $sum: 1 },
        lastSearched: { $max: "$createdAt" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get search type distribution
  const searchTypeDistribution = await SearchHistory.aggregate([
    { 
      $match: { 
        brandId: userId,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: "$searchType",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      searchStats,
      popularSearches,
      searchTypeDistribution,
      totalSearches: searchStats.reduce((sum, stat) => sum + stat.totalSearches, 0)
    }
  });
});

/**
 * @desc    Update search history with clicked creator
 * @route   PUT /api/search-history/:id/click
 * @access  Private
 */
export const updateSearchClick = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { creatorId } = req.body;
  const userId = req.user._id;

  if (!creatorId) {
    res.status(400);
    throw new Error('Creator ID is required');
  }

  const searchHistory = await SearchHistory.findOneAndUpdate(
    { _id: id, userId },
    { 
      $addToSet: { clickedCreators: creatorId }
    },
    { new: true }
  );

  if (!searchHistory) {
    res.status(404);
    throw new Error('Search history not found');
  }

  res.json({
    success: true,
    data: searchHistory
  });
});

/**
 * @desc    Clear user's search history
 * @route   DELETE /api/search-history
 * @access  Private
 */
export const clearSearchHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  await SearchHistory.deleteMany({ userId });

  res.json({
    success: true,
    message: 'Search history cleared successfully'
  });
});

/**
 * @desc    Get search recommendations based on history
 * @route   GET /api/search-history/recommendations
 * @access  Private
 */
export const getSearchRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { limit = 5 } = req.query;

  // Get user's recent search patterns
  const recentSearches = await SearchHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('query searchType filters');

  // Extract common patterns
  const searchPatterns = recentSearches.reduce((patterns, search) => {
    const key = search.searchType;
    if (!patterns[key]) {
      patterns[key] = [];
    }
    patterns[key].push(search.query);
    return patterns;
  }, {} as Record<string, string[]>);

  // Generate recommendations based on patterns
  const recommendations = [];
  
  // Text search recommendations
  if (searchPatterns.text && searchPatterns.text.length > 0) {
    const uniqueTextSearches = [...new Set(searchPatterns.text)];
    recommendations.push({
      type: 'text',
      queries: uniqueTextSearches.slice(0, 3)
    });
  }

  // Category recommendations
  if (searchPatterns.category && searchPatterns.category.length > 0) {
    const uniqueCategories = [...new Set(searchPatterns.category)];
    recommendations.push({
      type: 'category',
      queries: uniqueCategories.slice(0, 3)
    });
  }

  // Tag recommendations
  if (searchPatterns.tag && searchPatterns.tag.length > 0) {
    const uniqueTags = [...new Set(searchPatterns.tag)];
    recommendations.push({
      type: 'tag',
      queries: uniqueTags.slice(0, 3)
    });
  }

  res.json({
    success: true,
    data: recommendations.slice(0, Number(limit))
  });
});
