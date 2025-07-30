import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Like from '../models/Like';
import { CreatorProfile } from '../models/CreatorProfile';
import User from '../models/User';

/**
 * @desc    Like a creator profile
 * @route   POST /api/likes
 * @access  Private
 */
export const likeCreator = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorId } = req.body;
    console.log('Like creator request received', { 
      userId: req.user?._id, 
      creatorId, 
      body: req.body
    });

    if (!creatorId) {
      res.status(400);
      throw new Error('Creator ID is required');
    }

    // Validate MongoDB ID format
    if (!mongoose.isValidObjectId(creatorId)) {
      console.error('Invalid creator ID format:', creatorId);
      res.status(400);
      throw new Error('Invalid creator ID format');
    }

    // Validate if creator exists
    const creatorExists = await CreatorProfile.findById(creatorId);
    if (!creatorExists) {
      console.error('Creator not found:', creatorId);
      res.status(404);
      throw new Error('Creator not found');
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      userId: req.user._id,
      creatorId
    });

    if (existingLike) {
      console.log('Creator already liked', { 
        likeId: existingLike._id, 
        userId: req.user._id, 
        creatorId 
      });
      
      // If already liked, return the existing like
      res.status(200).json({
        success: true,
        message: 'Already liked this creator',
        data: existingLike
      });
      return;
    }

    // Create new like
    console.log('Creating new like', { userId: req.user._id, creatorId });
    const like = await Like.create({
      userId: req.user._id,
      creatorId
    });

    console.log('Like created successfully', { likeId: like._id });
    res.status(201).json({
      success: true,
      message: 'Creator liked successfully',
      data: like
    });
  } catch (error) {
    console.error('Error liking creator:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400);
      throw new Error('Invalid like data: ' + error.message);
    } else if ((error as any).code === 11000) {
      // Duplicate key error (already liked)
      res.status(400);
      throw new Error('You have already liked this creator');
    } else {
      res.status(500);
      throw new Error('Server error liking creator');
    }
  }
});

/**
 * @desc    Unlike a creator profile
 * @route   DELETE /api/likes/:creatorId
 * @access  Private
 */
export const unlikeCreator = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorId } = req.params;

    // Check if like exists
    const like = await Like.findOne({
      userId: req.user._id,
      creatorId
    });

    if (!like) {
      res.status(404);
      throw new Error('Like not found');
    }

    // Delete the like
    await like.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Creator unliked successfully'
    });
    return;
  } catch (error) {
    console.error('Error unliking creator:', error);
    res.status(500);
    throw new Error('Server error unliking creator');
  }
});

/**
 * @desc    Get all creators liked by the user
 * @route   GET /api/likes
 * @access  Private
 */
export const getLikedCreators = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all likes by user
    const likes = await Like.find({ userId: req.user._id })
      .populate({
        path: 'creatorId',
        select: '-__v',
        populate: {
          path: 'userId',
          select: 'fullName username avatar'
        }
      })
      .sort({ createdAt: -1 });

    // Map to format expected by frontend
    const likedCreators = likes.map(like => {
      const creator = like.creatorId as any;
      const user = creator.userId as any;
      
      return {
        id: creator._id,
        fullName: user?.fullName || 'Creator',
        username: user?.username || creator.personalInfo?.username || '',
        avatar: user?.avatar || creator.personalInfo?.profileImage || '',
        category: creator.professionalInfo?.category || '',
        description: creator.descriptionFaq?.briefDescription || '',
        level: creator.professionalInfo?.title || 'Creator',
        startingPrice: creator.pricing?.basic?.price ? `₹${creator.pricing.basic.price}` : 'Contact for price',
        rating: creator.metrics?.ratings?.average || 0,
        reviews: creator.metrics?.ratings?.count || 0,
        isLiked: true
      };
    });

    res.status(200).json({
      success: true,
      count: likes.length,
      data: likedCreators
    });
    return;
  } catch (error) {
    console.error('Error getting liked creators:', error);
    res.status(500);
    throw new Error('Server error getting liked creators');
  }
});

/**
 * @desc    Check if user has liked a creator
 * @route   GET /api/likes/:creatorId
 * @access  Private
 */
export const checkIfLiked = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorId } = req.params;

    const like = await Like.findOne({
      userId: req.user._id,
      creatorId
    });

    res.status(200).json({
      success: true,
      isLiked: !!like
    });
    return;
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500);
    throw new Error('Server error checking like status');
  }
}); 