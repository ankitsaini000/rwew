import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { CreatorProfile, ICreatorProfile } from '../models/CreatorProfile';
import User from '../models/User';
import Order from '../models/Order';
import CreatorMetrics, { ICreatorMetrics } from '../models/CreatorMetrics';
import Notification from '../models/Notification';
import { getIO } from '../sockets';
import Review from '../models/Review';

// Define a type for the metrics object within CreatorProfile
interface CreatorProfileMetrics {
  profileViews?: number;
  profileCompleteness?: number;
  averageResponseTime?: number;
  repeatClientRate?: number;
  ratings?: {
    average?: number;
    count?: number;
    distribution?: {
      '5'?: number;
      '4'?: number;
      '3'?: number;
      '2'?: number;
      '1'?: number;
    };
  };
  projectsCompleted?: number;
}

/**
 * @desc    Create a new creator profile
 * @route   POST /api/creators
 * @access  Private
 */
export const createCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  console.log('Create creator profile request received with body:', req.body);

  try {
    // Check if user already has a profile
    const existingProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (existingProfile) {
      console.log('User already has a creator profile');
      res.status(400);
      throw new Error('Creator profile already exists for this user');
    }

    // Extract data from request body
    const profileData = {
      ...req.body,
      userId: req.user._id,
      status: 'draft',
      onboardingStep: 'personal-info',
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        profileViews: 0,
        profileCompleteness: 0,
        averageResponseTime: 0,
        ratings: {
          average: 0,
          count: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        projectsCompleted: 0,
        repeatClientRate: 0
      }
    };

    // Create new creator profile
    const creatorProfile = await CreatorProfile.create(profileData);

    if (creatorProfile) {
      console.log('Creator profile created successfully:', { profileId: creatorProfile._id });
      
      // Update user role to creator if not already set
      await User.findByIdAndUpdate(req.user._id, { role: 'creator' });

      res.status(201).json({
        success: true,
        data: creatorProfile
      });
    } else {
      console.log('Failed to create creator profile - unknown error');
      res.status(400);
      throw new Error('Invalid creator profile data');
    }
  } catch (err) {
    console.error('Error creating creator profile:', err);
    res.status(500);
    throw new Error('Server error: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
});

/**
 * @desc    Get all creators (public profiles)
 * @route   GET /api/creators
 * @access  Public
 */
export const getCreators = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Only get published profiles
    const creators = await CreatorProfile.find({ 
      status: 'published',
      'publishInfo.isPublished': true 
    })
    .select('-__v')
    .populate('userId', 'fullName email avatar');
  
  res.status(200).json({
    success: true,
      count: creators.length,
      data: creators
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500);
    throw new Error('Server error fetching creators');
  }
});

/**
 * @desc    Get creator profile by ID (private - for the creator themselves)
 * @route   GET /api/creators/me
 * @access  Private (creator only)
 */
export const getMyCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    // First check if user has creator role
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // If user doesn't have creator role, create it
    if (user.role !== 'creator') {
      await User.findByIdAndUpdate(req.user._id, { role: 'creator' });
    }

    // Use findOneAndUpdate with upsert to prevent race conditions
    const creatorProfile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $setOnInsert: {
          status: 'draft',
          onboardingStep: 'personal-info',
          completionStatus: {
            personalInfo: false,
            professionalInfo: false,
            pricing: false,
            galleryPortfolio: false,
            descriptionFaq: false,
            socialMedia: false
          },
          personalInfo: {},
          professionalInfo: {},
          pricing: {},
          galleryPortfolio: {},
          publishInfo: {
            isPublished: false
          }
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
  
    console.error('Error fetching my creator profile:', error);
    res.status(500);
    throw new Error('Server error fetching creator profile');
  }
});

/**
 * @desc    Get creator profile by username (public)
 * @route   GET /api/creators/:username
 * @access  Public
 */
export const getPublicCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Find creator profile by username in personalInfo
    const creatorProfile = await CreatorProfile.findOne({ 
      'personalInfo.username': username,
      status: 'published',
      'publishInfo.isPublished': true
    }).populate('userId', 'fullName avatar');

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Increment profile views
    creatorProfile.metrics.profileViews += 1;
    await creatorProfile.save();
  
  res.status(200).json({
    success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error fetching public creator profile:', error);
    res.status(500);
    throw new Error('Server error fetching creator profile');
  }
});

/**
 * @desc    Get profile data (for onboarding process)
 * @route   GET /api/creators/profile-data
 * @access  Private
 */
export const getProfileData = asyncHandler(async (req: Request, res: Response) => {
  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Calculate completed projects from orders
    const Order = require('../models/Order').default || require('../models/Order');
    const completedProjects = await Order.countDocuments({ creator: req.user._id, status: 'completed' });
    if (!creatorProfile.metrics) {
      creatorProfile.metrics = {
        profileViews: 0,
        profileCompleteness: 0,
        averageResponseTime: 0,
        ratings: {
          average: 0,
          count: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        projectsCompleted: 0,
        repeatClientRate: 0
      };
    }
    creatorProfile.metrics.projectsCompleted = completedProjects;

    // Calculate average rating and review count from reviews
    const Review = require('../models/Review').default || require('../models/Review');
    const reviews = await Review.find({ creatorId: req.user._id });
    let averageRating = 0;
    let ratingCount = 0;
    let distribution: { 5: number; 4: number; 3: number; 2: number; 1: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length > 0) {
      ratingCount = reviews.length;
      const total = reviews.reduce((sum: number, review: any) => {
        const ratingKey = review.rating as 1|2|3|4|5;
        if (ratingKey && distribution[ratingKey] !== undefined) {
          distribution[ratingKey]++;
        }
        return sum + (review.rating || 0);
      }, 0);
      averageRating = total / ratingCount;
    }
    creatorProfile.metrics.ratings = {
      average: averageRating,
      count: ratingCount,
      distribution
    };

    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500);
    throw new Error('Server error fetching profile data');
  }
});

/**
 * @desc    Update creator profile
 * @route   PUT /api/creators/me
 * @access  Private
 */
export const updateCreatorProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    console.log('Updating creator profile for user:', userId);
    console.log('Request body:', req.body);

    // Find the creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId });

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Update the profile with the new data
    if (req.body.personalInfo) {
      // Merge the new personalInfo with existing data
      creatorProfile.personalInfo = {
        ...creatorProfile.personalInfo,
        ...req.body.personalInfo
      };

      // Sync profile image and username to user document
      const user = await User.findById(userId);
      if (user) {
        let userUpdated = false;

        // Sync profile image if updated
        if (req.body.personalInfo.profileImage) {
          user.avatar = req.body.personalInfo.profileImage;
          userUpdated = true;
          console.log('Automatically synced profile image to user avatar');
        }

        // Sync username if updated
        if (req.body.personalInfo.username) {
          user.username = req.body.personalInfo.username;
          userUpdated = true;
          console.log('Automatically synced username to user document');
        }

        // Save user if any updates were made
        if (userUpdated) {
          await user.save();
          console.log('Successfully updated user document with synced data');
        }
      }
    }

    // Update other fields if provided
    const allowedFields = ['professionalInfo', 'descriptionFaq', 'socialMedia', 'pricing', 'galleryPortfolio', 'publishInfo', 'availability', 'metrics', 'completionStatus'] as const;
    type AllowedField = typeof allowedFields[number];

    Object.keys(req.body).forEach(key => {
      if (key !== 'personalInfo' && key !== 'userId' && allowedFields.includes(key as AllowedField)) {
        (creatorProfile as any)[key] = req.body[key];
      }
    });

    // Update the timestamp
    creatorProfile.updatedAt = new Date();

    // Save the updated profile
    await creatorProfile.save();

    console.log('Successfully updated creator profile');
    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error updating creator profile:', error);
    res.status(500);
    throw new Error('Server error updating creator profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

/**
 * @desc    Save personal info section
 * @route   POST /api/creators/personal-info
 * @access  Private
 */
export const savePersonalInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Saving personal info for user:', req.user._id);
    console.log('Request body:', req.body);

    // Use findOneAndUpdate with upsert to prevent race conditions
    const creatorProfile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          personalInfo: req.body,
          onboardingStep: 'professional-info',
          status: 'draft',
          updatedAt: new Date()
        },
        $setOnInsert: {
          completionStatus: {
            personalInfo: true
          }
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log('Successfully saved personal info to creator profile');

    // Update user model with username and avatar if provided
    const userUpdates: any = {};
    if (req.body.username) {
      userUpdates.username = req.body.username;
    }
    if (req.body.profileImage) {
      userUpdates.avatar = req.body.profileImage;
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        userUpdates,
        { new: true }
      );
      console.log('Updated user model with:', userUpdates);
    }

    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error: any) {
    console.error('Error saving personal info:', error);
    
    // Check for duplicate key error (e.g., username already taken)
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400);
      throw new Error('Validation error: ' + error.message);
    } else if (error.code === 11000) {
      res.status(400);
      throw new Error('Username already exists. Please choose another one.');
    } else {
      res.status(500);
      throw new Error('Server error saving personal info');
    }
  }
});

/**
 * @desc    Save professional info section
 * @route   POST /api/creators/professional-info
 * @access  Private
 */
