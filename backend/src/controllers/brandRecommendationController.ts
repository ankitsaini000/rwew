import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import BrandRecommendation from '../models/BrandRecommendation';
import { CreatorProfile } from '../models/CreatorProfile';
import BrandProfile from '../models/BrandProfile';
import BrandPreference from '../models/BrandPreference';
import CreatorMetrics from '../models/CreatorMetrics';

/**
 * Automatic Brand Recommendation System
 * Generates creator recommendations even when users don't submit the popup
 */

/**
 * Generate automatic recommendations based on brand profile and industry trends
 */
const generateAutomaticRecommendations = async (brandId: string) => {
  try {
    // Get brand profile if exists
    const brandProfile = await BrandProfile.findOne({ userId: brandId });
    
    // Define recommendation criteria based on different scenarios
    let recommendationCriteria: any = {
      status: 'published',
      'publishInfo.isPublished': true,
      isActive: { $ne: false }
    };

    // Scenario 1: Brand has profile - use industry/category matching
    if (brandProfile?.industry) {
      recommendationCriteria.$or = [
        { 'professionalInfo.categories': brandProfile.industry },
        { 'professionalInfo.tags': { $regex: brandProfile.industry, $options: 'i' } }
      ];
    } else {
      // Scenario 2: No brand profile - use trending/popular creators
      // Focus on high-performing creators across popular categories
      recommendationCriteria.$or = [
        { 'professionalInfo.categories': { $in: ['Fashion', 'Lifestyle', 'Technology', 'Beauty', 'Fitness'] } },
        { 'metrics.ratings.average': { $gte: 4.0 } }
      ];
    }

    // Get diverse set of creators using multiple sorting strategies
    const [
      topRatedCreators,
      trendingCreators,
      diverseCreators,
      newCreators
    ] = await Promise.all([
      // Top rated creators
      CreatorProfile.find(recommendationCriteria)
        .sort({ 'metrics.ratings.average': -1, 'metrics.projectsCompleted': -1 })
        .limit(3),
      
      // Trending creators (high profile views)
      CreatorProfile.find(recommendationCriteria)
        .sort({ 'metrics.profileViews': -1, 'metrics.ratings.average': -1 })
        .limit(3),
      
      // Diverse category creators
      CreatorProfile.find({
        ...recommendationCriteria,
        'professionalInfo.categories': { $in: ['Technology', 'Beauty', 'Fitness', 'Travel', 'Food'] }
      })
        .sort({ 'metrics.ratings.average': -1 })
        .limit(2),
      
      // New but promising creators
      CreatorProfile.find(recommendationCriteria)
        .sort({ createdAt: -1, 'metrics.ratings.average': -1 })
        .limit(2)
    ]);

    // Combine and deduplicate creators
    const allCreators = [...topRatedCreators, ...trendingCreators, ...diverseCreators, ...newCreators];
    const uniqueCreators = allCreators.filter((creator, index, self) => 
      index === self.findIndex(c => c._id.toString() === creator._id.toString())
    );

    // Apply diversity algorithm to ensure variety
    const finalRecommendations = applyDiversityAlgorithm(uniqueCreators, 8);

    return finalRecommendations.map(creator => creator._id);
  } catch (error) {
    console.error('Error generating automatic recommendations:', error);
    return [];
  }
};

/**
 * Diversity algorithm to ensure variety in recommendations
 */
