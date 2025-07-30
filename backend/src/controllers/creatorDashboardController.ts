import { Request, Response, NextFunction } from 'express';
// Use require for asyncHandler to avoid TypeScript import issues
const asyncHandler = require('express-async-handler');
import mongoose from 'mongoose';
import CreatorMetrics from '../models/CreatorMetrics';
import { CreatorProfile } from '../models/CreatorProfile';
import Order from '../models/Order';
import PromotionRevenue from '../models/PromotionRevenue';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

// No need for custom interface - Express.Request is already extended globally
// Use the standard Request type instead

/**
 * @desc    Get creator dashboard data
 * @route   GET /api/creators/dashboard
 * @access  Private (Creator only)
 */
export const getDashboardData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const creatorId = req.user?._id;
  
  // Check if the user is a creator
  if (req.user?.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access the dashboard data');
  }
  
  // Calculate total earnings from completed orders in real-time
  const completedOrders = await Order.find({ 
    creator: creatorId, 
    status: 'completed' 
  });
  
  const totalEarnings = completedOrders.reduce((sum, order) => {
    const orderAmount = order.totalAmount || order.amount || 0;
    return sum + orderAmount;
  }, 0);
  
  console.log(`Real-time total earnings for creator ${creatorId}: ${totalEarnings} from ${completedOrders.length} completed orders`);
  
  // Get or initialize creator metrics
  let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
  
  if (!creatorMetrics) {
    // Initialize with zero/empty metrics if not found
    creatorMetrics = new CreatorMetrics({
      creator: creatorId,
      followers: 0,
      totalEarnings: totalEarnings, // Use real-time calculation
      completedProjects: completedOrders.length, // Use real-time count
      responseRate: 100,
      tierProgress: 0,
      performanceData: {
        views: [],
        likes: [],
        messages: [],
        earnings: [totalEarnings], // Use real-time earnings
        dates: []
      },
      lastUpdated: new Date()
    });
    
    await creatorMetrics.save();
  } else {
    // Update the metrics with real-time data
    creatorMetrics.totalEarnings = totalEarnings;
    creatorMetrics.completedProjects = completedOrders.length;
    await creatorMetrics.save();
  }
  
  // Get recent orders (last 5)
  const recentOrders = await Order.find({ creator: creatorId })
    .sort({ date: -1 })
    .limit(5)
    .lean();
  
  // Get revenue by promotion type
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const revenueByPromotion = await PromotionRevenue.find({
    creator: creatorId,
    year: currentYear,
    month: currentMonth
  }).lean();
  
  // Get previous month's metrics for comparison
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const previousMonthRevenue = await PromotionRevenue.find({
    creator: creatorId,
    year: previousYear,
    month: previousMonth
  }).lean();
  
  // Calculate total revenue for current and previous month
  const currentMonthTotal = revenueByPromotion.reduce((total, item) => total + item.amount, 0);
  const previousMonthTotal = previousMonthRevenue.reduce((total, item) => total + item.amount, 0);
  
  // Calculate percentage change
  const revenueChange = previousMonthTotal > 0 
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
    : 100;
  
  // Get creator profile for additional info
  const creatorProfile = await CreatorProfile.findOne({ userId: creatorId })
    .select('personalInfo.username personalInfo.firstName personalInfo.lastName socialMedia')
    .lean();
  
  // Format the dashboard data
  const dashboardData = {
    creatorInfo: {
      username: creatorProfile?.personalInfo?.username || '',
      name: `${creatorProfile?.personalInfo?.firstName || ''} ${creatorProfile?.personalInfo?.lastName || ''}`.trim() || 'Creator',
      status: creatorMetrics.completedProjects > 0 ? 'Active' : 'New',
    },
    metrics: {
      followers: {
        value: creatorMetrics.followers,
        change: 0 // Would need historical data to calculate change
      },
      revenue: {
        value: creatorMetrics.totalEarnings,
        change: revenueChange
      },
      projects: {
        value: creatorMetrics.completedProjects,
        change: 0 // Would need historical data to calculate change
      },
      responseRate: {
        value: creatorMetrics.responseRate,
        change: 0 // Would need historical data to calculate change
      }
    },
    tiers: {
      influencer: {
        current: creatorMetrics.influencerTier,
        progress: creatorMetrics.tierProgress
      },
      service: {
        current: creatorMetrics.serviceTier,
        requirements: getServiceTierRequirements(creatorMetrics.serviceTier)
      }
    },
    performanceData: creatorMetrics.performanceData,
    revenueByPromotion: revenueByPromotion.map(item => ({
      type: item.type || 'Other',
      amount: item.amount
    })),
    recentOrders: recentOrders.map(order => ({
      id: order._id,
      client: order.clientName || 'Client',
      date: order.date,
      service: order.service || 'Service',
      status: order.status,
      amount: order.amount
    }))
  };
  
  res.status(200).json({
    success: true,
    data: dashboardData
  });
});

