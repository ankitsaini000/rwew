import { Request, Response } from 'express';
import BrandProfile from '../models/BrandProfile';
import BrandPreference from '../models/BrandPreference';
import { CreatorProfile } from '../models/CreatorProfile';
import CreatorMetrics from '../models/CreatorMetrics';
import Promotion from '../models/Promotion';

/**
 * Calculate a matching score between a brand and a creator based on multiple factors.
 * Returns { score, reasons }
 */
function calculateMatchScore(brand: any, preference: any, campaign: any, creator: any, metrics: any) {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category/Industry Match
  if (preference?.category && creator.professionalInfo?.categories?.includes(preference.category)) {
    score += 20;
    reasons.push('Category match');
  }

  // 2. Brand Values Alignment
  if (preference?.brandValues && creator.professionalInfo?.tags) {
    const overlap = preference.brandValues.filter((v: string) => creator.professionalInfo.tags.includes(v));
    if (overlap.length > 0) {
      score += 10;
      reasons.push('Brand values alignment');
    }
  }

  // 3. Social Media Platform Match
  if (preference?.socialMediaPreferences && creator.socialMedia?.socialProfiles) {
    const creatorPlatforms = Object.keys(creator.socialMedia.socialProfiles).filter(
      (p) => creator.socialMedia.socialProfiles[p]?.url || creator.socialMedia.socialProfiles[p]?.handle
    );
    const overlap = preference.socialMediaPreferences.filter((p: string) => creatorPlatforms.includes(p.toLowerCase()));
    if (overlap.length > 0) {
      score += 15;
      reasons.push('Preferred social media platform match');
    }
  }

  // 4. Audience Demographics Match (age, gender, country)
  if (preference?.ageTargeting && creator.socialMedia?.audienceDemographics?.ageRanges?.includes(preference.ageTargeting)) {
    score += 5;
    reasons.push('Audience age match');
  }
  if (preference?.genderTargeting && creator.socialMedia?.audienceDemographics?.genderBreakdown) {
    const gender = preference.genderTargeting.toLowerCase();
    if (creator.socialMedia.audienceDemographics.genderBreakdown[gender] > 30) {
      score += 5;
      reasons.push('Audience gender match');
    }
  }
  if (preference?.location && creator.personalInfo?.location?.country === preference.location) {
    score += 5;
    reasons.push('Location match');
  }

  // 5. Budget Fit
  if (preference?.budget && creator.pricing?.basic?.price && creator.pricing.basic.price <= preference.budget) {
    score += 10;
    reasons.push('Within budget');
  }

  // 6. Enhanced Engagement & Quality Metrics from CreatorMetrics
  // Rating Score
  const avgRating = metrics?.profileMetrics?.ratings?.average || metrics?.ratings?.average;
  if (avgRating >= 4.5) {
    score += 10;
    reasons.push('High average rating');
  } else if (avgRating >= 4.0) {
    score += 5;
    reasons.push('Good average rating');
  } else if (avgRating >= 3.5) {
    score += 2;
    reasons.push('Average rating');
  }

  // Projects Completed
  const projectsCompleted = metrics?.profileMetrics?.projectsCompleted || metrics?.completedProjects || 0;
  if (projectsCompleted >= 50) {
    score += 8;
    reasons.push('Highly experienced creator');
  } else if (projectsCompleted >= 20) {
    score += 5;
    reasons.push('Experienced creator');
  } else if (projectsCompleted >= 10) {
    score += 3;
    reasons.push('Moderately experienced creator');
  } else if (projectsCompleted >= 5) {
    score += 1;
    reasons.push('Some experience');
  }

  // Repeat Client Rate
  const repeatClientRate = metrics?.profileMetrics?.repeatClientRate || 0;
  if (repeatClientRate >= 50) {
    score += 8;
    reasons.push('Excellent repeat client rate');
  } else if (repeatClientRate >= 30) {
    score += 5;
    reasons.push('High repeat client rate');
  } else if (repeatClientRate >= 15) {
    score += 2;
    reasons.push('Good repeat client rate');
  }

  // Response Rate
  const responseRate = metrics?.responseRate || 100;
  if (responseRate >= 95) {
    score += 5;
    reasons.push('Excellent response rate');
  } else if (responseRate >= 85) {
    score += 3;
    reasons.push('Good response rate');
  } else if (responseRate >= 70) {
    score += 1;
    reasons.push('Average response rate');
  }

  // 7. Influencer Tier & Reach
  const followers = metrics?.followers || 0;
  const influencerTier = metrics?.influencerTier || 'Bronze';
  
  // Follower-based scoring
  if (followers >= 1000000) {
    score += 10;
    reasons.push('Mega influencer (1M+ followers)');
  } else if (followers >= 500000) {
    score += 8;
    reasons.push('Macro influencer (500K+ followers)');
  } else if (followers >= 100000) {
    score += 6;
    reasons.push('Mid-tier influencer (100K+ followers)');
  } else if (followers >= 50000) {
    score += 4;
    reasons.push('Micro influencer (50K+ followers)');
  } else if (followers >= 10000) {
    score += 2;
    reasons.push('Nano influencer (10K+ followers)');
  }

  // Tier-based scoring
  const tierScores: Record<string, number> = {
    'Diamond': 8,
    'Platinum': 6,
    'Gold': 4,
    'Silver': 2,
    'Bronze': 0
  };
  score += tierScores[influencerTier as keyof typeof tierScores] || 0;
  if (tierScores[influencerTier as keyof typeof tierScores] > 0) {
    reasons.push(`${influencerTier} tier creator`);
  }

  // 8. Service Tier
  const serviceTier = metrics?.serviceTier || 'Standard';
  const serviceTierScores: Record<string, number> = {
    'VIP': 5,
    'Elite': 3,
    'Professional': 2,
    'Standard': 0
  };
  score += serviceTierScores[serviceTier as keyof typeof serviceTierScores] || 0;
  if (serviceTierScores[serviceTier as keyof typeof serviceTierScores] > 0) {
    reasons.push(`${serviceTier} service tier`);
  }

  // 9. Revenue & Performance
  const totalEarnings = metrics?.totalEarnings || 0;
  if (totalEarnings >= 100000) {
    score += 3;
    reasons.push('High-earning creator');
  } else if (totalEarnings >= 50000) {
    score += 2;
    reasons.push('Moderate-earning creator');
  } else if (totalEarnings >= 10000) {
    score += 1;
    reasons.push('Established creator');
  }

  // 10. Recency & Activity
  const lastUpdated = metrics?.lastUpdated;
  if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 7) {
    score += 3;
    reasons.push('Recently active');
  } else if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 30) {
    score += 1;
    reasons.push('Active within month');
  }

  // 11. Profile Completeness
  const profileCompleteness = metrics?.profileMetrics?.profileCompleteness || 0;
  if (profileCompleteness >= 90) {
    score += 3;
    reasons.push('Complete profile');
  } else if (profileCompleteness >= 70) {
    score += 1;
    reasons.push('Good profile completeness');
  }

  // 12. Custom: Campaign requirements, tags, etc.
  if (campaign && campaign.tags && creator.professionalInfo?.tags) {
    const overlap = campaign.tags.filter((t: string) => creator.professionalInfo.tags.includes(t));
    if (overlap.length > 0) {
      score += 5;
      reasons.push('Campaign tag match');
    }
  }

  // Subcategory Match
  if (preference?.subcategories && creator.professionalInfo?.subcategories) {
    const overlap = preference.subcategories.filter((sub: string) =>
      creator.professionalInfo.subcategories.includes(sub)
    );
    if (overlap.length > 0) {
      score += 8;
      reasons.push('Subcategory match');
    }
  }

  // Expertise Match
  if (preference?.requiredExpertise && creator.professionalInfo?.expertise) {
    const overlap = preference.requiredExpertise.filter((exp: string) =>
      creator.professionalInfo.expertise.includes(exp)
    );
    if (overlap.length > 0) {
      score += 8;
      reasons.push('Expertise match');
    }
  }

  // Content Type Match
  if (preference?.contentTypes && creator.professionalInfo?.contentTypes) {
    const overlap = preference.contentTypes.filter((ct: string) =>
      creator.professionalInfo.contentTypes.includes(ct)
    );
    if (overlap.length > 0) {
      score += 8;
      reasons.push('Content type match');
    }
  }

  // Event Types Match
  if (preference?.eventTypes && creator.professionalInfo?.eventAvailability?.eventTypes) {
    const overlap = preference.eventTypes.filter((et: string) =>
      creator.professionalInfo.eventAvailability.eventTypes.includes(et)
    );
    if (overlap.length > 0) {
      score += 5;
      reasons.push('Event type match');
    }
  }

  // Event Travel Willingness
  if (typeof preference?.eventTravelWillingness === 'boolean' && creator.professionalInfo?.eventAvailability?.travelWillingness !== undefined) {
    if (preference.eventTravelWillingness === creator.professionalInfo.eventAvailability.travelWillingness) {
      score += 3;
      reasons.push('Travel willingness match');
    }
  }

  // Preferred Locations
  if (preference?.preferredLocations && creator.professionalInfo?.eventAvailability?.preferredLocations) {
    const overlap = preference.preferredLocations.filter((loc: string) =>
      creator.professionalInfo.eventAvailability.preferredLocations.includes(loc)
    );
    if (overlap.length > 0) {
      score += 3;
      reasons.push('Preferred location match');
    }
  }

  // Minimum Years Experience
  if (preference?.minYearsExperience && creator.professionalInfo?.yearsExperience) {
    if (creator.professionalInfo.yearsExperience >= preference.minYearsExperience) {
      score += 5;
      reasons.push('Meets minimum years of experience');
    }
  }

  // Target Audience Gender
  if (preference?.requiredAudienceGender && creator.professionalInfo?.targetAudienceGender) {
    if (preference.requiredAudienceGender.toLowerCase() === creator.professionalInfo.targetAudienceGender.toLowerCase()) {
      score += 3;
      reasons.push('Target audience gender match');
    }
  }

  // Target Audience Age Range
  if (preference?.requiredAudienceAgeRange && creator.professionalInfo?.targetAudienceAgeRange) {
    if (preference.requiredAudienceAgeRange === creator.professionalInfo.targetAudienceAgeRange) {
      score += 3;
      reasons.push('Target audience age range match');
    }
  }

  // Social Media Preference
  if (preference?.socialMediaPreferences && creator.professionalInfo?.socialMediaPreference) {
    if (preference.socialMediaPreferences.includes(creator.professionalInfo.socialMediaPreference)) {
      score += 3;
      reasons.push('Social media preference match');
    }
  }

  return { score, reasons };
}