export const saveProfessionalInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Received professional info from frontend:', req.body);
    
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      console.error('Creator profile not found for user:', req.user._id);
      res.status(404);
      throw new Error('Creator profile not found. Please complete personal info first.');
    }

    // Validate and format the professional info data
    const professionalInfo = {
      title: req.body.title || '',
      categories: Array.isArray(req.body.categories) ? req.body.categories : [],
      subcategories: Array.isArray(req.body.subcategories) ? req.body.subcategories : [],
      expertise: Array.isArray(req.body.expertise) ? req.body.expertise : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills.map((skill: any) => {
        if (typeof skill === 'string') {
          return { skill, level: 'intermediate' };
        }
        return {
          skill: skill.skill || '',
          level: skill.level || 'intermediate'
        };
      }) : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      contentTypes: Array.isArray(req.body.contentTypes) ? req.body.contentTypes : [],
      awards: Array.isArray(req.body.awards) ? req.body.awards.map((award: any) => ({
        name: award.name || '',
        awardedBy: award.awardedBy || '',
        year: award.year || new Date().getFullYear()
      })) : [],
      eventAvailability: {
        available: Boolean(req.body.eventAvailability?.available),
        eventTypes: Array.isArray(req.body.eventAvailability?.eventTypes) ? req.body.eventAvailability.eventTypes : [],
        pricing: req.body.eventAvailability?.pricing || '',
        requirements: req.body.eventAvailability?.requirements || '',
        travelWillingness: Boolean(req.body.eventAvailability?.travelWillingness),
        preferredLocations: Array.isArray(req.body.eventAvailability?.preferredLocations) ? req.body.eventAvailability.preferredLocations : [],
        leadTime: Number(req.body.eventAvailability?.leadTime) || 0
      },
      targetAudienceGender: req.body.targetAudienceGender || '',
      socialMediaPreference: req.body.socialMediaPreference || '',
      targetAudienceAgeRange: req.body.targetAudienceAgeRange || '',
    };
    
    console.log('Formatted professional info for MongoDB:', professionalInfo);

    // Update professional info
    creatorProfile.professionalInfo = professionalInfo;
    creatorProfile.onboardingStep = 'description-faq';
    creatorProfile.completionStatus.professionalInfo = true;
    creatorProfile.updatedAt = new Date();
    
    // Save to MongoDB
    console.log('Saving professional info to MongoDB for user:', req.user._id);
    await creatorProfile.save();
    console.log('Professional info successfully saved to MongoDB');
    
    // Return success response
    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error: any) {
    console.error('Error saving professional info:', error);
    
    // Check for validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400);
      throw new Error('Validation error: ' + error.message);
    } else {
      res.status(500);
      throw new Error('Server error saving professional info: ' + error.message);
    }
  }
});

/**
 * @desc    Save basic info section
 * @route   POST /api/creators/basic-info
 * @access  Private
 */
export const saveBasicInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
    res.status(404);
      throw new Error('Creator profile not found. Please complete personal info first.');
    }

    // Update professional info
    creatorProfile.professionalInfo = req.body;
    creatorProfile.onboardingStep = 'description-faq';
    creatorProfile.completionStatus.professionalInfo = true;
    creatorProfile.updatedAt = new Date();
    await creatorProfile.save();

  res.status(200).json({
    success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error saving basic info:', error);
    res.status(500);
    throw new Error('Server error saving basic info');
  }
});

/**
 * @desc    Save description & FAQ section
 * @route   POST /api/creators/description
 * @access  Private
 */
export const saveDescription = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('=== Starting Description & FAQ Save Process ===');
    console.log('Received request from user:', req.user._id);
    console.log('Request body:', req.body);

    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });
    console.log('Found creator profile:', creatorProfile ? 'Yes' : 'No');

    if (!creatorProfile) {
      console.log('Error: Creator profile not found for user:', req.user._id);
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Update description & FAQ info
    const descriptionData = {
      briefDescription: req.body.brief || '',
      longDescription: req.body.detailed || '',
      faqs: req.body.faq || [],
      specialties: req.body.specialties || [],
      workProcess: req.body.workProcess || ''
    };

    console.log('Preparing to update description data:', descriptionData);

    creatorProfile.descriptionFaq = descriptionData;
    creatorProfile.onboardingStep = 'social-media';
    creatorProfile.completionStatus.descriptionFaq = true;
    creatorProfile.updatedAt = new Date();

    // Save to MongoDB
    console.log('Saving to MongoDB...');
    const savedProfile = await creatorProfile.save();
    console.log('MongoDB save successful!');
    console.log('Updated profile:', {
      descriptionFaq: savedProfile.descriptionFaq,
      onboardingStep: savedProfile.onboardingStep,
      completionStatus: savedProfile.completionStatus
    });
  
    res.status(200).json({
      success: true,
      data: savedProfile
    });
    console.log('=== Description & FAQ Save Process Completed Successfully ===');
  } catch (error) {
    console.error('Error in saveDescription:', error);
    console.log('=== Description & FAQ Save Process Failed ===');
    res.status(500);
    throw new Error('Server error saving description');
  }
});

/**
 * @desc    Save social media section
 * @route   POST /api/creators/social-info
 * @access  Private
 */
export const saveSocialInfo = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Received social media data:', req.body);
    
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }
  
    // Update social media info
    creatorProfile.socialMedia = {
      socialProfiles: {
        instagram: {
          url: req.body.instagram || '',
          handle: req.body.instagramHandle || '',
          followers: req.body.instagramFollowers || 0
        },
        youtube: {
          url: req.body.youtube || '',
          handle: req.body.youtubeHandle || '',
          subscribers: req.body.youtubeSubscribers || 0
        },
        twitter: {
          url: req.body.twitter || '',
          handle: req.body.twitterHandle || '',
          followers: req.body.twitterFollowers || 0
        },
        facebook: {
          url: req.body.facebook || '',
          handle: req.body.facebookHandle || '',
          followers: req.body.facebookFollowers || 0
        },
        linkedin: {
          url: req.body.linkedin || '',
          handle: req.body.linkedinHandle || '',
          connections: req.body.linkedinConnections || 0
        },
        website: {
          url: req.body.website || ''
        }
      },
      totalReach: req.body.totalReach || 0,
      primaryPlatform: req.body.primaryPlatform || '',
      audienceDemographics: {
        ageRanges: req.body.ageRanges || [],
        topCountries: req.body.topCountries || [],
        genderBreakdown: {
          male: req.body.malePercentage || 0,
          female: req.body.femalePercentage || 0,
          other: req.body.otherPercentage || 0
        }
      }
    };
    creatorProfile.onboardingStep = 'pricing';
    creatorProfile.completionStatus.socialMedia = true;
    creatorProfile.updatedAt = new Date();

    // Save to MongoDB
    await creatorProfile.save();
    console.log('Social media data saved to MongoDB:', creatorProfile.socialMedia);
  
    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error saving social info:', error);
    res.status(500);
    throw new Error('Server error saving social info');
  }
});

/**
 * @desc    Save pricing section
 * @route   POST /api/creators/pricing
 * @access  Private
 */
export const savePricing = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Received pricing data from frontend:', req.body);
    let pricingData = req.body;

    // Ensure currency is INR
    pricingData.currency = 'INR';

    // Map deliverables to features for backward compatibility
    ['basic', 'standard', 'premium'].forEach(pkg => {
      if (pricingData[pkg]) {
        if (pricingData[pkg].deliverables && !pricingData[pkg].features) {
          pricingData[pkg].features = pricingData[pkg].deliverables;
        }
        delete pricingData[pkg].deliverables;
      }
    });

    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });
    if (!creatorProfile) {
      console.error('Creator profile not found for user:', req.user._id);
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Update pricing info
    creatorProfile.pricing = pricingData;
    creatorProfile.onboardingStep = 'gallery-portfolio';
    creatorProfile.completionStatus.pricing = true;
    creatorProfile.updatedAt = new Date();
    await creatorProfile.save();
    console.log('Pricing data successfully saved to MongoDB');
    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error saving pricing to MongoDB:', error);
    res.status(500);
    throw new Error('Server error saving pricing');
  }
});

/**
 * @desc    Save requirements section
 * @route   POST /api/creators/requirements
 * @access  Private
 */
export const saveRequirements = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
    res.status(404);
    throw new Error('Creator profile not found');
  }

    // Update requirements info
    // This section doesn't have a direct mapping in the schema, 
    // but can be stored in a custom field
    creatorProfile.requirements = req.body;
    creatorProfile.updatedAt = new Date();
    await creatorProfile.save();

    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error saving requirements:', error);
    res.status(500);
    throw new Error('Server error saving requirements');
  }
});

/**
 * @desc    Save gallery section
 * @route   POST /api/creators/gallery
 * @access  Private
 */