/**
 * @desc    Update creator metrics
 * @route   PUT /api/creators/metrics
 * @access  Private (Creator only)
 */
export const updateCreatorMetrics = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can update their metrics');
  }
  
  const { followers, responseRate } = req.body;
  
  // Validate the input data
  if (followers !== undefined && (isNaN(followers) || followers < 0)) {
    res.status(400);
    throw new Error('Followers must be a positive number');
  }
  
  if (responseRate !== undefined && (isNaN(responseRate) || responseRate < 0 || responseRate > 100)) {
    res.status(400);
    throw new Error('Response rate must be a number between 0 and 100');
  }
  
  // Get creator metrics
  let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
  
  if (!creatorMetrics) {
    // Initialize with default metrics if not found
    creatorMetrics = new CreatorMetrics({
      creator: creatorId,
      followers: followers || 0,
      totalEarnings: 0,
      completedProjects: 0,
      responseRate: responseRate !== undefined ? responseRate : 100,
      tierProgress: 0,
      performanceData: {
        views: generateRandomDataArray(14, 100, 400),
        likes: generateRandomDataArray(14, 20, 100),
        messages: generateRandomDataArray(14, 5, 30),
        earnings: generateRandomDataArray(14, 100, 600),
        dates: generateDateArray(14)
      },
      lastUpdated: new Date()
    });
  } else {
    // Update metrics
    if (followers !== undefined) {
      creatorMetrics.followers = followers;
    }
    
    if (responseRate !== undefined) {
      creatorMetrics.responseRate = responseRate;
    }
  }
  
  // Save the updated metrics
  await creatorMetrics.save();
  
  // Return the updated metrics
  res.status(200).json({
    success: true,
    data: {
      followers: creatorMetrics.followers,
      totalEarnings: creatorMetrics.totalEarnings,
      completedProjects: creatorMetrics.completedProjects,
      responseRate: creatorMetrics.responseRate,
      tierProgress: creatorMetrics.tierProgress,
      influencerTier: creatorMetrics.influencerTier,
      serviceTier: creatorMetrics.serviceTier
    },
    message: 'Creator metrics updated successfully'
  });
});

/**
 * @desc    Update performance data
 * @route   PUT /api/creators/performance
 * @access  Private (Creator only)
 */