/**
 * Controller: Get best creator matches for a brand (optionally for a campaign)
 * GET /api/match/brand/:brandId[?campaignId=]
 */
export const getBestCreatorMatchesForBrand = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const { campaignId } = req.query;

    // Fetch brand profile and preferences
    const brand = await BrandProfile.findOne({ userId: brandId });
    const preference = await BrandPreference.findOne({ brandId });
    let campaign = null;
    if (campaignId) {
      campaign = await Promotion.findById(campaignId);
    }
    
    // Return empty matches if brand or preferences don't exist
    if (!brand || !preference) {
      return res.status(200).json({ matches: [] });
    }

    // Fetch all published creators
    const creators = await CreatorProfile.find({ 'publishInfo.isPublished': true });
    // Fetch metrics for all creators
    const metricsMap: Record<string, any> = {};
    const metricsArr = await CreatorMetrics.find({ creator: { $in: creators.map((c: any) => c.userId) } });
    metricsArr.forEach((m: any) => { metricsMap[m.creator.toString()] = m; });

    // Score and rank creators
    const scored = creators.map((creator: any) => {
      const metrics = metricsMap[creator.userId.toString()] || {};
      const { score, reasons } = calculateMatchScore(brand, preference, campaign, creator, metrics);
      return {
        creatorId: creator._id,
        profile: creator,
        metrics: metrics,
        score,
        reasons
      };
    });
    scored.sort((a: any, b: any) => b.score - a.score);

    return res.json({ matches: scored });
  } catch (err) {
    console.error('Matching error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