export const saveGallery = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('==== SAVE GALLERY REQUEST RECEIVED ====');
    console.log('Headers:', req.headers);
    console.log('User ID:', req.user?._id);
    console.log('API Endpoint: /api/creators/gallery');
    console.log('Timestamp:', new Date().toISOString());
    
    // Check authentication first
    const userId = req.user?._id;
    if (!userId) {
      console.error('Authentication error: User ID not found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
        error: 'No user ID in request'
      });
      return;
    }
    
    console.log('Authenticated user ID:', userId);
    
    // Log the raw request body for debugging
    console.log('Request body (raw):', req.body);
    
    const { images, videos, portfolioLinks, portfolio } = req.body;
    console.log('Parsed gallery data:', { 
      imagesCount: images?.length || 0, 
      videosCount: videos?.length || 0, 
      linksCount: portfolioLinks?.length || 0,
      portfolioItemsCount: portfolio?.length || 0
    });
    
    // Validate the structure of data
    if (images && !Array.isArray(images)) {
      console.error('Data validation error: images is not an array');
      res.status(400).json({
        success: false,
        message: 'Images must be an array',
        error: 'Invalid data format'
      });
      return;
    }
    
    if (videos && !Array.isArray(videos)) {
      console.error('Data validation error: videos is not an array');
      res.status(400).json({
        success: false,
        message: 'Videos must be an array',
        error: 'Invalid data format'
      });
      return;
    }

    // Use findOneAndUpdate with upsert to prevent race conditions
    console.log('Looking for creator profile with userId:', userId);
    const profile = await CreatorProfile.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          status: 'draft',
          onboardingStep: 'gallery-portfolio',
          completionStatus: {
            personalInfo: false,
            professionalInfo: false,
            descriptionFaq: false,
            socialMedia: false,
            pricing: false,
            galleryPortfolio: false
          }
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    console.log('Found/created profile for user:', userId);
    
    // Process with the profile
    await processGalleryData(profile, req, res);
  } catch (error) {
    console.error('Unhandled error in saveGallery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing gallery data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to process gallery data
async function processGalleryData(profile: any, req: Request, res: Response) {
  try {
    console.log('==== PROCESS GALLERY DATA STARTED ====');
    console.log('Profile ID:', profile._id);
    console.log('Request user ID:', req.user?._id);
    
    // Log full request body for debugging
    console.log('Full request body structure:', {
      hasImages: !!req.body.images,
      hasVideos: !!req.body.videos,
      hasPortfolioLinks: !!req.body.portfolioLinks,
      hasPortfolio: !!req.body.portfolio,
      imagesIsArray: Array.isArray(req.body.images),
      videosIsArray: Array.isArray(req.body.videos),
      portfolioLinksIsArray: Array.isArray(req.body.portfolioLinks),
      portfolioIsArray: Array.isArray(req.body.portfolio),
      imagesCount: Array.isArray(req.body.images) ? req.body.images.length : 0,
      videosCount: Array.isArray(req.body.videos) ? req.body.videos.length : 0,
      portfolioLinksCount: Array.isArray(req.body.portfolioLinks) ? req.body.portfolioLinks.length : 0,
      portfolioCount: Array.isArray(req.body.portfolio) ? req.body.portfolio.length : 0
    });
    
    // Log first element of each array to debug structure issues
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      console.log('First image example:', req.body.images[0]);
    }
    if (Array.isArray(req.body.portfolio) && req.body.portfolio.length > 0) {
      console.log('First portfolio item example:', req.body.portfolio[0]);
    }
    
    const { images, videos, portfolioLinks, portfolio } = req.body;
    
    // Enhanced validation with specific error messages
    if (!images && !videos && !portfolio) {
      console.error('Invalid data: No images, videos, or portfolio items found in request');
      res.status(400).json({
        success: false,
        message: 'Invalid data: Missing required gallery or portfolio content',
        error: 'Data validation failed',
        received: {
          hasImages: !!images,
          hasVideos: !!videos,
          hasPortfolio: !!portfolio
        }
      });
      return;
    }
    
    // Check for specific data type issues
    if (images && !Array.isArray(images)) {
      console.error('Data validation error: images is not an array, type:', typeof images);
      res.status(400).json({
        success: false,
        message: 'Images must be an array',
        error: 'Invalid data format',
        received: { type: typeof images, value: images }
      });
      return;
    }
    
    if (portfolio && !Array.isArray(portfolio)) {
      console.error('Data validation error: portfolio is not an array, type:', typeof portfolio);
      res.status(400).json({
        success: false,
        message: 'Portfolio must be an array',
        error: 'Invalid data format',
        received: { type: typeof portfolio, value: portfolio }
      });
      return;
    }
    
    // Ensure all required fields are present and initialized
    if (!profile.completionStatus) {
      profile.completionStatus = {
        personalInfo: false,
        professionalInfo: false,
        descriptionFaq: false,
        socialMedia: false,
        pricing: false,
        galleryPortfolio: false
      };
    }

    if (!profile.metrics) {
      profile.metrics = {
        profileViews: 0,
        profileCompleteness: 0,
        averageResponseTime: 0,
        ratings: {
          average: 0,
          count: 0,
          distribution: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          }
        },
        projectsCompleted: 0,
        repeatClientRate: 0
      };
    }

    // Initialize onboardingStep if it's not set
    if (!profile.onboardingStep) {
      profile.onboardingStep = 'gallery-portfolio';
    }

    // Initialize status if it's not set
    if (!profile.status) {
      profile.status = 'draft';
    }
    
    // Use try-catch blocks for each formatting step to ensure data processing doesn't fail
    let formattedImages = [];
    try {
      formattedImages = (images || []).map((img: any) => {
        // Handle if it's just a string URL
        if (typeof img === 'string') {
          return {
            url: img,
            title: `Gallery Image ${Date.now()}`,
            description: 'Gallery image',
            tags: [],
            order: 0
          };
        }
        
        // Handle malformed objects more carefully
        if (!img || typeof img !== 'object') {
          console.warn('Skipping invalid image item:', img);
          return null;
        }
        
        return {
          url: img.url || '',
          title: img.title || `Gallery Image ${Date.now()}`,
          description: img.description || 'Gallery image',
          tags: Array.isArray(img.tags) ? img.tags : [],
          order: typeof img.order === 'number' ? img.order : 0
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting images:', error);
      formattedImages = [];
    }
    
    // Format videos with error handling
    let formattedVideos = [];
    try {
      formattedVideos = (videos || []).map((vid: any) => {
        // Handle if it's just a string URL
        if (typeof vid === 'string') {
          return {
            url: vid,
            title: `Gallery Video ${Date.now()}`,
            description: 'Gallery video',
            thumbnail: '',
            tags: [],
            order: 0
          };
        }
        
        // Handle malformed objects more carefully
        if (!vid || typeof vid !== 'object') {
          console.warn('Skipping invalid video item:', vid);
          return null;
        }
        
        return {
          url: vid.url || '',
          title: vid.title || `Gallery Video ${Date.now()}`,
          description: vid.description || 'Gallery video',
          thumbnail: vid.thumbnail || '',
          tags: Array.isArray(vid.tags) ? vid.tags : [],
          order: typeof vid.order === 'number' ? vid.order : 0
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting videos:', error);
      formattedVideos = [];
    }
    
    // Format portfolio links with error handling
    let formattedLinks = [];
    try {
      formattedLinks = (portfolioLinks || []).map((link: any) => {
        // Check if it's just a string URL
        if (typeof link === 'string') {
          return link;
        }
        
        if (!link) {
          console.warn('Skipping empty/null portfolio link');
          return null;
        }
        
        return link.url || '';
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting portfolio links:', error);
      formattedLinks = [];
    }

    // Format portfolio items with error handling - this is the most critical part
    let formattedPortfolio = [];
    try {
      console.log('Starting portfolio formatting with items count:', (portfolio || []).length);
      
      formattedPortfolio = (portfolio || []).map((item: any, index: number) => {
        if (!item) {
          console.warn('Skipping null/undefined portfolio item at index', index);
          return null;
        }
        
        try {
          // Log the item type and structure for debugging
          console.log(`Portfolio item ${index} type:`, typeof item, 
                     'Has ID:', !!item.id, 
                     'Has title:', !!item.title);
          
          // Create a valid portfolio item with defaults for all required fields
          const processedItem = {
            id: item.id || `portfolio-${Date.now()}-${index}`,
            title: item.title || 'Portfolio Item',
            // Handle case where image might be null/undefined
            image: item.image || 'https://placehold.co/600x400?text=Portfolio+Item',
            category: item.category || 'general',
            client: item.client || 'Client',
            description: item.description || 'Portfolio item description',
            isVideo: Boolean(item.isVideo),
            videoUrl: item.videoUrl || '',
            promotionType: item.promotionType || '',
            clientFeedback: item.clientFeedback || '',
            projectDate: item.projectDate || '',
            sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index
          };
          
          // Validate the processed item has all required fields with proper types
          for (const [key, value] of Object.entries(processedItem)) {
            if (value === undefined || value === null) {
              console.warn(`Fixed missing ${key} in portfolio item ${index}`);
              (processedItem as any)[key] = key === 'isVideo' ? false : '';
            }
          }
          
          return processedItem;
        } catch (itemError) {
          console.error(`Error processing portfolio item at index ${index}:`, itemError);
          // Return a default item instead of failing
          return {
            id: `portfolio-error-${Date.now()}-${index}`,
            title: 'Error Portfolio Item',
            image: 'https://placehold.co/600x400?text=Error',
            category: 'general',
            client: 'Error Recovery',
            description: 'This item was created during error recovery.',
            isVideo: false,
            videoUrl: '',
            promotionType: '',
            clientFeedback: '',
            projectDate: '',
            sortOrder: index
          };
        }
      }).filter(Boolean);
      
      console.log('Portfolio formatting completed successfully with items:', formattedPortfolio.length);
    } catch (error) {
      console.error('Critical error formatting portfolio items:', error);
      // Provide a minimal default portfolio to avoid failure
      formattedPortfolio = [{
        id: `portfolio-fallback-${Date.now()}`,
        title: 'Fallback Portfolio Item',
        image: 'https://placehold.co/600x400?text=Fallback',
        category: 'general',
        client: 'System Recovery',
        description: 'This is a fallback portfolio item created during error recovery.',
        isVideo: false,
        videoUrl: '',
        promotionType: '',
        clientFeedback: '',
        projectDate: '',
        sortOrder: 0
      }];
    }

    console.log(`Formatted data counts: ${formattedImages.length} images, ${formattedVideos.length} videos, ${formattedLinks.length} links, ${formattedPortfolio.length} portfolio items`);

    // Update the profile data
    console.log('Updating profile with formatted data...');
    
    // Check if galleryPortfolio exists, if not initialize it
    if (!profile.galleryPortfolio) {
      profile.galleryPortfolio = {};
    }
    
    // 1. Update gallery portfolio data
    profile.galleryPortfolio = {
      images: formattedImages,
      videos: formattedVideos,
      featured: formattedLinks
    };
    
    // Also update legacy gallery field for compatibility
    profile.gallery = {
      images: formattedImages.map((img: { url: string; title: string; description: string; order?: number; tags?: string[] }) => ({
        url: img.url,
        title: img.title,
        description: img.description,
        sortOrder: img.order || 0,
        thumbnailUrl: '',
        tags: img.tags || [],
        uploadedAt: new Date()
      })),
      videos: formattedVideos.map((vid: { url: string; title: string; description: string; thumbnail?: string; order?: number; tags?: string[] }) => ({
        url: vid.url,
        title: vid.title,
        description: vid.description,
        thumbnailUrl: vid.thumbnail || '',
        sortOrder: vid.order || 0,
        tags: vid.tags || [],
        uploadedAt: new Date()
      }))
    };
    
    // 2. Update portfolio items - ensure the portfolio field exists
    if (!profile.portfolio) {
      profile.portfolio = [];
    }
    profile.portfolio = formattedPortfolio;
    
    // Log what we're about to save
    console.log('About to save the following data to MongoDB:');
    console.log('galleryPortfolio:', {
      imagesCount: profile.galleryPortfolio.images.length,
      videosCount: profile.galleryPortfolio.videos.length,
      featuredCount: profile.galleryPortfolio.featured.length
    });
    console.log('portfolio items count:', profile.portfolio.length);
    
    // 3. Update onboarding step and completion status
    profile.onboardingStep = 'publish';
    
    // Ensure completionStatus exists
    if (!profile.completionStatus) {
      profile.completionStatus = {
        personalInfo: false,
        professionalInfo: false,
        descriptionFaq: false,
        socialMedia: false,
        pricing: false,
        galleryPortfolio: false
      };
    }
    
    // Explicitly set gallery portfolio completion to true
    profile.completionStatus.galleryPortfolio = true;
    
    // 4. Save the updated profile
    console.log('Saving profile to database...');
    try {
      // Handle potential validation errors before saving
      const validationError = profile.validateSync();
      if (validationError) {
        console.error('MongoDB validation error:', validationError);
        
        // Log detailed validation errors for each path
        if (validationError.errors) {
          Object.keys(validationError.errors).forEach(path => {
            console.error(`Field '${path}' error:`, validationError.errors[path].message);
          });
        }
        
        // Try to fix common validation issues
        try {
          console.log('Attempting to fix validation errors...');
          
          // Check for specific validation errors and try to fix them
          if (validationError.errors['gallery.images']) {
            profile.gallery.images = [];
            console.log('Fixed gallery.images');
          }
          
          if (validationError.errors['gallery.videos']) {
            profile.gallery.videos = [];
            console.log('Fixed gallery.videos');
          }
          
          if (validationError.errors['galleryPortfolio.images']) {
            profile.galleryPortfolio.images = [];
            console.log('Fixed galleryPortfolio.images');
          }
          
          if (validationError.errors['galleryPortfolio.videos']) {
            profile.galleryPortfolio.videos = [];
            console.log('Fixed galleryPortfolio.videos');
          }
          
          if (validationError.errors['galleryPortfolio.featured']) {
            profile.galleryPortfolio.featured = [];
            console.log('Fixed galleryPortfolio.featured');
          }
          
          // Handle portfolio validation errors
          if (validationError.errors['portfolio']) {
            // Try to fix specific portfolio field issues, or reset as last resort
            try {
              // Check if any portfolio items have validation issues
              const hasInvalidItems = profile.portfolio.some((item: any) => {
                return !item.id || !item.title || !item.image;
              });
              
              if (hasInvalidItems) {
                // Filter out invalid items
                profile.portfolio = profile.portfolio.filter((item: any) => {
                  return item && item.id && item.title && item.image;
                });
                
                // If we removed all items, add a default one
                if (profile.portfolio.length === 0) {
                  profile.portfolio = [{
                    id: `portfolio-recovery-${Date.now()}`,
                    title: 'Recovery Portfolio Item',
                    image: 'https://placehold.co/600x400?text=Recovery',
                    category: 'general',
                    client: 'System Recovery',
                    description: 'This portfolio item was created during validation error recovery.',
                    isVideo: false,
                    videoUrl: '',
                    promotionType: '',
                    clientFeedback: '',
                    projectDate: '',
                    sortOrder: 0
                  }];
                }
                
                console.log('Fixed portfolio items, new count:', profile.portfolio.length);
              } else {
                console.log('Portfolio items appear valid but still failing validation');
                // If we can't identify the specific issue, reset the whole array
                profile.portfolio = [{
                  id: `portfolio-reset-${Date.now()}`,
                  title: 'Reset Portfolio Item',
                  image: 'https://placehold.co/600x400?text=Reset',
                  category: 'general',
                  client: 'System Reset',
                  description: 'This portfolio item was created after resetting the portfolio during validation error recovery.',
                  isVideo: false,
                  videoUrl: '',
                  promotionType: '',
                  clientFeedback: '',
                  projectDate: '',
                  sortOrder: 0
                }];
                console.log('Reset portfolio with a default item');
              }
            } catch (portfolioFixError) {
              console.error('Error trying to fix portfolio validation:', portfolioFixError);
              // Complete reset as last resort
              profile.portfolio = [];
              console.log('Cleared portfolio completely');
            }
          }
          
          // Try validating again after fixes
          const newValidationError = profile.validateSync();
          if (newValidationError) {
            console.error('Still have validation errors after fixes:', newValidationError);
            res.status(400).json({
              success: false,
              message: 'Data validation failed, unable to fix automatically',
              error: newValidationError.message,
              details: newValidationError.errors
            });
            return;
          } else {
            console.log('Successfully fixed all validation errors!');
          }
        } catch (fixError) {
          console.error('Error trying to fix validation issues:', fixError);
          res.status(400).json({
            success: false,
            message: 'Data validation failed',
            error: validationError.message,
            details: validationError.errors
          });
          return;
        }
      }
      
      await profile.save();
      console.log('Profile saved successfully');
      
      // 5. Verify the data was saved by fetching a fresh copy from the database
      console.log('Verifying saved data by fetching from database...');
      const updatedProfile = await CreatorProfile.findById(profile._id);
      
      if (!updatedProfile) {
        console.error('ERROR: Could not retrieve profile after save!');
        res.status(500).json({
          success: false,
          message: 'Profile was saved but could not be verified',
          error: 'Database verification failed'
        });
        return;
      }
      
      // Deep verification of saved data
      const galleryVerification = {
        imagesCount: updatedProfile?.galleryPortfolio?.images?.length || 0,
        videosCount: updatedProfile?.galleryPortfolio?.videos?.length || 0,
        portfolioCount: updatedProfile?.portfolio?.length || 0,
        galleryPortfolioExists: !!updatedProfile.galleryPortfolio,
        portfolioExists: !!updatedProfile.portfolio,
        galleryDataSample: updatedProfile?.galleryPortfolio?.images?.length ? 
          updatedProfile.galleryPortfolio.images[0] : null,
        portfolioDataSample: updatedProfile?.portfolio?.length ? 
          updatedProfile.portfolio[0] : null
      };
      
      console.log('Verification - Saved gallery data:', galleryVerification);
      
      // Return success response
      console.log('Sending success response to client');
      res.status(200).json({
        success: true,
        message: 'Gallery and portfolio data saved successfully',
        data: {
          galleryPortfolio: updatedProfile.galleryPortfolio,
          portfolio: updatedProfile.portfolio,
          completionStatus: updatedProfile.completionStatus,
          verification: galleryVerification
        }
      });
    } catch (saveError) {
      console.error('Error saving profile:', saveError);
      // Add more detailed error information
      let errorMessage = 'Database error saving profile';
      let errorDetails = {};
      
      if (saveError instanceof Error) {
        errorMessage = saveError.message;
        errorDetails = { 
          stack: saveError.stack,
          name: saveError.name
        };
        
        // Check for specific MongoDB error types
        if (saveError.name === 'ValidationError') {
          errorMessage = 'MongoDB validation error';
          // @ts-ignore - Handle mongoose validation error
          const validationErrors = Object.keys(saveError.errors || {}).reduce((acc: any, key: string) => {
            // @ts-ignore
            acc[key] = saveError.errors[key].message;
            return acc;
          }, {});
          errorDetails = { ...errorDetails, validationErrors };
        } else if (saveError.name === 'MongoServerError') {
          // @ts-ignore
          errorMessage = `MongoDB server error: ${saveError.code}`;
          // @ts-ignore
          errorDetails = { ...errorDetails, code: saveError.code, keyPattern: saveError.keyPattern };
        }
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
        details: errorDetails
      });
    }
  } catch (error) {
    console.error('Error in processGalleryData:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing gallery data',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * @desc    Get profile completion status
 * @route   GET /api/creators/completion-status
 * @access  Private
 */
export const getCompletionStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    // Calculate overall completion percentage
    const sections = Object.values(creatorProfile.completionStatus);
    const completedSections = sections.filter(section => section).length;
    const totalSections = sections.length;
    const completionPercentage = Math.floor((completedSections / totalSections) * 100);

    // Update profile completeness metric
    creatorProfile.metrics.profileCompleteness = completionPercentage;
    await creatorProfile.save();
  
  res.status(200).json({
    success: true,
    data: {
        status: creatorProfile.completionStatus,
        percentage: completionPercentage,
        nextStep: creatorProfile.onboardingStep
      }
    });
  } catch (error) {
    console.error('Error getting completion status:', error);
    res.status(500);
    throw new Error('Server error fetching completion status');
  }
});

/**
 * @desc    Publish creator profile
 * @route   POST /api/creators/publish
 * @access  Private
 */
export const publishProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Publishing profile with data:', req.body);
    
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      // Create a minimal profile if it doesn't exist
      console.log('Profile not found, creating a minimal profile');
      creatorProfile = new CreatorProfile({
        userId: req.user._id,
        status: 'draft',
        completionStatus: {
          personalInfo: false,
          professionalInfo: false,
          pricing: false,
          galleryPortfolio: false,
          descriptionFaq: false,
          socialMedia: false
        },
        personalInfo: {},
        professionalInfo: {},
        pricing: {},
        galleryPortfolio: {},
        publishInfo: {
          isPublished: false
        }
      });
    }

    // Initialize completion status if undefined
    if (!creatorProfile.completionStatus) {
      creatorProfile.completionStatus = {
        personalInfo: false,
        professionalInfo: false,
        pricing: false,
        galleryPortfolio: false,
        descriptionFaq: false,
        socialMedia: false
      };
    }

    // Initialize personal info if undefined
    if (!creatorProfile.personalInfo) {
      creatorProfile.personalInfo = {};
    }

    // Check if bypass flag is provided
    const bypassVerification = req.body.bypassVerification === true;
    console.log(`Bypass verification: ${bypassVerification}`);
    
    // Only perform checks if not bypassing verification
    if (!bypassVerification) {
      // Check if all required sections are complete
      const requiredSections = ['personalInfo', 'professionalInfo', 'pricing', 'galleryPortfolio'];
      const missingRequiredSections = requiredSections.filter(
        section => !(creatorProfile.completionStatus as Record<string, boolean>)[section]
      );

      if (missingRequiredSections.length > 0) {
        res.status(400);
        throw new Error(`Cannot publish profile. Missing required sections: ${missingRequiredSections.join(', ')}`);
      }
    } else {
      console.log('Verification checks bypassed by request');
      
      // Force set all completion status to true when bypassing
      creatorProfile.completionStatus = {
        personalInfo: true,
        professionalInfo: true,
        pricing: true,
        galleryPortfolio: true,
        descriptionFaq: true,
        socialMedia: true
      };
    }

    // Get username from request body or use existing one
    const username = req.body.username || creatorProfile.personalInfo?.username || `creator_${req.user._id}`;
    console.log(`Using username: ${username}`);
    
    // Ensure personalInfo exists
    if (!creatorProfile.personalInfo) {
      creatorProfile.personalInfo = {};
    }

    // Set username in personalInfo
    creatorProfile.personalInfo.username = username;
    
    // Generate profile URL
    creatorProfile.profileUrl = `/creator/${username}`;

    // Initialize publishInfo if missing
    if (!creatorProfile.publishInfo) {
      creatorProfile.publishInfo = {
        isPublished: false
      };
    }

    // Update publish info
    creatorProfile.status = 'published';
    creatorProfile.publishInfo = {
      ...creatorProfile.publishInfo,
      isPublished: true,
      publishedAt: new Date()
    };
    creatorProfile.updatedAt = new Date();

    // Safely save the profile with error handling
    try {
      await creatorProfile.save();
      console.log(`Profile saved successfully with username: ${username}`);
    } catch (saveError: any) {
      console.error('Error saving profile:', saveError);
      res.status(500);
      throw new Error(`Failed to save profile: ${saveError.message}`);
    }

    // Also ensure the user has creator role
    try {
      await User.findByIdAndUpdate(req.user._id, { role: 'creator' });
    } catch (userUpdateError) {
      console.warn('Failed to update user role, continuing anyway:', userUpdateError);
      // Don't fail the whole process if just the role update fails
    }
  
    res.status(200).json({
      success: true,
      data: {
        message: 'Profile published successfully',
        profile: creatorProfile,
        profileUrl: creatorProfile.profileUrl
      }
    });
  } catch (error: any) {
    console.error('Error publishing profile:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw new Error(error.message || 'Server error publishing profile');
  }
});

/**
 * @desc    Check if username is available
 * @route   GET /api/creators/check-username/:username
 * @access  Public
 */
export const checkUsername = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400);
      throw new Error('Username parameter is required');
    }

    // Check if username follows allowed pattern
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
  res.status(200).json({
        available: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
      return; // Add explicit return to avoid returning res object
    }

    // Check if username exists in CreatorProfile or User model
    const existingCreator = await CreatorProfile.findOne({ 'personalInfo.username': username });
    const existingUser = await User.findOne({ username });

    const available = !existingCreator && !existingUser;

    res.status(200).json({
      available,
      message: available ? 'Username is available' : 'Username is already taken'
    });
    return; // Add explicit return to avoid returning res object
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500);
    throw new Error('Server error checking username');
  }
});

