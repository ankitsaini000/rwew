"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestCreatorMatchesForBrand = void 0;
const BrandProfile_1 = __importDefault(require("../models/BrandProfile"));
const BrandPreference_1 = __importDefault(require("../models/BrandPreference"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const CreatorMetrics_1 = __importDefault(require("../models/CreatorMetrics"));
const Promotion_1 = __importDefault(require("../models/Promotion"));
/**
 * Calculate a matching score between a brand and a creator based on multiple factors.
 * Returns { score, reasons }
 */
function calculateMatchScore(brand, preference, campaign, creator, metrics) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8;
    let score = 0;
    const reasons = [];
    // 1. Category/Industry Match
    if ((preference === null || preference === void 0 ? void 0 : preference.category) && ((_b = (_a = creator.professionalInfo) === null || _a === void 0 ? void 0 : _a.categories) === null || _b === void 0 ? void 0 : _b.includes(preference.category))) {
        score += 20;
        reasons.push('Category match');
    }
    // 2. Brand Values Alignment
    if ((preference === null || preference === void 0 ? void 0 : preference.brandValues) && ((_c = creator.professionalInfo) === null || _c === void 0 ? void 0 : _c.tags)) {
        const overlap = preference.brandValues.filter((v) => creator.professionalInfo.tags.includes(v));
        if (overlap.length > 0) {
            score += 10;
            reasons.push('Brand values alignment');
        }
    }
    // 3. Social Media Platform Match
    if ((preference === null || preference === void 0 ? void 0 : preference.socialMediaPreferences) && ((_d = creator.socialMedia) === null || _d === void 0 ? void 0 : _d.socialProfiles)) {
        const creatorPlatforms = Object.keys(creator.socialMedia.socialProfiles).filter((p) => { var _a, _b; return ((_a = creator.socialMedia.socialProfiles[p]) === null || _a === void 0 ? void 0 : _a.url) || ((_b = creator.socialMedia.socialProfiles[p]) === null || _b === void 0 ? void 0 : _b.handle); });
        const overlap = preference.socialMediaPreferences.filter((p) => creatorPlatforms.includes(p.toLowerCase()));
        if (overlap.length > 0) {
            score += 15;
            reasons.push('Preferred social media platform match');
        }
    }
    // 4. Audience Demographics Match (age, gender, country)
    if ((preference === null || preference === void 0 ? void 0 : preference.ageTargeting) && ((_g = (_f = (_e = creator.socialMedia) === null || _e === void 0 ? void 0 : _e.audienceDemographics) === null || _f === void 0 ? void 0 : _f.ageRanges) === null || _g === void 0 ? void 0 : _g.includes(preference.ageTargeting))) {
        score += 5;
        reasons.push('Audience age match');
    }
    if ((preference === null || preference === void 0 ? void 0 : preference.genderTargeting) && ((_j = (_h = creator.socialMedia) === null || _h === void 0 ? void 0 : _h.audienceDemographics) === null || _j === void 0 ? void 0 : _j.genderBreakdown)) {
        const gender = preference.genderTargeting.toLowerCase();
        if (creator.socialMedia.audienceDemographics.genderBreakdown[gender] > 30) {
            score += 5;
            reasons.push('Audience gender match');
        }
    }
    if ((preference === null || preference === void 0 ? void 0 : preference.location) && ((_l = (_k = creator.personalInfo) === null || _k === void 0 ? void 0 : _k.location) === null || _l === void 0 ? void 0 : _l.country) === preference.location) {
        score += 5;
        reasons.push('Location match');
    }
    // 5. Budget Fit
    if ((preference === null || preference === void 0 ? void 0 : preference.budget) && ((_o = (_m = creator.pricing) === null || _m === void 0 ? void 0 : _m.basic) === null || _o === void 0 ? void 0 : _o.price) && creator.pricing.basic.price <= preference.budget) {
        score += 10;
        reasons.push('Within budget');
    }
    // 6. Enhanced Engagement & Quality Metrics from CreatorMetrics
    // Rating Score
    const avgRating = ((_q = (_p = metrics === null || metrics === void 0 ? void 0 : metrics.profileMetrics) === null || _p === void 0 ? void 0 : _p.ratings) === null || _q === void 0 ? void 0 : _q.average) || ((_r = metrics === null || metrics === void 0 ? void 0 : metrics.ratings) === null || _r === void 0 ? void 0 : _r.average);
    if (avgRating >= 4.5) {
        score += 10;
        reasons.push('High average rating');
    }
    else if (avgRating >= 4.0) {
        score += 5;
        reasons.push('Good average rating');
    }
    else if (avgRating >= 3.5) {
        score += 2;
        reasons.push('Average rating');
    }
    // Projects Completed
    const projectsCompleted = ((_s = metrics === null || metrics === void 0 ? void 0 : metrics.profileMetrics) === null || _s === void 0 ? void 0 : _s.projectsCompleted) || (metrics === null || metrics === void 0 ? void 0 : metrics.completedProjects) || 0;
    if (projectsCompleted >= 50) {
        score += 8;
        reasons.push('Highly experienced creator');
    }
    else if (projectsCompleted >= 20) {
        score += 5;
        reasons.push('Experienced creator');
    }
    else if (projectsCompleted >= 10) {
        score += 3;
        reasons.push('Moderately experienced creator');
    }
    else if (projectsCompleted >= 5) {
        score += 1;
        reasons.push('Some experience');
    }
    // Repeat Client Rate
    const repeatClientRate = ((_t = metrics === null || metrics === void 0 ? void 0 : metrics.profileMetrics) === null || _t === void 0 ? void 0 : _t.repeatClientRate) || 0;
    if (repeatClientRate >= 50) {
        score += 8;
        reasons.push('Excellent repeat client rate');
    }
    else if (repeatClientRate >= 30) {
        score += 5;
        reasons.push('High repeat client rate');
    }
    else if (repeatClientRate >= 15) {
        score += 2;
        reasons.push('Good repeat client rate');
    }
    // Response Rate
    const responseRate = (metrics === null || metrics === void 0 ? void 0 : metrics.responseRate) || 100;
    if (responseRate >= 95) {
        score += 5;
        reasons.push('Excellent response rate');
    }
    else if (responseRate >= 85) {
        score += 3;
        reasons.push('Good response rate');
    }
    else if (responseRate >= 70) {
        score += 1;
        reasons.push('Average response rate');
    }
    // 7. Influencer Tier & Reach
    const followers = (metrics === null || metrics === void 0 ? void 0 : metrics.followers) || 0;
    const influencerTier = (metrics === null || metrics === void 0 ? void 0 : metrics.influencerTier) || 'Bronze';
    // Follower-based scoring
    if (followers >= 1000000) {
        score += 10;
        reasons.push('Mega influencer (1M+ followers)');
    }
    else if (followers >= 500000) {
        score += 8;
        reasons.push('Macro influencer (500K+ followers)');
    }
    else if (followers >= 100000) {
        score += 6;
        reasons.push('Mid-tier influencer (100K+ followers)');
    }
    else if (followers >= 50000) {
        score += 4;
        reasons.push('Micro influencer (50K+ followers)');
    }
    else if (followers >= 10000) {
        score += 2;
        reasons.push('Nano influencer (10K+ followers)');
    }
    // Tier-based scoring
    const tierScores = {
        'Diamond': 8,
        'Platinum': 6,
        'Gold': 4,
        'Silver': 2,
        'Bronze': 0
    };
    score += tierScores[influencerTier] || 0;
    if (tierScores[influencerTier] > 0) {
        reasons.push(`${influencerTier} tier creator`);
    }
    // 8. Service Tier
    const serviceTier = (metrics === null || metrics === void 0 ? void 0 : metrics.serviceTier) || 'Standard';
    const serviceTierScores = {
        'VIP': 5,
        'Elite': 3,
        'Professional': 2,
        'Standard': 0
    };
    score += serviceTierScores[serviceTier] || 0;
    if (serviceTierScores[serviceTier] > 0) {
        reasons.push(`${serviceTier} service tier`);
    }
    // 9. Revenue & Performance
    const totalEarnings = (metrics === null || metrics === void 0 ? void 0 : metrics.totalEarnings) || 0;
    if (totalEarnings >= 100000) {
        score += 3;
        reasons.push('High-earning creator');
    }
    else if (totalEarnings >= 50000) {
        score += 2;
        reasons.push('Moderate-earning creator');
    }
    else if (totalEarnings >= 10000) {
        score += 1;
        reasons.push('Established creator');
    }
    // 10. Recency & Activity
    const lastUpdated = metrics === null || metrics === void 0 ? void 0 : metrics.lastUpdated;
    if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 7) {
        score += 3;
        reasons.push('Recently active');
    }
    else if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 30) {
        score += 1;
        reasons.push('Active within month');
    }
    // 11. Profile Completeness
    const profileCompleteness = ((_u = metrics === null || metrics === void 0 ? void 0 : metrics.profileMetrics) === null || _u === void 0 ? void 0 : _u.profileCompleteness) || 0;
    if (profileCompleteness >= 90) {
        score += 3;
        reasons.push('Complete profile');
    }
    else if (profileCompleteness >= 70) {
        score += 1;
        reasons.push('Good profile completeness');
    }
    // 12. Custom: Campaign requirements, tags, etc.
    if (campaign && campaign.tags && ((_v = creator.professionalInfo) === null || _v === void 0 ? void 0 : _v.tags)) {
        const overlap = campaign.tags.filter((t) => creator.professionalInfo.tags.includes(t));
        if (overlap.length > 0) {
            score += 5;
            reasons.push('Campaign tag match');
        }
    }
    // Subcategory Match
    if ((preference === null || preference === void 0 ? void 0 : preference.subcategories) && ((_w = creator.professionalInfo) === null || _w === void 0 ? void 0 : _w.subcategories)) {
        const overlap = preference.subcategories.filter((sub) => creator.professionalInfo.subcategories.includes(sub));
        if (overlap.length > 0) {
            score += 8;
            reasons.push('Subcategory match');
        }
    }
    // Expertise Match
    if ((preference === null || preference === void 0 ? void 0 : preference.requiredExpertise) && ((_x = creator.professionalInfo) === null || _x === void 0 ? void 0 : _x.expertise)) {
        const overlap = preference.requiredExpertise.filter((exp) => creator.professionalInfo.expertise.includes(exp));
        if (overlap.length > 0) {
            score += 8;
            reasons.push('Expertise match');
        }
    }
    // Content Type Match
    if ((preference === null || preference === void 0 ? void 0 : preference.contentTypes) && ((_y = creator.professionalInfo) === null || _y === void 0 ? void 0 : _y.contentTypes)) {
        const overlap = preference.contentTypes.filter((ct) => creator.professionalInfo.contentTypes.includes(ct));
        if (overlap.length > 0) {
            score += 8;
            reasons.push('Content type match');
        }
    }
    // Event Types Match
    if ((preference === null || preference === void 0 ? void 0 : preference.eventTypes) && ((_0 = (_z = creator.professionalInfo) === null || _z === void 0 ? void 0 : _z.eventAvailability) === null || _0 === void 0 ? void 0 : _0.eventTypes)) {
        const overlap = preference.eventTypes.filter((et) => creator.professionalInfo.eventAvailability.eventTypes.includes(et));
        if (overlap.length > 0) {
            score += 5;
            reasons.push('Event type match');
        }
    }
    // Event Travel Willingness
    if (typeof (preference === null || preference === void 0 ? void 0 : preference.eventTravelWillingness) === 'boolean' && ((_2 = (_1 = creator.professionalInfo) === null || _1 === void 0 ? void 0 : _1.eventAvailability) === null || _2 === void 0 ? void 0 : _2.travelWillingness) !== undefined) {
        if (preference.eventTravelWillingness === creator.professionalInfo.eventAvailability.travelWillingness) {
            score += 3;
            reasons.push('Travel willingness match');
        }
    }
    // Preferred Locations
    if ((preference === null || preference === void 0 ? void 0 : preference.preferredLocations) && ((_4 = (_3 = creator.professionalInfo) === null || _3 === void 0 ? void 0 : _3.eventAvailability) === null || _4 === void 0 ? void 0 : _4.preferredLocations)) {
        const overlap = preference.preferredLocations.filter((loc) => creator.professionalInfo.eventAvailability.preferredLocations.includes(loc));
        if (overlap.length > 0) {
            score += 3;
            reasons.push('Preferred location match');
        }
    }
    // Minimum Years Experience
    if ((preference === null || preference === void 0 ? void 0 : preference.minYearsExperience) && ((_5 = creator.professionalInfo) === null || _5 === void 0 ? void 0 : _5.yearsExperience)) {
        if (creator.professionalInfo.yearsExperience >= preference.minYearsExperience) {
            score += 5;
            reasons.push('Meets minimum years of experience');
        }
    }
    // Target Audience Gender
    if ((preference === null || preference === void 0 ? void 0 : preference.requiredAudienceGender) && ((_6 = creator.professionalInfo) === null || _6 === void 0 ? void 0 : _6.targetAudienceGender)) {
        if (preference.requiredAudienceGender.toLowerCase() === creator.professionalInfo.targetAudienceGender.toLowerCase()) {
            score += 3;
            reasons.push('Target audience gender match');
        }
    }
    // Target Audience Age Range
    if ((preference === null || preference === void 0 ? void 0 : preference.requiredAudienceAgeRange) && ((_7 = creator.professionalInfo) === null || _7 === void 0 ? void 0 : _7.targetAudienceAgeRange)) {
        if (preference.requiredAudienceAgeRange === creator.professionalInfo.targetAudienceAgeRange) {
            score += 3;
            reasons.push('Target audience age range match');
        }
    }
    // Social Media Preference
    if ((preference === null || preference === void 0 ? void 0 : preference.socialMediaPreferences) && ((_8 = creator.professionalInfo) === null || _8 === void 0 ? void 0 : _8.socialMediaPreference)) {
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
const getBestCreatorMatchesForBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const { campaignId } = req.query;
        // Fetch brand profile and preferences
        const brand = await BrandProfile_1.default.findOne({ userId: brandId });
        const preference = await BrandPreference_1.default.findOne({ brandId });
        let campaign = null;
        if (campaignId) {
            campaign = await Promotion_1.default.findById(campaignId);
        }
        if (!brand || !preference) {
            return res.status(404).json({ message: 'Brand or preferences not found' });
        }
        // Fetch all published creators
        const creators = await CreatorProfile_1.CreatorProfile.find({ 'publishInfo.isPublished': true });
        // Fetch metrics for all creators
        const metricsMap = {};
        const metricsArr = await CreatorMetrics_1.default.find({ creator: { $in: creators.map((c) => c.userId) } });
        metricsArr.forEach((m) => { metricsMap[m.creator.toString()] = m; });
        // Score and rank creators
        const scored = creators.map((creator) => {
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
        scored.sort((a, b) => b.score - a.score);
        return res.json({ matches: scored });
    }
    catch (err) {
        console.error('Matching error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBestCreatorMatchesForBrand = getBestCreatorMatchesForBrand;