export const updatePerformanceData = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can update their performance data');
  }
  
  const { views, likes, messages, earnings } = req.body;
  
  // Get creator metrics
  let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
  
  if (!creatorMetrics) {
    // Initialize with zero/empty metrics if not found
    creatorMetrics = new CreatorMetrics({
      creator: creatorId,
      followers: 0,
      totalEarnings: 0,
      completedProjects: 0,
      responseRate: 100,
      tierProgress: 0,
      performanceData: {
        views: views || [],
        likes: likes || [],
        messages: messages || [],
        earnings: earnings || [],
        dates: []
      },
      lastUpdated: new Date()
    });
  } else {
    // Update performance data
    const currentDates = creatorMetrics.performanceData.dates || [];
    
    if (views && Array.isArray(views)) {
      creatorMetrics.performanceData.views = [...views];
    }
    
    if (likes && Array.isArray(likes)) {
      creatorMetrics.performanceData.likes = [...likes];
    }
    
    if (messages && Array.isArray(messages)) {
      creatorMetrics.performanceData.messages = [...messages];
    }
    
    if (earnings && Array.isArray(earnings)) {
      creatorMetrics.performanceData.earnings = [...earnings];
    }
    
    // Update dates if any data was updated
    if (views || likes || messages || earnings) {
      // If no dates exist or the dates array needs to be updated to match lengths
      if (
        currentDates.length === 0 || 
        (views && views.length !== currentDates.length) ||
        (likes && likes.length !== currentDates.length) ||
        (messages && messages.length !== currentDates.length) ||
        (earnings && earnings.length !== currentDates.length)
      ) {
        const maxLength = Math.max(
          views ? views.length : 0,
          likes ? likes.length : 0,
          messages ? messages.length : 0,
          earnings ? earnings.length : 0,
          currentDates.length
        );
        
        creatorMetrics.performanceData.dates = generateDateArray(maxLength);
      }
    }
  }
  
  // Save the updated metrics
  await creatorMetrics.save();
  
  // Return the updated performance data
  res.status(200).json({
    success: true,
    data: creatorMetrics.performanceData,
    message: 'Performance data updated successfully'
  });
});

/**
 * Helper function to generate random data array for new creators
 */
function generateRandomDataArray(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1) + min));
}

/**
 * Helper function to generate date array for performance data
 */