/**
 * @desc    Upgrade user to creator role
 * @route   POST /api/creators/upgrade-role
 * @access  Private
 */
export const upgradeToCreator = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Update user role to creator
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'creator' },
      { new: true }
    );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
    // Check if creator profile exists
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    // Create a draft profile if it doesn't exist
    if (!creatorProfile) {
      creatorProfile = await CreatorProfile.create({
        userId: req.user._id,
      status: 'draft',
        onboardingStep: 'personal-info'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to creator role',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        profile: creatorProfile
      }
    });
  } catch (error) {
    console.error('Error upgrading to creator:', error);
    res.status(500);
    throw new Error('Server error upgrading to creator role');
  }
});

/**
 * @desc    Test creator endpoint
 * @route   POST /api/creators/test
 * @access  Public
 */
export const testCreator = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Creator API is working',
    data: {
      timestamp: new Date(),
      requestBody: req.body
    }
  });
});

/**
 * @desc    Force complete profile (for development/testing)
 * @route   POST /api/creators/force-complete
 * @access  Private (should be restricted in production)
 */
export const forceCompleteProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Find creator profile
    let creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      // Create new profile if it doesn't exist
      creatorProfile = await CreatorProfile.create({
        userId: req.user._id,
        status: 'draft'
      });
    }

    // Mark all sections as complete
    creatorProfile.completionStatus = {
      personalInfo: true,
      professionalInfo: true,
      descriptionFaq: true,
      socialMedia: true,
      pricing: true,
      galleryPortfolio: true
    };
    
    creatorProfile.onboardingStep = 'publish';
    creatorProfile.updatedAt = new Date();
    await creatorProfile.save();
  
  res.status(200).json({
    success: true,
      message: 'Profile marked as complete',
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error forcing profile completion:', error);
    res.status(500);
    throw new Error('Server error completing profile');
  }
});

