import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import WorkSubmission from '../models/WorkSubmission';
import Promotion from '../models/Promotion';
import User from '../models/User';
import { CreatorProfile } from '../models/CreatorProfile';
import BrandPreference from '../models/BrandPreference';

// @desc    Get brand dashboard stats
// @route   GET /api/brands/dashboard-stats
// @access  Private (Brand only)
export const getBrandDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id;
  
  console.log('Brand Dashboard Stats - Brand ID:', brandId);
  console.log('Brand ID type:', typeof brandId);
  console.log('Brand ID value:', brandId);

  // Get all orders for this brand - try different fields
  const ordersByClient = await Order.find({ client: brandId });
  const ordersByUser = await Order.find({ user: brandId });
  
  console.log('Orders found by client field:', ordersByClient.length);
  console.log('Orders found by user field:', ordersByUser.length);
  
  // Use the field that has orders
  const orders = ordersByClient.length > 0 ? ordersByClient : ordersByUser;
  
  console.log('Using orders from:', ordersByClient.length > 0 ? 'client field' : 'user field');
  console.log('Total orders found:', orders.length);
  
  if (orders.length > 0) {
    console.log('Sample order:', {
      id: orders[0]._id,
      totalAmount: orders[0].totalAmount,
      amount: orders[0].amount,
      status: orders[0].status,
      client: orders[0].client,
      user: orders[0].user
    });
  }
  
  // Calculate total spent (total revenue) - use totalAmount if available, fallback to amount
  const totalSpent = orders.reduce((sum, order) => {
    const orderAmount = order.totalAmount || order.amount || 0;
    console.log(`Order ${order._id}: totalAmount=${order.totalAmount}, amount=${order.amount}, using=${orderAmount}`);
    return sum + orderAmount;
  }, 0);
  console.log('Total spent calculated:', totalSpent);
  
  // Count completed and pending orders
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'in_progress'
  ).length;
  
  console.log('Completed orders:', completedOrders);
  console.log('Pending orders:', pendingOrders);
  
  // Calculate brand rating from completed orders
  let brandRating = 0;
  // Since creatorRating doesn't exist in Order model, we'll use a default rating
  // In a real implementation, you might want to add a brand rating system
  brandRating = 4.5; // Default rating for now

  // Get member since date from user creation
  let memberSince = '';
  try {
    const user = await User.findById(brandId);
    if (user && user.createdAt) {
      memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error fetching user data for member since:', error);
    memberSince = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get total work submissions
  const totalSubmissions = await WorkSubmission.countDocuments({
    'order.client': brandId
  });

  // Get total promotions
  const totalPromotions = await Promotion.countDocuments({ brandId });

  // Get recent orders (last 5)
  const recentOrders = await Order.find({ client: brandId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('creator', 'name firstName lastName username profileImage');

  // Get pending submissions
  const pendingSubmissions = await WorkSubmission.find({
    'order.client': brandId,
    approvalStatus: 'pending'
  })
    .populate({
      path: 'order',
      select: 'service amount status description orderID'
    })
    .populate('files')
    .sort('-createdAt');

  const responseData = {
    totalSpent,
    brandRating: parseFloat(brandRating.toFixed(1)),
    completedOrders,
    pendingOrders,
    memberSince,
    totalSubmissions,
    totalPromotions,
    recentOrders: recentOrders.map(order => ({
      id: order._id,
      orderID: order.orderID,
      creator: order.creator,
      service: order.service,
      amount: order.amount,
      status: order.status,
      date: order.date
    })),
    pendingSubmissions: pendingSubmissions.map(submission => ({
      id: submission._id,
      order: submission.order,
      description: submission.description,
      files: submission.files,
      createdAt: submission.createdAt
    }))
  };

  console.log('Sending response:', responseData);

  res.status(200).json({
    success: true,
    data: responseData
  });
});

// @desc    Create test orders for brand dashboard testing
// @route   POST /api/brands/test-orders
// @access  Private (Brand only) - For testing only
export const createTestOrders = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id;
  
  console.log('Creating test orders for brand:', brandId);

  // Create some test orders
  const testOrders = [
    {
      creator: brandId, // Using brandId as creator for testing
      client: brandId,
      user: brandId,
      clientName: 'Test Brand',
      service: 'Social Media Promotion',
      status: 'completed',
      amount: 1500,
      platform: 'Instagram',
      promotionType: 'Post',
      description: 'Test completed order',
      paymentStatus: 'paid'
    },
    {
      creator: brandId,
      client: brandId,
      user: brandId,
      clientName: 'Test Brand',
      service: 'Content Creation',
      status: 'completed',
      amount: 2500,
      platform: 'YouTube',
      promotionType: 'Video',
      description: 'Test completed order 2',
      paymentStatus: 'paid'
    },
    {
      creator: brandId,
      client: brandId,
      user: brandId,
      clientName: 'Test Brand',
      service: 'Brand Collaboration',
      status: 'pending',
      amount: 3000,
      platform: 'TikTok',
      promotionType: 'Series',
      description: 'Test pending order',
      paymentStatus: 'pending'
    }
  ];

  try {
    const createdOrders = await Order.insertMany(testOrders);
    console.log('Created test orders:', createdOrders.length);
    
    res.status(201).json({
      success: true,
      message: `Created ${createdOrders.length} test orders`,
      data: createdOrders
    });
  } catch (error) {
    console.error('Error creating test orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test orders'
    });
  }
});

export const getDashboardRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const recentlyViewed = req.body?.recentlyViewed || req.query?.recentlyViewed || [];
  let profiles: any[] = [];
  if (Array.isArray(recentlyViewed) && recentlyViewed.length > 0) {
    const unorderedProfiles = await CreatorProfile.find({ _id: { $in: recentlyViewed } });
    // Sort profiles to match the order of recentlyViewed IDs
    const idMap = new Map(unorderedProfiles.map(p => [String(p._id), p]));
    profiles = recentlyViewed.map((id: string) => idMap.get(String(id))).filter(Boolean);
  }
  res.status(200).json({ success: true, data: profiles });
});

export const getProfilesYouMayLike = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [] });
});

export const getBestCreatorsForBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id;
  const preference = await BrandPreference.findOne({ brandId });
  if (!preference) {
    res.status(200).json({ success: true, data: [] });
    return;
  }
  const query: any = {
    status: 'published',
    'publishInfo.isPublished': true,
    $or: [
      { 'professionalInfo.categories': preference.category },
      { 'professionalInfo.tags': { $in: preference.brandValues } },
      { 'professionalInfo.tags': { $in: preference.marketingInterests } },
      { 'socialMedia.primaryPlatform': { $in: preference.socialMediaPreferences } }
    ]
  };
  const creators = await CreatorProfile.find(query)
    .sort({ 'metrics.ratings.average': -1, 'metrics.projectsCompleted': -1 })
    .limit(10);
  res.status(200).json({ success: true, data: creators });
}); 