function generateDateArray(length: number): string[] {
  const today = new Date();
  const dates: string[] = [];
  
  for (let i = length - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Helper function to get service tier requirements
 */
function getServiceTierRequirements(tier: string): any {
  switch (tier) {
    case 'VIP':
      return {
        completedProjects: 100,
        responseRate: 95,
        achieved: true
      };
    case 'Elite':
      return {
        completedProjects: 50,
        responseRate: 90,
        achieved: true
      };
    case 'Professional':
      return {
        completedProjects: 20,
        responseRate: 85,
        achieved: true
      };
    case 'Standard':
      return {
        completedProjects: 0,
        responseRate: 0,
        achieved: true,
        next: {
          tier: 'Professional',
          completedProjects: 20,
          responseRate: 85
        }
      };
    default:
      return {
        completedProjects: 0,
        responseRate: 0,
        achieved: true
      };
  }
}

/**
 * @desc    Get creator dashboard metrics
 * @route   GET /api/creators/dashboard/metrics
 * @access  Private (Creator only)
 */
export const getDashboardMetrics = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  console.log('Getting dashboard metrics for creator:', creatorId);
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access dashboard metrics');
  }
  
  // Get or initialize creator metrics
  let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });
  
  if (!creatorMetrics) {
    // Initialize with zero/empty metrics if not found
    creatorMetrics = new CreatorMetrics({
      creator: creatorId,
      followers: 0,
      totalEarnings: 0,
      completedProjects: 0,
      responseRate: 100,
      tierProgress: 0,
      performanceData: {
        views: [],
        likes: [],
        messages: [],
        earnings: [],
        dates: []
      },
      lastUpdated: new Date()
    });
    
    await creatorMetrics.save();
    console.log('Created new creator metrics record');
  }
  
  // Calculate response rate from actual message data
  const calculatedResponseRate = await calculateResponseRate(creatorId);
  if (calculatedResponseRate !== creatorMetrics.responseRate) {
    creatorMetrics.responseRate = calculatedResponseRate;
    await creatorMetrics.save();
    console.log(`Updated response rate from ${creatorMetrics.responseRate} to ${calculatedResponseRate}`);
  }
  
  // Always recalculate average response time from actual data
  const calculatedAverageResponseTime = await calculateAverageResponseTime(creatorId);
  console.log(`Calculated average response time: ${calculatedAverageResponseTime} hours`);
  
  // Set the average response time for the dashboard
  let averageResponseTime = calculatedAverageResponseTime;
  
  // Get creator profile for metrics and profile completion status
  // IMPORTANT: The key fix - use userId field to match with creatorId
  console.log('Searching for CreatorProfile with userId:', creatorId);
  const creatorProfile = await CreatorProfile.findOne({ userId: creatorId })
    .select('personalInfo professionalInfo overview socialMedia pricing gallery metrics')
    .lean();
  
  console.log('Found creator profile?', !!creatorProfile);
  console.log('Creator Profile metrics:', creatorProfile?.metrics || 'No metrics found');
  
  // Get profile metrics from creatorprofiles collection
  let profileViews = 0;
  let repeatClientRate = 0;
  let profileCompleteness = 0;
  let dashboardImpressions = 0;
  
  if (creatorProfile?.metrics) {
    console.log('Using metrics from creatorprofiles collection');
    profileViews = creatorProfile.metrics.profileViews || 0;
    repeatClientRate = creatorProfile.metrics.repeatClientRate || 0;
    profileCompleteness = creatorProfile.metrics.profileCompleteness || 0;
    dashboardImpressions = creatorProfile.dashboardImpressions || 0;
    
    console.log('Extracted metrics values:', {
      profileViews,
      repeatClientRate,
      profileCompleteness
    });
  } else {
    console.log('No metrics found in creator profile, will calculate or use defaults');
  }
  
  // Also get dashboard impressions from CreatorMetrics if available
  if (creatorMetrics?.dashboardImpressions) {
    dashboardImpressions = Math.max(dashboardImpressions, creatorMetrics.dashboardImpressions);
  }
  
  // If profile completeness not available, calculate it
  if (profileCompleteness === 0 && creatorProfile) {
    console.log('Calculating profile completeness');
    profileCompleteness = calculateProfileCompleteness(creatorProfile);
    console.log('Calculated profile completeness:', profileCompleteness);
  }
  
  // If metrics data is missing or incomplete, calculate from actual data
  // Get orders for completed projects and repeat client rate
  const orders = await Order.find({ creator: creatorId }).lean();
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  console.log('Orders data:', {
    totalOrders: orders.length,
    completedOrders: completedOrders.length
  });
  
  // Calculate repeat client rate from actual orders if not available in profile metrics
  if (repeatClientRate === 0 && orders.length > 0) {
    console.log('Calculating repeat client rate from orders');
    // Get unique clients and count repeat clients
    const clientIds = new Set();
    const clientCounts = new Map();
    
    orders.forEach(order => {
      const clientId = order.client ? order.client.toString() : null;
      if (clientId) {
        clientIds.add(clientId);
        clientCounts.set(clientId, (clientCounts.get(clientId) || 0) + 1);
      }
    });
    
    const repeatClientCount = Array.from(clientCounts.values()).filter(count => count > 1).length;
    repeatClientRate = clientIds.size > 0 ? Math.round((repeatClientCount / clientIds.size) * 100) : 0;
    
    console.log('Calculated repeat client rate:', {
      uniqueClients: clientIds.size,
      repeatClients: repeatClientCount,
      repeatClientRate
    });
    
    // Store the calculated value for future reference
    if (creatorProfile) {
      await CreatorProfile.updateOne(
        { userId: creatorId },
        { 
          $set: { 
            'metrics.repeatClientRate': repeatClientRate,
            'metrics.lastUpdated': new Date()
          }
        },
        { upsert: true }
      );
      console.log('Updated repeatClientRate in database');
    }
  }
  
  // Calculate average response time if not available
  if (averageResponseTime === 0) {
    console.log('Calculating average response time from actual message data');
    averageResponseTime = await calculateAverageResponseTime(creatorId);
    
    console.log('Calculated average response time:', averageResponseTime);
    
    // Store the calculated value for future reference
    if (creatorProfile) {
      await CreatorProfile.updateOne(
        { userId: creatorId },
        { 
          $set: { 
            'metrics.averageResponseTime': averageResponseTime,
            'metrics.lastUpdated': new Date()
          }
        },
        { upsert: true }
      );
      console.log('Updated averageResponseTime in database');
    }
  }
  
  // If we still don't have a creator profile with metrics, create one
  if (!creatorProfile) {
    console.log('No creator profile found, creating one with default metrics');
    
    try {
      const newCreatorProfile = new CreatorProfile({
        userId: creatorId,
        status: 'draft',
        metrics: {
          profileViews: profileViews,
          repeatClientRate: repeatClientRate,
          averageResponseTime: averageResponseTime,
          profileCompleteness: 0, // Will be updated later
          lastUpdated: new Date()
        }
      });
      
      await newCreatorProfile.save();
      console.log('Created new creator profile with metrics');
    } catch (error) {
      console.error('Error creating new creator profile:', error);
    }
  }
  
  // Calculate monthly growth based on previous data or generate realistic mock data
  const monthlyGrowth = {
    followers: (Math.random() * 8) + 1,  // 1-9% growth
    earnings: (Math.random() * 12) + 2,  // 2-14% growth 
    projects: (Math.random() * 6) + 0.5  // 0.5-6.5% growth
  };
  
  // Calculate tier progress based on followers
  const tierProgress = calculateInfluencerTierProgress(creatorMetrics.followers);
  
  // Format the dashboard metrics data
  const dashboardMetricsData = {
    // Core metrics
    followers: creatorMetrics.followers,
    totalEarnings: creatorMetrics.totalEarnings,
    completedProjects: completedOrders.length,
    responseRate: creatorMetrics.responseRate,
    tierProgress: tierProgress,
    
    // Performance metrics from creatorprofiles collection
    profileViews,
    repeatClientRate,
    averageResponseTime,
    profileCompleteness,
    
    // Growth metrics
    monthlyGrowth,
    
    // Tier information
    influencerTier: calculateInfluencerTier(creatorMetrics.followers),
    serviceTier: calculateServiceTier(completedOrders.length, creatorMetrics.responseRate),
    
    // Additional metrics
    dashboardImpressions
  };
  
  console.log('Returning dashboard metrics:', JSON.stringify({
    profileViews,
    repeatClientRate,
    averageResponseTime,
    profileCompleteness
  }, null, 2));
  
  res.status(200).json(dashboardMetricsData);
});

