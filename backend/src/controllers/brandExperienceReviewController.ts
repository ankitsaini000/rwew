import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import BrandExperienceReview from '../models/BrandExperienceReview';
import Order from '../models/Order';
import BrandProfile from '../models/BrandProfile';

// Helper to update brand's average rating
async function updateBrandAverageRating(brandId: string) {
  const reviews = await BrandExperienceReview.find({ brandId });
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = reviews.length ? total / reviews.length : 0;
  await BrandProfile.findOneAndUpdate(
    { userId: brandId },
    { 'metrics.averageRating': avg },
    { new: true }
  );
}

// POST /api/brand-experience-reviews
// Creator rates brand for an order
export const createBrandExperienceReview = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, rating, comment } = req.body;
  const creatorId = req.user._id;

  // Find order and check status
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review completed orders');
  }
  if (order.creator.toString() !== creatorId.toString()) {
    res.status(403);
    throw new Error('You are not authorized to review this order');
  }

  // Check if review already exists
  const existing = await BrandExperienceReview.findOne({ orderId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this brand for this order');
  }

  // Create review
  const review = await BrandExperienceReview.create({
    orderId,
    creatorId,
    brandId: order.client, // assuming client is the brand
    rating,
    comment
  });

  await updateBrandAverageRating(order.client.toString());

  res.status(201).json({ success: true, data: review });
});

// GET /api/brand-experience-reviews/brand/:brandId
export const getBrandExperienceReviews = asyncHandler(async (req: Request, res: Response) => {
  const { brandId } = req.params;
  const reviews = await BrandExperienceReview.find({ brandId })
    .sort({ createdAt: -1 })
    .populate('creatorId', 'fullName username avatar');
  res.json({ success: true, data: reviews });
});

// GET /api/brand-experience-reviews/order/:orderId
export const getBrandExperienceReviewByOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const review = await BrandExperienceReview.findOne({ orderId });
  if (!review) {
    res.status(404).json({ success: false, message: 'No review found' });
    return;
  }
  res.json({ success: true, data: review });
}); 