/**
 * @desc    Emergency fix for profile issues
 * @route   POST /api/creators/emergency-fix
 * @access  Private (admin/debug only)
 */
export const emergencyFixProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400);
      throw new Error('userId is required');
    }

    // Find and update the profile
    const creatorProfile = await CreatorProfile.findOneAndUpdate(
      { userId },
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

  res.status(200).json({
    success: true,
      message: 'Profile emergency fix applied',
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error in emergency fix:', error);
    res.status(500);
    throw new Error('Server error fixing profile');
  }
});

/**
 * @desc    Debug profile data
 * @route   GET /api/creators/debug/:userId
 * @access  Private (admin only)
 */
export const debugProfileData = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400);
      throw new Error('userId parameter is required');
    }

    // Find the profile
    const creatorProfile = await CreatorProfile.findOne({ userId }).populate('userId', 'email fullName role');

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    res.status(200).json({
      success: true,
      data: creatorProfile
    });
  } catch (error) {
    console.error('Error in debug profile:', error);
    res.status(500);
    throw new Error('Server error debugging profile');
  }
});

/**
 * @desc    Test gallery/portfolio data storage
 * @route   POST /api/creators/test-gallery
 * @access  Private
 */
export const testGalleryStorage = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Test gallery storage request received');
    
    const userId = req.user._id;
    console.log('User ID for test:', userId);
    
    // Create sample data for testing
    const testData = {
      images: [
        {
          url: 'https://placehold.co/800x600?text=Test+Image',
          title: 'Test Image',
          description: 'Test description',
          tags: ['test'],
          order: 0
        }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/watch?v=test',
          title: 'Test Video',
          description: 'Test video description',
          thumbnail: 'https://placehold.co/800x600?text=Test+Video+Thumbnail',
          tags: ['test'],
          order: 0
        }
      ],
      portfolioLinks: ['https://example.com'],
      portfolio: [
        {
          id: `portfolio-test-${Date.now()}`,
          title: 'Test Portfolio Item',
          image: 'https://placehold.co/800x600?text=Test+Portfolio',
          category: 'test',
          client: 'Test Client',
          description: 'Test portfolio description',
          isVideo: false,
          videoUrl: '',
          promotionType: 'Test',
          clientFeedback: 'Great work!',
          projectDate: 'January 2023',
          sortOrder: 0
        }
      ]
    };
    
    // Find or create a profile
    let profile = await CreatorProfile.findOne({ userId });
    
    if (!profile) {
      console.log('Creating new profile for test');
      profile = new CreatorProfile({
        userId,
        status: 'draft',
        onboardingStep: 'gallery-portfolio'
      });
      await profile.save();
    }
    
    // Use processGalleryData with our test data
    req.body = testData;
    await processGalleryData(profile, req, res);
    
  } catch (error) {
    console.error('Error in testGalleryStorage:', error);
    res.status(500).json({
      success: false,
      message: 'Test gallery storage failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @desc    Get published creators with pagination, search, and filters
 * @route   GET /api/creators
 * @access  Public
 */
export const getPublishedCreators = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching published creators with filters');
    const { 
      searchQuery, 
      category, 
      platform, 
      priceMin, 
      priceMax, 
      followersMin, 
      followersMax, 
      sortBy,
      tags,
      contentTypes
    } = req.query;
    
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = { 
      status: 'published',
      'publishInfo.isPublished': true,
      isActive: { $ne: false } // Exclude deactivated creators
    };
    
    // Add search query if provided
    if (searchQuery) {
      // Create a text search across multiple fields including tags and content types
      const searchRegex = new RegExp(searchQuery as string, 'i');
      filter.$or = [
        { 'personalInfo.username': searchRegex },
        { 'personalInfo.fullName': searchRegex },
        { 'personalInfo.bio': searchRegex },
        { 'professionalInfo.title': searchRegex },
        { 'professionalInfo.categories': searchRegex },
        { 'professionalInfo.subcategories': searchRegex },
        { 'professionalInfo.tags': searchRegex },
        { 'professionalInfo.contentTypes': searchRegex },
        { 'personalInfo.location': searchRegex },
        { 'descriptionFaq.briefDescription': searchRegex },
        { 'descriptionFaq.specialties': searchRegex },
        { 'galleryPortfolio.images.tags': searchRegex },
        { 'galleryPortfolio.videos.tags': searchRegex },
        { 'portfolio.tags': searchRegex }
      ];
    }
    
    // Add category filter if provided
    if (category && category !== 'All Categories') {
      filter['professionalInfo.categories'] = category;
    }
    
    // Add platform filter if provided
    if (platform && platform !== 'All Platforms') {
      // Social media platform checks - match if they have that platform set up
      const platformKey = (platform as string).toLowerCase();
      filter[`socialMedia.socialProfiles.${platformKey}.url`] = { $exists: true, $ne: '' };
    }
    
    // Add tags filter if provided
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filter['professionalInfo.tags'] = { $in: tagsArray };
    }
    
    // Add content types filter if provided
    if (contentTypes) {
      const contentTypesArray = Array.isArray(contentTypes) ? contentTypes : [contentTypes];
      filter['professionalInfo.contentTypes'] = { $in: contentTypesArray };
    }
    
    // Add price range filters if provided
    if (priceMin) {
      filter['pricing.standard.price'] = { $gte: parseInt(priceMin as string) };
    }
    
    if (priceMax) {
      if (!filter['pricing.standard.price']) {
        filter['pricing.standard.price'] = {};
      }
      filter['pricing.standard.price'].$lte = parseInt(priceMax as string);
    }
    
    // Add follower count filters if provided
    if (followersMin) {
      filter['socialMedia.totalReach'] = { $gte: parseInt(followersMin as string) };
    }
    
    if (followersMax) {
      if (!filter['socialMedia.totalReach']) {
        filter['socialMedia.totalReach'] = {};
      }
      filter['socialMedia.totalReach'].$lte = parseInt(followersMax as string);
    }
    
    // Determine sort order
    let sortOptions: any = { 'metrics.profileViews': -1 }; // Default sort by popularity
    
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          sortOptions = { 'pricing.standard.price': 1 };
          break;
        case 'price-high':
          sortOptions = { 'pricing.standard.price': -1 };
          break;
        case 'rating':
          sortOptions = { 'metrics.ratings.average': -1 };
          break;
        case 'followers':
          sortOptions = { 'socialMedia.totalReach': -1 };
          break;
        case 'relevance':
        default:
          // For relevance, use a complex sort that considers multiple factors
          sortOptions = {
            'metrics.profileViews': -1,
            'metrics.ratings.average': -1
          };
      }
    }
    
    // Count total documents matching the filter
    const total = await CreatorProfile.countDocuments(filter);
    console.log(`Found ${total} creators matching filters`);
    
    // Get creators with pagination
    const creators = await CreatorProfile.find(filter)
      .select('-__v')
      .populate('userId', 'fullName username email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    console.log(`Returning ${creators.length} creators for page ${page}`);
    
    // Process creators to ensure they have all required fields
    const processedCreators = await Promise.all(creators.map(async (creator: any) => {
      const creatorId = creator._id ? creator._id.toString() : '';
      
      // Extract username from userId if it exists
      let username = '';
      if (creator.userId && typeof creator.userId === 'object') {
        if (creator.userId.username) {
          username = creator.userId.username;
        }
      }
      
      // If no username from userId, try personalInfo
      if (!username && creator.personalInfo && creator.personalInfo.username) {
        username = creator.personalInfo.username;
      }
      
      // If still no username, create a fallback
      if (!username) {
        username = `user_${creatorId.substring(0, 8)}`;
      }

      // Calculate actual ratings and reviews from Review model
      let actualRating = 0;
      let actualReviewCount = 0;
      try {
        const creatorIdForReviews = creator.userId?._id || creatorId;
        const reviews = await Review.find({ creatorId: creatorIdForReviews });
        if (reviews.length > 0) {
          actualReviewCount = reviews.length;
          const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
          actualRating = totalRating / actualReviewCount;
        }
      } catch (error) {
        console.error('Error calculating ratings for creator:', creatorId, error);
      }
      
      // Return the processed creator data
      return {
        _id: creatorId,
        userId: creator.userId,
        username, // Add top-level username for easier access
        fullName: creator.userId && creator.userId.fullName ? creator.userId.fullName : 'Creator',
        title: creator.professionalInfo?.title || '', // Add title field
        personalInfo: creator.personalInfo || {},
        professionalInfo: creator.professionalInfo || {},
        descriptionFaq: creator.descriptionFaq || {},
        socialMedia: creator.socialMedia || {},
        pricing: creator.pricing || {},
        gallery: creator.gallery || {},
        portfolio: creator.portfolio || [],
        metrics: creator.metrics || {},
        rating: actualRating > 0 ? parseFloat(actualRating.toFixed(1)) : 
                (creator.metrics && creator.metrics.ratings ? creator.metrics.ratings.average || 0 : 0),
        reviewCount: actualReviewCount > 0 ? actualReviewCount : 
                    (creator.metrics && creator.metrics.ratings ? creator.metrics.ratings.count || 0 : 0),
        isActive: creator.isActive !== false, // Add isActive for frontend filtering
      };
    }));
    
    // Return paginated results with metadata
    res.status(200).json({
      success: true,
      count: total,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
        hasMore: skip + creators.length < total
      },
      data: processedCreators
    });
  } catch (error) {
    console.error('Error fetching published creators:', error);
    res.status(500);
    throw new Error('Server error fetching published creators');
  }
});