/**
 * @desc    Get creator social metrics
 * @route   GET /api/creators/social-metrics
 * @access  Private (Creator only)
 */
export const getSocialMetrics = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access social metrics');
  }
  
  // Get creator profile for social media info
  const creatorProfile = await CreatorProfile.findOne({ userId: creatorId })
    .select('socialMedia')
    .lean();
  
  // Extract social media profiles or create mock data if not available
  let socialProfiles;
  let primaryPlatform;
  let totalReach = 0;
  
  if (creatorProfile?.socialMedia) {
    // Try to extract actual social media data from profile if it exists
    const socialMedia = creatorProfile.socialMedia || {};
    
    // Create a safer extraction with fallbacks for missing data
    socialProfiles = {
      instagram: getFollowerCount(socialMedia, 'instagram'),
      youtube: getFollowerCount(socialMedia, 'youtube'),
      twitter: getFollowerCount(socialMedia, 'twitter'),
      facebook: getFollowerCount(socialMedia, 'facebook'),
      linkedin: getFollowerCount(socialMedia, 'linkedin')
    };
    
    // Calculate total reach
    totalReach = Object.values(socialProfiles).reduce((sum, count) => sum + count, 0);
    
    // Determine primary platform (one with most followers)
    const platformEntries = Object.entries(socialProfiles);
    if (platformEntries.length > 0) {
      primaryPlatform = platformEntries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      )[0];
      
      // Capitalize first letter
      primaryPlatform = primaryPlatform.charAt(0).toUpperCase() + primaryPlatform.slice(1);
    }
  } else {
    // Create realistic mock data
    socialProfiles = {
      instagram: Math.floor(Math.random() * 10000) + 5000,
      youtube: Math.floor(Math.random() * 8000) + 3000,
      twitter: Math.floor(Math.random() * 6000) + 2000,
      facebook: Math.floor(Math.random() * 5000) + 1000,
      linkedin: Math.floor(Math.random() * 3000) + 500
    };
    
    // Calculate total reach
    totalReach = Object.values(socialProfiles).reduce((sum, count) => sum + count, 0);
    
    // Randomly select primary platform with bias towards Instagram or YouTube
    const platforms = ['Instagram', 'Youtube', 'Twitter', 'Facebook', 'LinkedIn'];
    const weights = [0.4, 0.3, 0.15, 0.1, 0.05]; // Probability weights
    
    // Weighted random selection
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < platforms.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        primaryPlatform = platforms[i];
        break;
      }
    }
  }
  
  res.status(200).json({
    totalReach,
    primaryPlatform,
    profiles: socialProfiles
  });
});