const applyDiversityAlgorithm = (creators: any[], limit: number): any[] => {
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

  // First pass: Select creators ensuring category and price diversity
  for (const creator of creators) {
    if (diverseCreators.length >= limit) break;
    
    const category = creator.professionalInfo?.categories?.[0] || 'general';
    const price = creator.pricing?.standard?.price || 0;
    const priceRange = getPriceRange(price);

    // Prefer creators from unused categories and price ranges
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
};

/**
 * @desc    Get or create automatic recommendations for a brand
 * @route   GET /api/brand-recommendations/auto
 * @access  Private (Brand only)
 */
export const getAutomaticRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id.toString(); // Convert ObjectId to string

  try {
    // Check if recommendations already exist
    let brandRecommendation = await BrandRecommendation.findOne({ brand_id: brandId });

    if (!brandRecommendation) {
      // Generate new automatic recommendations
      const recommendedCreatorIds = await generateAutomaticRecommendations(brandId);
      
      // Save recommendations to database
      brandRecommendation = new BrandRecommendation({
        brand_id: brandId,
        recommended_creators: recommendedCreatorIds
      });
      
      await brandRecommendation.save();
    }

    // Populate creator details
    const populatedRecommendation = await BrandRecommendation.findById(brandRecommendation._id)
      .populate({
        path: 'recommended_creators',
        select: '-__v',
        populate: {
          path: 'userId',
          select: 'fullName username email avatar'
        }
      });

    res.status(200).json({
      success: true,
      data: populatedRecommendation?.recommended_creators || []
    });

  } catch (error) {
    console.error('Error in getAutomaticRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

/**
 * @desc    Refresh recommendations for a brand
 * @route   POST /api/brand-recommendations/refresh
 * @access  Private (Brand only)
 */
export const refreshRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id.toString(); // Convert ObjectId to string

  try {
    // Generate new recommendations
    const recommendedCreatorIds = await generateAutomaticRecommendations(brandId);
    
    // Update or create recommendations
    const brandRecommendation = await BrandRecommendation.findOneAndUpdate(
      { brand_id: brandId },
      { recommended_creators: recommendedCreatorIds },
      { upsert: true, new: true }
    ).populate({
      path: 'recommended_creators',
      select: '-__v',
      populate: {
        path: 'userId',
        select: 'fullName username email avatar'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Recommendations refreshed successfully',
      data: brandRecommendation.recommended_creators
    });

  } catch (error) {
    console.error('Error in refreshRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh recommendations'
    });
  }
});

/**
 * @desc    Get recommendations with fallback logic
 * @route   GET /api/brand-recommendations/smart
 * @access  Private (Brand only)
 */
export const getSmartRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.user._id.toString(); // Convert ObjectId to string

  try {
    // First, try to get preference-based recommendations
    const preference = await BrandPreference.findOne({ brandId });
    
    if (preference) {
      // Use existing preference-based logic
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
        .select('-__v')
        .populate('userId', 'fullName username email avatar')
        .sort({ 'metrics.ratings.average': -1, 'metrics.projectsCompleted': -1 })
        .limit(8);

      res.status(200).json({ success: true, data: creators });
    } else {
      // Fallback to automatic recommendations
      const brandRecommendation = await BrandRecommendation.findOne({ brand_id: brandId });
      
      if (!brandRecommendation) {
        // Generate new automatic recommendations
        const recommendedCreatorIds = await generateAutomaticRecommendations(brandId);
        
        const newRecommendation = new BrandRecommendation({
          brand_id: brandId,
          recommended_creators: recommendedCreatorIds
        });
        
        await newRecommendation.save();
        
        const populatedRecommendation = await BrandRecommendation.findById(newRecommendation._id)
          .populate({
            path: 'recommended_creators',
            select: '-__v',
            populate: {
              path: 'userId',
              select: 'fullName username email avatar'
            }
          });

        res.status(200).json({
          success: true,
          data: populatedRecommendation?.recommended_creators || []
        });
      } else {
        // Return existing automatic recommendations
        const populatedRecommendation = await BrandRecommendation.findById(brandRecommendation._id)
          .populate({
            path: 'recommended_creators',
            select: '-__v',
            populate: {
              path: 'userId',
              select: 'fullName username email avatar'
            }
          });

        res.status(200).json({
          success: true,
          data: populatedRecommendation?.recommended_creators || []
        });
      }
    }

  } catch (error) {
    console.error('Error in getSmartRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get smart recommendations'
    });
  }
});