interface DashboardData {
  metrics: {
    followers: number;
    totalEarnings: number;
    completedProjects: number;
    pendingProjects: number;
    responseRate: number;
    tierProgress: number;
    performanceData: {
      views: number[];
      likes: number[];
      messages: number[];
      earnings: number[];
      dates: string[];
    };
  };
  orders: Array<{
    id: string;
    orderID: string;
    clientName: string;
    date: Date;
    service: string;
    status: string;
    amount: number;
    platform: string;
    promotionType: string;
    deliveryDate: Date | null;
    description: string;
    clientFeedback: string;
    deliverables: string[];
    paymentStatus: string;
    paymentDate: Date | null;
    statusHistory: Array<{status: string; date: Date}>;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    status: string;
    date: Date;
    clientName: string;
    amount: number;
  }>;
  revenueByPromotion: Array<{type: string; amount: number}>;
  revenueByMonth: Array<{month: number; amount: number}>;
}

interface OrderDocument {
  _id: mongoose.Types.ObjectId;
  orderID: string;
  clientName: string;
  date: Date;
  service: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  amount: number;
  platform: string;
  promotionType: string;
  deliveryDate: Date | null;
  description: string;
  clientFeedback: string;
  deliverables: string[];
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDate: Date | null;
  statusHistory: Array<{
    status: string;
    date: Date;
  }>;
}

export const getCreatorDashboardData = async (req: any, res: any) => {
  try {
    // Get the creator profile linked to the logged-in user
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name username email profileImage')
      .lean();

    if (!creatorProfile) {
      return res.status(404).json({
        success: false,
        error: 'Creator profile not found'
      });
    }

    // Fetch the creator's metrics from the CreatorMetrics collection
    const creatorMetrics = await CreatorMetrics.findOne({ creator: req.user._id }).lean();

    // Fetch the creator's orders with proper population
    const orders = await Order.find({ creator: req.user._id })
      .populate('client', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format orders for the response
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderID: order.orderID,
      clientName: order.clientName,
      date: order.date,
      service: order.service,
      status: order.status,
      amount: order.amount,
      platform: order.platform,
      promotionType: order.promotionType,
      deliveryDate: order.deliveryDate,
      description: order.description,
      clientFeedback: order.clientFeedback,
      deliverables: order.deliverables,
      paymentStatus: order.paymentStatus,
      paymentDate: order.paymentDate,
      statusHistory: order.statusHistory.map(history => ({
        status: history.status,
        date: history.date
      }))
    }));

    // Calculate metrics based on orders
    const completedOrdersCount = orders.filter(order => order.status === 'completed').length;
    const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
    const totalEarnings = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Prepare dashboard data
    const dashboardData: DashboardData = {
      metrics: {
        followers: creatorMetrics?.followers || 0,
        totalEarnings: totalEarnings,
        completedProjects: completedOrdersCount,
        pendingProjects: pendingOrdersCount,
        responseRate: creatorMetrics?.responseRate || 100,
        tierProgress: creatorMetrics?.tierProgress || 0,
        performanceData: creatorMetrics?.performanceData || {
          views: [],
          likes: [],
          messages: [],
          earnings: [],
          dates: []
        }
      },
      orders: formattedOrders,
      recentActivity: formattedOrders.slice(0, 5).map(order => ({
        id: order.id,
        type: 'order',
        status: order.status,
        date: order.date,
        clientName: order.clientName,
        amount: order.amount
      })),
      revenueByPromotion: creatorMetrics?.revenueByPromotion || [],
      revenueByMonth: creatorMetrics?.revenueByMonth || []
    };

    // Log success and return data
    console.log(`Successfully fetched dashboard data for creator: ${req.user._id}`);
    console.log('Dashboard data prepared for response:', dashboardData);
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    console.error(`Error fetching creator dashboard data: ${error.message}`);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc    Fetch metrics from creatorprofiles and store in creatormetrics
 * @route   POST /api/creators/sync-metrics
 * @access  Private/Creator
 */