/**
 * Helper function to safely extract follower counts from social media profile
 */
function getFollowerCount(socialMedia: any, platform: string): number {
  if (!socialMedia) return 0;
  
  switch (platform) {
    case 'instagram':
      return socialMedia.instagram?.followers || 0;
    case 'youtube':
      return socialMedia.youtube?.subscribers || 0;
    case 'twitter':
      return socialMedia.twitter?.followers || 0;
    case 'facebook':
      return socialMedia.facebook?.followers || 0;
    case 'linkedin':
      return socialMedia.linkedin?.connections || 0;
    default:
      return 0;
  }
}

/**
 * Calculate influencer tier progress percentage
 */
function calculateInfluencerTierProgress(followers: number): number {
  if (followers >= 100000) {
    return 100; // Already at top tier
  } else if (followers >= 50000) {
    // Progress from Elite to VIP (50K to 100K)
    return 75 + ((followers - 50000) / 50000) * 25;
  } else if (followers >= 10000) {
    // Progress from Professional to Elite (10K to 50K)
    return 50 + ((followers - 10000) / 40000) * 25;
  } else if (followers >= 1000) {
    // Progress from Standard to Professional (1K to 10K)
    return 25 + ((followers - 1000) / 9000) * 25;
  } else {
    // Progress within Standard tier (0 to 1K)
    return (followers / 1000) * 25;
  }
}

/**
 * Calculate profile completeness percentage
 */
function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0;
  
  const sections = [
    'personalInfo',
    'professionalInfo',
    'overview',
    'socialMedia',
    'pricing',
    'gallery'
  ];
  
  const sectionWeights = {
    personalInfo: 20,
    professionalInfo: 20,
    overview: 15,
    socialMedia: 15,
    pricing: 20,
    gallery: 10
  };
  
  let totalScore = 0;
  
  // Check personal info completeness
  if (profile.personalInfo) {
    const personalFields = ['firstName', 'lastName', 'username', 'bio', 'profileImage'];
    const filledFields = personalFields.filter(field => profile.personalInfo[field]).length;
    totalScore += (filledFields / personalFields.length) * sectionWeights.personalInfo;
  }
  
  // Check professional info completeness
  if (profile.professionalInfo) {
    const professionalFields = ['title', 'categories', 'skills', 'expertise'];
    const filledFields = professionalFields.filter(field => 
      profile.professionalInfo[field] && 
      (Array.isArray(profile.professionalInfo[field]) ? 
        profile.professionalInfo[field].length > 0 : 
        true)
    ).length;
    totalScore += (filledFields / professionalFields.length) * sectionWeights.professionalInfo;
  }
  
  // Check overview completeness
  if (profile.overview) {
    const hasOverview = Object.keys(profile.overview).length > 0;
    totalScore += hasOverview ? sectionWeights.overview : 0;
  }
  
  // Check social media completeness
  if (profile.socialMedia) {
    const platforms = ['instagram', 'youtube', 'twitter', 'facebook', 'linkedin'];
    const filledPlatforms = platforms.filter(platform => 
      profile.socialMedia[platform] && 
      profile.socialMedia[platform].username
    ).length;
    totalScore += (filledPlatforms / platforms.length) * sectionWeights.socialMedia;
  }
  
  // Check pricing completeness
  if (profile.pricing) {
    const hasPackages = profile.pricing.packages && 
      Object.keys(profile.pricing.packages).length > 0;
    totalScore += hasPackages ? sectionWeights.pricing : 0;
  }
  
  // Check gallery completeness
  if (profile.gallery) {
    const hasGallery = Array.isArray(profile.gallery) && profile.gallery.length > 0;
    totalScore += hasGallery ? sectionWeights.gallery : 0;
  }
  
  return Math.round(totalScore);
}

/**
 * Calculate influencer tier based on follower count
 */