export const syncCreatorMetrics = async (req: any, res: any) => {
  try {
    const creatorId = req.user._id;

    // Get creator profile with metrics and social media
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId })
      .select('metrics socialMedia') // Select both fields
      .lean();

    if (!creatorProfile) {
      console.log(`Creator profile not found for user ${creatorId}. Cannot sync metrics.`);
      return res.status(404).json({
        success: false,
        error: 'Creator profile not found'
      });
    }

    // Calculate total earnings from completed orders
    const completedOrders = await Order.find({ 
      creator: creatorId, 
      status: 'completed' 
    });
    
    const totalEarnings = completedOrders.reduce((sum, order) => {
      const orderAmount = order.totalAmount || order.amount || 0;
      return sum + orderAmount;
    }, 0);
    
    console.log(`Calculated total earnings for user ${creatorId}: ${totalEarnings} from ${completedOrders.length} completed orders`);

    // Extract the metrics and social media objects from creator profile
    const profileMetricsData: CreatorProfileMetrics = creatorProfile.metrics || {};
    const profileSocialMediaData = creatorProfile.socialMedia || {};

    // Calculate total followers from social media profiles
    let totalFollowers = 0;
    if (profileSocialMediaData && typeof profileSocialMediaData.socialProfiles === 'object') {
      const platforms = ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin'];
      platforms.forEach(platform => {
        const profile = (profileSocialMediaData.socialProfiles as any)[platform];
        if (profile?.followers !== undefined) {
          totalFollowers += profile.followers;
        } else if (profile?.subscribers !== undefined) {
           // Handle YouTube using subscribers
           totalFollowers += profile.subscribers;
        } else if (profile?.connections !== undefined) {
           // Handle LinkedIn using connections
           totalFollowers += profile.connections;
        }
      });
    }
     console.log(`Calculated total followers for user ${creatorId}: ${totalFollowers}`);


    // Find or create creator metrics document
    let creatorMetrics = await CreatorMetrics.findOne({ creator: creatorId });

    if (!creatorMetrics) {
      console.log(`No CreatorMetrics found for user ${creatorId}, creating new entry.`);
      creatorMetrics = new CreatorMetrics({
        creator: creatorId,
        // Initialize fields with defaults or data from profile
        followers: totalFollowers, // Set initial followers
        totalEarnings: totalEarnings, // Calculate from completed orders
        completedProjects: completedOrders.length, // Use actual completed orders count
        responseRate: profileMetricsData.averageResponseTime ? (100 - (profileMetricsData.averageResponseTime / 10)) : 100,
        tierProgress: profileMetricsData.profileCompleteness || 0,
        performanceData: { // Initialize performance data
          views: profileMetricsData.profileViews ? [profileMetricsData.profileViews] : [],
          likes: [], // Initialize empty, as source data for time series isn't clear
          messages: [], // Initialize empty
          earnings: [totalEarnings], // Initialize with current earnings
          dates: profileMetricsData.profileViews ? [new Date().toISOString().split('T')[0]] : [], // Add date for initial view
        },
        profileMetrics: profileMetricsData,
        profileSocialMedia: profileSocialMediaData,
        lastUpdated: new Date()
      });
    } else {
      console.log(`CreatorMetrics found for user ${creatorId}, updating entry.`);
      // Update followers with the calculated total
      creatorMetrics.followers = totalFollowers;
      
      // Update earnings and completed projects from actual orders
      creatorMetrics.totalEarnings = totalEarnings;
      creatorMetrics.completedProjects = completedOrders.length;

      // Update top-level summary fields based on profile data
      creatorMetrics.responseRate = profileMetricsData.averageResponseTime ? (100 - (profileMetricsData.averageResponseTime / 10)) : creatorMetrics.responseRate;
      creatorMetrics.tierProgress = profileMetricsData.profileCompleteness || creatorMetrics.tierProgress;

      // Update performance data views if new profileViews are available
      // Only push if the view count has changed since the last entry
      if (profileMetricsData.profileViews !== undefined) {
         const viewsArray = creatorMetrics.performanceData.views;
         const datesArray = creatorMetrics.performanceData.dates;
         const lastView = viewsArray.length > 0 ? viewsArray[viewsArray.length - 1] : null;

         if (lastView === null || lastView !== profileMetricsData.profileViews) {
             viewsArray.push(profileMetricsData.profileViews);
             // Keep dates and views arrays in sync
             datesArray.push(new Date().toISOString().split('T')[0]);
             console.log(`Pushed new view count ${profileMetricsData.profileViews} with date to performanceData for user ${creatorId}.`);
         } else {
             console.log(`View count ${profileMetricsData.profileViews} is unchanged since last sync for user ${creatorId}. Not pushing to performanceData.`);
         }
      }
      
      // Update earnings in performance data
      const earningsArray = creatorMetrics.performanceData.earnings;
      const lastEarning = earningsArray.length > 0 ? earningsArray[earningsArray.length - 1] : null;
      
      if (lastEarning === null || lastEarning !== totalEarnings) {
        earningsArray.push(totalEarnings);
        console.log(`Pushed new earnings ${totalEarnings} to performanceData for user ${creatorId}.`);
      } else {
        console.log(`Earnings ${totalEarnings} is unchanged since last sync for user ${creatorId}. Not pushing to performanceData.`);
      }
      
      // Likes, messages in performanceData are not updated here as there's no clear source for time-series data in CreatorProfile
      // If these need to be populated, a different backend process is required.

      // Update the raw profileMetrics and profileSocialMedia fields
      creatorMetrics.profileMetrics = profileMetricsData;
      creatorMetrics.profileSocialMedia = profileSocialMediaData;
      creatorMetrics.lastUpdated = new Date();
    }

    // Save the updated metrics
    await creatorMetrics.save();

    console.log(`Metrics synchronized successfully for user ${creatorId}.`);

    // Send success response including performanceData
    res.status(200).json({
      success: true,
      message: 'Metrics synchronized successfully',
      data: {
        followers: creatorMetrics.followers,
        totalEarnings: creatorMetrics.totalEarnings,
        completedProjects: creatorMetrics.completedProjects,
        responseRate: creatorMetrics.responseRate,
        tierProgress: creatorMetrics.tierProgress,
        performanceData: creatorMetrics.performanceData // Include performanceData here
      }
    });

  } catch (error: any) {
    console.error('Error syncing creator metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'Unknown error'
    });
  }
};

/**
 * @desc    Creator accepts an order
 * @route   POST /api/creators/orders/:orderId/accept
 * @access  Private/Creator
 */
export const acceptOrder = asyncHandler(async (req: any, res: any) => {
  try {
    const creatorId = req.user._id;
    const { orderId } = req.params;

    // Find the order by ID and creator ID to ensure ownership
    const order = await Order.findOne({ _id: orderId, creator: creatorId })
      .populate('user', 'fullName email avatar');

    if (!order) {
      res.status(404);
      throw new Error('Order not found or does not belong to this creator');
    }

    // Check if the order is in a state that can be accepted (e.g., 'pending')
    if (order.status !== 'pending') {
      res.status(400);
      throw new Error(`Order status is ${order.status}. Only pending orders can be accepted.`);
    }

    // Update the order status to 'in_progress'
    order.status = 'in_progress';
    await order.save();

    // Create notification for client about order acceptance
    try {
      const orderData = order as any;
      if (orderData.user) {
        const clientNotification = await Notification.create({
          user: orderData.user._id,
          type: 'order',
          message: `Your order has been accepted and work has started!`,
          fromUser: creatorId,
          isRead: false
        });

        // Emit real-time notification to client
        const io = getIO();
        io.to(orderData.user._id.toString()).emit('newNotification', {
          notification: {
            ...clientNotification.toObject(),
            fromUser: {
              _id: creatorId,
              fullName: req.user.fullName || req.user.email,
              avatar: req.user.avatar
            }
          }
        });

        console.log('Created order acceptance notification for client:', {
          notificationId: clientNotification._id,
          clientId: orderData.user._id,
          orderId: orderId
        });
      }
    } catch (notificationError) {
      console.error('Error creating order acceptance notification:', notificationError);
      // Don't fail the order acceptance if notification fails
    }

    res.status(200).json({
      success: true,
      message: `Order ${orderId} accepted successfully`,
      data: order,
    });
  } catch (error: any) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept order',
      message: error.message,
    });
  }
});

/**
 * @desc    Upload profile image
 * @route   POST /api/creators/upload-profile-image
 * @access  Private
 */
export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });

    if (!creatorProfile) {
      res.status(404);
      throw new Error('Creator profile not found');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Update profile image URL
    creatorProfile.personalInfo.profileImage = req.file.path;
    await creatorProfile.save();

    res.status(200).json({
      success: true,
      data: {
        profileImage: req.file.path
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500);
    throw new Error('Server error uploading profile image');
  }
});

/**
 * @desc    Force update profile completeness
 * @route   POST /api/creators/force-update-completeness
 * @access  Private
 */
export const forceUpdateCompleteness = asyncHandler(async (req: Request, res: Response) => {
  const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });
  if (!creatorProfile) {
    res.status(404);
    throw new Error('Creator profile not found');
  }

  const completionStatus = {
    personalInfo: Boolean(creatorProfile.personalInfo?.firstName && creatorProfile.personalInfo?.lastName),
    professionalInfo: Boolean(creatorProfile.professionalInfo?.title && Array.isArray(creatorProfile.professionalInfo?.categories) && creatorProfile.professionalInfo.categories.length > 0),
    descriptionFaq: Boolean(creatorProfile.descriptionFaq?.briefDescription),
    socialMedia: Boolean(creatorProfile.socialMedia?.socialProfiles?.instagram?.url),
    pricing: Boolean(creatorProfile.pricing?.packages?.basic?.price),
    galleryPortfolio: Boolean(creatorProfile.galleryPortfolio?.images?.length > 0)
  };

  const completedSections = Object.values(completionStatus).filter(Boolean).length;
  const totalSections = Object.keys(completionStatus).length;
  const completionPercentage = Math.floor((completedSections / totalSections) * 100);

  creatorProfile.completionStatus = completionStatus;
  if (!creatorProfile.metrics) {
    creatorProfile.metrics = {
      profileViews: 0,
      profileCompleteness: 0,
      averageResponseTime: 0,
      ratings: {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      projectsCompleted: 0,
      repeatClientRate: 0
    };
  }
  creatorProfile.metrics.profileCompleteness = completionPercentage;

  await creatorProfile.save();

  res.status(200).json({
    success: true,
    data: { completionStatus, completionPercentage }
  });
});

/**
 * @desc    Sync profile image from creator profile to user avatar
 * @param   userId The ID of the user to sync
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const syncProfileImage = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Starting profile image sync for user ${userId}`);

    // Find the creator profile
    const creatorProfile = await CreatorProfile.findOne({ userId });
    
    if (!creatorProfile) {
      console.log(`No creator profile found for user ${userId}`);
      return false;
    }

    // Get the profile image URL from creator profile
    const profileImageUrl = creatorProfile.personalInfo?.profileImage;
    
    if (!profileImageUrl) {
      console.log(`No profile image URL found for user ${userId}`);
      return false;
    }

    console.log(`Found profile image URL: ${profileImageUrl}`);

    // Find and update the user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`No user found with ID ${userId}`);
      return false;
    }

    // Update the user's avatar
    user.avatar = profileImageUrl;
    await user.save();

    console.log(`Successfully updated avatar for user ${userId} to ${profileImageUrl}`);
    return true;
  } catch (error) {
    console.error(`Error syncing profile image for user ${userId}:`, error);
    return false;
  }
};

/**
 * @desc    Increment dashboardImpressions for a creator
 * @route   POST /api/creators/dashboard-impression
 * @access  Private (creator only)
 */
export const dashboardImpression = asyncHandler(async (req: Request, res: Response) => {
  const { creatorId } = req.body;
  if (!creatorId) {
    res.status(400).json({ error: 'creatorId required' });
    return;
  }
  try {
    const updatedProfile = await CreatorProfile.findByIdAndUpdate(
      creatorId,
      { $inc: { dashboardImpressions: 1 } },
      { new: true, upsert: false }
    );
    // Also increment dashboardImpressions in CreatorMetrics
    if (updatedProfile && updatedProfile.userId) {
      await CreatorMetrics.findOneAndUpdate(
        { creator: updatedProfile.userId },
        { $inc: { dashboardImpressions: 1 } },
        { new: true, upsert: false }
      );
    }
    res.status(200).json({ success: true });
    if (updatedProfile) {
      console.log(`Impression stored: dashboardImpressions for creatorId ${creatorId} is now ${updatedProfile.dashboardImpressions}`);
    } else {
      console.log(`Impression attempted but creator profile not found for creatorId ${creatorId}`);
    }
  } catch (err) {
    console.error('Error updating dashboard impressions:', err);
    res.status(500).json({ error: 'Failed to update dashboard impressions' });
  }
});

export const deactivateCreator = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const creator = await CreatorProfile.findOneAndUpdate(
    { 'personalInfo.username': username },
    { isActive: false, status: 'suspended', deactivatedAt: new Date(), deactivationReason: 'Deactivated by admin' },
    { new: true }
  );
  if (!creator) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const userId = typeof creator.userId === 'object' && creator.userId !== null && 'toString' in creator.userId
    ? creator.userId.toString()
    : creator.userId;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive: false, deactivatedAt: new Date(), deactivationReason: 'Deactivated by admin' },
    { new: true }
  );
  res.json({ success: true, data: { creator, user: updatedUser } });
});

/**
 * @desc    Get all suspended/deactivated creator profiles (admin)
 * @route   GET /api/creators/admin/suspended
 * @access  Admin
 */
export const getSuspendedCreators = asyncHandler(async (req: Request, res: Response) => {
  try {
    const suspendedCreators = await CreatorProfile.find({
      $or: [
        { status: 'suspended' },
        { isActive: false }
      ]
    }).populate('userId', 'fullName email avatar username createdAt');
    res.status(200).json({
      success: true,
      count: suspendedCreators.length,
      data: suspendedCreators
    });
  } catch (error) {
    console.error('Error fetching suspended creators:', error);
    res.status(500);
    throw new Error('Server error fetching suspended creators');
  }
});

export const reactivateCreator = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const creator = await CreatorProfile.findOneAndUpdate(
    { 'personalInfo.username': username },
    { isActive: true, status: 'published', deactivatedAt: null, deactivationReason: null },
    { new: true }
  );
  if (!creator) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const userId = typeof creator.userId === 'object' && creator.userId !== null && 'toString' in creator.userId
    ? creator.userId.toString()
    : creator.userId;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive: true, deactivatedAt: null, deactivationReason: null },
    { new: true }
  );
  res.json({ success: true, data: { creator, user: updatedUser } });
});

/**
 * @desc    Get similar creators based on search results and preferences
 * @route   POST /api/creators/similar
 * @access  Public
 */
export const getSimilarCreators = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      searchQuery, 
      searchResults = [], 
      category, 
      platform, 
      priceRange,
      limit = 6 
    } = req.body;

    console.log('Getting similar creators for search:', searchQuery);

    // Extract characteristics from search results to find similar creators
    const searchResultIds = searchResults.map((creator: any) => creator._id || creator.id);
    
    // Build similarity criteria based on search results and query
    const similarityFilter: any = {
      status: 'published',
      'publishInfo.isPublished': true,
      isActive: { $ne: false },
      _id: { $nin: searchResultIds } // Exclude already shown creators
    };

    // If we have search results, analyze them for patterns
    if (searchResults.length > 0) {
      const categories = searchResults
        .map((creator: any) => creator.professionalInfo?.categories)
        .flat()
        .filter(Boolean);
      
      const subcategories = searchResults
        .map((creator: any) => creator.professionalInfo?.subcategories)
        .flat()
        .filter(Boolean);

      // Find creators in similar categories
      if (categories.length > 0) {
        similarityFilter.$or = [
          { 'professionalInfo.categories': { $in: categories } },
          { 'professionalInfo.subcategories': { $in: subcategories } }
        ];
      }
    }

    // Apply additional filters from search context
    if (category && category !== 'All Categories') {
      if (similarityFilter.$or) {
        similarityFilter.$and = [
          { $or: similarityFilter.$or },
          { 'professionalInfo.categories': category }
        ];
        delete similarityFilter.$or;
      } else {
        similarityFilter['professionalInfo.categories'] = category;
      }
    }

    if (platform && platform !== 'All Platforms') {
      const platformKey = platform.toLowerCase();
      similarityFilter[`socialMedia.socialProfiles.${platformKey}.url`] = { $exists: true, $ne: '' };
    }

    // Apply price range similarity if provided
    if (priceRange) {
      const { min, max } = priceRange;
      if (min || max) {
        similarityFilter['pricing.standard.price'] = {};
        if (min) similarityFilter['pricing.standard.price'].$gte = min;
        if (max) similarityFilter['pricing.standard.price'].$lte = max;
      }
    }

    // If we have a search query, use it for text-based similarity
    if (searchQuery && !searchResults.length) {
      const searchRegex = new RegExp(searchQuery, 'i');
      similarityFilter.$or = [
        { 'personalInfo.username': searchRegex },
        { 'personalInfo.fullName': searchRegex },
        { 'personalInfo.bio': searchRegex },
        { 'professionalInfo.title': searchRegex },
        { 'professionalInfo.categories': searchRegex },
        { 'professionalInfo.subcategories': searchRegex },
        { 'descriptionFaq.briefDescription': searchRegex }
      ];
    }

    // Smart sorting algorithm for similarity
    const sortOptions: any = {
      'metrics.ratings.average': -1,
      'metrics.profileViews': -1,
      'socialMedia.totalReach': -1
    };

    // Get similar creators
    let similarCreators = await CreatorProfile.find(similarityFilter)
      .select('-__v')
      .populate('userId', 'fullName username email avatar')
      .sort(sortOptions)
      .limit(limit * 2); // Get more to ensure diversity

    // If we don't have enough similar creators, get trending/popular ones
    if (similarCreators.length < limit) {
      const fallbackFilter = {
        status: 'published',
        'publishInfo.isPublished': true,
        isActive: { $ne: false },
        _id: { $nin: [...searchResultIds, ...similarCreators.map(c => c._id)] }
      };

      const fallbackCreators = await CreatorProfile.find(fallbackFilter)
        .select('-__v')
        .populate('userId', 'fullName username email avatar')
        .sort({ 'metrics.profileViews': -1, 'metrics.ratings.average': -1 })
        .limit(limit - similarCreators.length);

      similarCreators = [...similarCreators, ...fallbackCreators];
    }

    // Apply diversity algorithm to ensure variety
    const diverseCreators = applyDiversityAlgorithm(similarCreators, limit);

    // Process creators similar to getPublishedCreators
    const processedCreators = diverseCreators.map((creator: any) => {
      const creatorId = creator._id ? creator._id.toString() : '';
      
      let username = '';
      if (creator.userId && typeof creator.userId === 'object') {
        if (creator.userId.username) {
          username = creator.userId.username;
        }
      }
      
      if (!username && creator.personalInfo && creator.personalInfo.username) {
        username = creator.personalInfo.username;
      }
      
      if (!username) {
        username = `user_${creatorId.substring(0, 8)}`;
      }
      
      return {
        _id: creatorId,
        userId: creator.userId,
        username,
        fullName: creator.userId && creator.userId.fullName ? creator.userId.fullName : 'Creator',
        title: creator.professionalInfo?.title || '',
        personalInfo: creator.personalInfo || {},
        professionalInfo: creator.professionalInfo || {},
        descriptionFaq: creator.descriptionFaq || {},
        socialMedia: creator.socialMedia || {},
        pricing: creator.pricing || {},
        gallery: creator.gallery || {},
        portfolio: creator.portfolio || [],
        metrics: creator.metrics || {},
        publishInfo: creator.publishInfo || {},
        status: creator.status
      };
    });

    console.log(`Returning ${processedCreators.length} similar creators`);

    res.status(200).json({
      success: true,
      count: processedCreators.length,
      data: processedCreators,
      searchContext: {
        query: searchQuery,
        category,
        platform,
        basedOnResults: searchResults.length
      }
    });

  } catch (error) {
    console.error('Error fetching similar creators:', error);
    res.status(500);
    throw new Error('Server error fetching similar creators');
  }
});

/**
 * Helper function to apply diversity algorithm to creator recommendations
 * Ensures variety in categories, price ranges, and follower counts
 */
function applyDiversityAlgorithm(creators: any[], limit: number): any[] {
  if (creators.length <= limit) {
    return creators;
  }

  const diverseCreators: any[] = [];
  const usedCategories = new Set<string>();
  const usedPriceRanges = new Set<string>();
  
  // Helper function to get price range category
  const getPriceRange = (price: number): string => {
    if (price < 10000) return 'budget';
    if (price < 30000) return 'mid';
    if (price < 60000) return 'premium';
    return 'luxury';
  };

  // First pass: Select creators ensuring category diversity
  for (const creator of creators) {
    if (diverseCreators.length >= limit) break;
    
    const category = creator.professionalInfo?.categories?.[0] || 'general';
    const price = creator.pricing?.standard?.price || 0;
    const priceRange = getPriceRange(price);
    
    // Prefer creators from new categories and price ranges
    if (!usedCategories.has(category) || !usedPriceRanges.has(priceRange)) {
      diverseCreators.push(creator);
      usedCategories.add(category);
      usedPriceRanges.add(priceRange);
    }
  }

  // Second pass: Fill remaining slots with best remaining creators
  for (const creator of creators) {
    if (diverseCreators.length >= limit) break;
    
    if (!diverseCreators.find(c => c._id.toString() === creator._id.toString())) {
      diverseCreators.push(creator);
    }
  }

  return diverseCreators.slice(0, limit);
}

/**
 * @desc    Get all available tags from published creators
 * @route   GET /api/creators/tags
 * @access  Public
 */
export const getAvailableTags = asyncHandler(async (req: Request, res: Response) => {
  try {
    const tags = await CreatorProfile.aggregate([
      {
        $match: {
          status: 'published',
          'publishInfo.isPublished': true,
          isActive: { $ne: false }
        }
      },
      {
        $unwind: '$professionalInfo.tags'
      },
      {
        $group: {
          _id: '$professionalInfo.tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: tags.map(item => ({ tag: item.tag, count: item.count }))
    });
  } catch (error) {
    console.error('Error fetching available tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available tags'
    });
  }
});

/**
 * @desc    Get all available content types from published creators
 * @route   GET /api/creators/content-types
 * @access  Public
 */
export const getAvailableContentTypes = asyncHandler(async (req: Request, res: Response) => {
  try {
    const contentTypes = await CreatorProfile.aggregate([
      {
        $match: {
          status: 'published',
          'publishInfo.isPublished': true,
          isActive: { $ne: false }
        }
      },
      {
        $unwind: '$professionalInfo.contentTypes'
      },
      {
        $group: {
          _id: '$professionalInfo.contentTypes',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          contentType: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: contentTypes.map(item => ({ contentType: item.contentType, count: item.count }))
    });
  } catch (error) {
    console.error('Error fetching available content types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available content types'
    });
  }
});
  