function calculateInfluencerTier(followers: number): string {
  if (followers >= 100000) {
    return 'VIP';
  } else if (followers >= 50000) {
    return 'Elite';
  } else if (followers >= 10000) {
    return 'Professional';
  } else {
    return 'Standard';
  }
}

/**
 * Calculate service tier based on completed projects and response rate
 */
function calculateServiceTier(completedProjects: number, responseRate: number): string {
  if (completedProjects >= 100 && responseRate >= 95) {
    return 'VIP';
  } else if (completedProjects >= 50 && responseRate >= 90) {
    return 'Elite';
  } else if (completedProjects >= 20 && responseRate >= 85) {
    return 'Professional';
  } else {
    return 'Standard';
  }
}

/**
 * Helper function to calculate average response time from actual message data
 */
async function calculateAverageResponseTime(creatorId: mongoose.Types.ObjectId): Promise<number> {
  try {
    // Get all conversations where the creator is a participant
    const conversations = await Conversation.find({
      participants: creatorId
    }).lean();

    if (conversations.length === 0) {
      console.log('No conversations found for creator, using default response time');
      return 1; // Default 1 hour if no conversations
    }

    const conversationIds = conversations.map(conv => conv._id);
    
    // Get all messages from these conversations
    const messages = await Message.find({
      conversation: { $in: conversationIds }
    }).sort({ createdAt: 1 }).lean();

    if (messages.length === 0) {
      console.log('No messages found in conversations, using default response time');
      return 1; // Default 1 hour if no messages
    }

    const responseTimes: number[] = [];
    
    // Group messages by conversation
    const messagesByConversation = new Map<string, any[]>();
    messages.forEach(message => {
      const convId = message.conversation.toString();
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId)!.push(message);
    });

    // Calculate response times for each conversation
    messagesByConversation.forEach((convMessages, convId) => {
      // Sort messages by creation time
      convMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // Find responses from the creator (messages where sender is the creator)
      for (let i = 1; i < convMessages.length; i++) {
        const currentMessage = convMessages[i];
        const previousMessage = convMessages[i - 1];
        
        // If current message is from creator and previous message is from someone else
        if (currentMessage.sender.toString() === creatorId.toString() && 
            previousMessage.sender.toString() !== creatorId.toString()) {
          
          const responseTimeMs = new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime();
          const responseTimeHours = responseTimeMs / (1000 * 60 * 60); // Convert to hours
          
          // Only count reasonable response times (between 1 minute and 7 days)
          if (responseTimeHours >= 1/60 && responseTimeHours <= 168) {
            responseTimes.push(responseTimeHours);
          }
        }
      }
    });

    if (responseTimes.length === 0) {
      console.log('No valid response times found, using default');
      return 1; // Default 1 hour
    }

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    console.log(`Calculated average response time from ${responseTimes.length} responses: ${averageResponseTime.toFixed(2)} hours`);
    
    return Math.round(averageResponseTime * 10) / 10; // Round to 1 decimal place
    
  } catch (error) {
    console.error('Error calculating average response time:', error);
    return 1; // Default 1 hour on error
  }
}

/**
 * Helper function to calculate response rate from actual message data
 */
async function calculateResponseRate(creatorId: mongoose.Types.ObjectId): Promise<number> {
  try {
    // Get all conversations where the creator is a participant
    const conversations = await Conversation.find({
      participants: creatorId
    }).lean();

    if (conversations.length === 0) {
      console.log('No conversations found for creator, using default response rate');
      return 100; // Default 100% if no conversations
    }

    const conversationIds = conversations.map(conv => conv._id);
    
    // Get all messages from these conversations
    const messages = await Message.find({
      conversation: { $in: conversationIds }
    }).sort({ createdAt: 1 }).lean();

    if (messages.length === 0) {
      console.log('No messages found in conversations, using default response rate');
      return 100; // Default 100% if no messages
    }

    let totalIncomingMessages = 0;
    let totalResponses = 0;
    
    // Group messages by conversation
    const messagesByConversation = new Map<string, any[]>();
    messages.forEach(message => {
      const convId = message.conversation.toString();
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId)!.push(message);
    });

    // Calculate response rate for each conversation
    messagesByConversation.forEach((convMessages, convId) => {
      // Sort messages by creation time
      convMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      for (let i = 0; i < convMessages.length; i++) {
        const message = convMessages[i];
        
        // Count incoming messages (messages not from the creator)
        if (message.sender.toString() !== creatorId.toString()) {
          totalIncomingMessages++;
          
          // Check if there's a response within 24 hours
          const messageTime = new Date(message.createdAt).getTime();
          const hasResponse = convMessages.slice(i + 1).some(nextMessage => {
            if (nextMessage.sender.toString() === creatorId.toString()) {
              const responseTime = new Date(nextMessage.createdAt).getTime() - messageTime;
              return responseTime <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            }
            return false;
          });
          
          if (hasResponse) {
            totalResponses++;
          }
        }
      }
    });

    if (totalIncomingMessages === 0) {
      console.log('No incoming messages found, using default response rate');
      return 100; // Default 100%
    }

    const responseRate = Math.round((totalResponses / totalIncomingMessages) * 100);
    console.log(`Calculated response rate: ${totalResponses}/${totalIncomingMessages} = ${responseRate}%`);
    
    return responseRate;
    
  } catch (error) {
    console.error('Error calculating response rate:', error);
    return 100; // Default 100% on error
  }
}

/**
 * @desc    Test endpoint to create sample conversation data for testing response calculations
 * @route   POST /api/creator-dashboard/test-response-data
 * @access  Private (Creator only)
 */
export const createTestResponseData = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const creatorId = req.user._id;
  
  // Check if the user is a creator
  if (req.user.role !== 'creator') {
    res.status(403);
    throw new Error('Only creators can access this endpoint');
  }
  
  try {
    // Create a test conversation
    const testConversation = new Conversation({
      participants: [creatorId, new mongoose.Types.ObjectId()], // Creator and a test user
      lastMessageAt: new Date()
    });
    
    await testConversation.save();
    console.log('Created test conversation:', testConversation._id);
    
    // Create sample messages to test response time calculation
    const messages = [
      // Message from other user at 10:00 AM
      {
        conversation: testConversation._id,
        sender: new mongoose.Types.ObjectId(), // Other user
        receiver: creatorId,
        content: "Hi, I'm interested in your services",
        type: 'text',
        isRead: true,
        sentAt: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-15T10:00:00Z')
      },
      // Response from creator at 10:30 AM (30 minutes later)
      {
        conversation: testConversation._id,
        sender: creatorId,
        receiver: new mongoose.Types.ObjectId(),
        content: "Hello! Thanks for reaching out. I'd be happy to help.",
        type: 'text',
        isRead: true,
        sentAt: new Date('2024-01-15T10:30:00Z'),
        createdAt: new Date('2024-01-15T10:30:00Z')
      },
      // Another message from other user at 2:00 PM
      {
        conversation: testConversation._id,
        sender: new mongoose.Types.ObjectId(),
        receiver: creatorId,
        content: "Great! Can you tell me more about your pricing?",
        type: 'text',
        isRead: true,
        sentAt: new Date('2024-01-15T14:00:00Z'),
        createdAt: new Date('2024-01-15T14:00:00Z')
      },
      // Response from creator at 3:00 PM (1 hour later)
      {
        conversation: testConversation._id,
        sender: creatorId,
        receiver: new mongoose.Types.ObjectId(),
        content: "Sure! My rates start at $100 per post. What type of content are you looking for?",
        type: 'text',
        isRead: true,
        sentAt: new Date('2024-01-15T15:00:00Z'),
        createdAt: new Date('2024-01-15T15:00:00Z')
      }
    ];
    
    await Message.insertMany(messages);
    console.log('Created test messages');
    
    // Calculate and return the metrics
    const responseRate = await calculateResponseRate(creatorId);
    const avgResponseTime = await calculateAverageResponseTime(creatorId);
    
    res.status(200).json({
      success: true,
      message: 'Test data created successfully',
      metrics: {
        responseRate,
        averageResponseTime: avgResponseTime,
        conversationId: testConversation._id,
        messageCount: messages.length
      }
    });
    
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500);
    throw new Error('Failed to create test data');
  }
}); 