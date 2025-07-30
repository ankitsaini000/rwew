"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCreatorProfileSocialFollowers = updateCreatorProfileSocialFollowers;
const axios_1 = __importDefault(require("axios"));
const SocialMedia_1 = __importDefault(require("../models/SocialMedia"));
const sockets_1 = require("../sockets");
const CreatorProfile_1 = require("../models/CreatorProfile");
// Helper to update CreatorProfile social followers/subscribers/connections
async function updateCreatorProfileSocialFollowers(userId, platform, count, username) {
    if (!userId)
        return;
    let update = {};
    switch (platform) {
        case 'instagram':
            update = {
                'socialMedia.socialProfiles.instagram.followers': count,
                'socialMedia.socialProfiles.instagram.handle': username,
                'socialMedia.socialProfiles.instagram.url': username ? `https://instagram.com/${username}` : ''
            };
            break;
        case 'facebook':
            update = {
                'socialMedia.socialProfiles.facebook.followers': count,
                'socialMedia.socialProfiles.facebook.handle': username,
                'socialMedia.socialProfiles.facebook.url': username ? `https://facebook.com/${username}` : ''
            };
            break;
        case 'youtube':
            update = {
                'socialMedia.socialProfiles.youtube.subscribers': count,
                'socialMedia.socialProfiles.youtube.handle': username,
                'socialMedia.socialProfiles.youtube.url': username ? `https://youtube.com/${username}` : ''
            };
            break;
        case 'twitter':
            update = {
                'socialMedia.socialProfiles.twitter.followers': count,
                'socialMedia.socialProfiles.twitter.handle': username,
                'socialMedia.socialProfiles.twitter.url': username ? `https://twitter.com/${username}` : ''
            };
            break;
        case 'linkedin':
            update = {
                'socialMedia.socialProfiles.linkedin.connections': count,
                'socialMedia.socialProfiles.linkedin.handle': username,
                'socialMedia.socialProfiles.linkedin.url': username ? `https://linkedin.com/in/${username}` : ''
            };
            break;
        default:
            return;
    }
    await CreatorProfile_1.CreatorProfile.findOneAndUpdate({ userId }, { $set: update }, { upsert: true });
}
class SocialMediaUpdateService {
    constructor() {
        this.updateInterval = null;
        this.isUpdating = false;
    }
    static getInstance() {
        if (!SocialMediaUpdateService.instance) {
            SocialMediaUpdateService.instance = new SocialMediaUpdateService();
        }
        return SocialMediaUpdateService.instance;
    }
    /**
     * Start the automatic update service
     */
    startAutoUpdate() {
        if (this.updateInterval) {
            console.log('Social media update service is already running');
            return;
        }
        console.log('🚀 Starting social media auto-update service (every 5 minutes)');
        // Run immediately on start
        this.updateAllSocialMediaAccounts();
        // Then run every 5 minutes
        this.updateInterval = setInterval(() => {
            this.updateAllSocialMediaAccounts();
        }, 5 * 60 * 1000); // 5 minutes
    }
    /**
     * Stop the automatic update service
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Stopped social media auto-update service');
        }
    }
    /**
     * Update all connected social media accounts
     */
    async updateAllSocialMediaAccounts() {
        if (this.isUpdating) {
            console.log('⚠️ Update already in progress, skipping...');
            return;
        }
        this.isUpdating = true;
        console.log('🔄 Starting social media update cycle...');
        try {
            // Get all connected social media accounts
            const accounts = await SocialMedia_1.default.find({
                connected: true,
                accessToken: { $exists: true, $ne: null },
                platformId: { $exists: true, $ne: null }
            });
            console.log(`📊 Found ${accounts.length} connected social media accounts to update`);
            const results = [];
            // Update each account
            for (const account of accounts) {
                try {
                    const result = await this.updateSingleAccount(account);
                    results.push(result);
                }
                catch (error) {
                    console.error(`❌ Error updating ${account.platform} account for ${account.username}:`, error);
                    results.push({
                        success: false,
                        platform: account.platform,
                        username: account.username,
                        oldCount: account.followerCount,
                        newCount: account.followerCount,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
            // Send real-time updates to connected clients
            this.sendRealTimeUpdates(results);
            console.log(`✅ Social media update cycle completed. Updated ${results.filter(r => r.success).length}/${results.length} accounts`);
        }
        catch (error) {
            console.error('❌ Error in social media update cycle:', error);
        }
        finally {
            this.isUpdating = false;
        }
    }
    /**
     * Update a single social media account
     */
    async updateSingleAccount(account) {
        const { platform, platformId, accessToken, username, followerCount: oldCount, userId } = account;
        console.log(`🔄 Updating ${platform} account: @${username}`);
        let newCount;
        switch (platform) {
            case 'instagram':
                newCount = await this.fetchInstagramFollowers(platformId, accessToken);
                break;
            case 'facebook':
                newCount = await this.fetchFacebookFollowers(platformId, accessToken);
                break;
            case 'youtube':
                newCount = await this.fetchYouTubeSubscribers(platformId, accessToken);
                break;
            case 'twitter':
                newCount = await this.fetchTwitterFollowers(platformId, accessToken);
                break;
            case 'linkedin':
                newCount = await this.fetchLinkedInConnections(platformId, accessToken);
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        if (newCount !== null && newCount !== oldCount) {
            // Update the account
            account.followerCount = newCount;
            account.lastUpdated = new Date();
            await account.save();
            // Update CreatorProfile automatically
            await updateCreatorProfileSocialFollowers(userId, platform, newCount, username);
            console.log(`✅ Updated @${username} (${platform}): ${oldCount.toLocaleString()} → ${newCount.toLocaleString()}`);
            return {
                success: true,
                platform,
                username,
                oldCount,
                newCount
            };
        }
        else {
            console.log(`ℹ️ No change for @${username} (${platform}): ${oldCount.toLocaleString()}`);
            return {
                success: true,
                platform,
                username,
                oldCount,
                newCount: oldCount
            };
        }
    }
    /**
     * Fetch Instagram followers count
     */
    async fetchInstagramFollowers(platformId, accessToken) {
        var _a, _b;
        try {
            const url = `https://graph.facebook.com/v19.0/${platformId}?fields=followers_count&access_token=${accessToken}`;
            const response = await axios_1.default.get(url);
            return (_a = response.data.followers_count) !== null && _a !== void 0 ? _a : null;
        }
        catch (error) {
            console.error(`Failed to fetch Instagram followers for ${platformId}:`, ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            return null;
        }
    }
    /**
     * Fetch Facebook followers count
     */
    async fetchFacebookFollowers(platformId, accessToken) {
        var _a, _b;
        try {
            const url = `https://graph.facebook.com/v19.0/${platformId}?fields=followers_count&access_token=${accessToken}`;
            const response = await axios_1.default.get(url);
            return (_a = response.data.followers_count) !== null && _a !== void 0 ? _a : null;
        }
        catch (error) {
            console.error(`Failed to fetch Facebook followers for ${platformId}:`, ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            return null;
        }
    }
    /**
     * Fetch YouTube subscribers count
     */
    async fetchYouTubeSubscribers(platformId, accessToken) {
        var _a, _b, _c, _d;
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${platformId}&key=${accessToken}`;
            const response = await axios_1.default.get(url);
            const subscriberCount = (_c = (_b = (_a = response.data.items) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.statistics) === null || _c === void 0 ? void 0 : _c.subscriberCount;
            return subscriberCount ? parseInt(subscriberCount) : null;
        }
        catch (error) {
            console.error(`Failed to fetch YouTube subscribers for ${platformId}:`, ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
            return null;
        }
    }
    /**
     * Fetch Twitter followers count
     */
    async fetchTwitterFollowers(platformId, accessToken) {
        var _a, _b, _c, _d;
        try {
            const url = `https://api.twitter.com/2/users/${platformId}?user.fields=public_metrics`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return (_c = (_b = (_a = response.data.data) === null || _a === void 0 ? void 0 : _a.public_metrics) === null || _b === void 0 ? void 0 : _b.followers_count) !== null && _c !== void 0 ? _c : null;
        }
        catch (error) {
            console.error(`Failed to fetch Twitter followers for ${platformId}:`, ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
            return null;
        }
    }
    /**
     * Fetch LinkedIn connections count
     */
    async fetchLinkedInConnections(platformId, accessToken) {
        var _a, _b;
        try {
            const url = `https://api.linkedin.com/v2/people/${platformId}?projection=(id,firstName,lastName,profilePicture,publicProfileUrl,localizedHeadline,numConnections)`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });
            return (_a = response.data.numConnections) !== null && _a !== void 0 ? _a : null;
        }
        catch (error) {
            console.error(`Failed to fetch LinkedIn connections for ${platformId}:`, ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            return null;
        }
    }
    /**
     * Send real-time updates to connected clients
     */
    sendRealTimeUpdates(results) {
        // Group results by user
        const updatesByUser = {};
        results.forEach(result => {
            // Find the user ID for this account
            SocialMedia_1.default.findOne({ username: result.username, platform: result.platform })
                .then(account => {
                if (account) {
                    const userId = account.userId.toString();
                    if (!updatesByUser[userId]) {
                        updatesByUser[userId] = [];
                    }
                    updatesByUser[userId].push(result);
                }
            })
                .catch(error => {
                console.error('Error finding user for real-time update:', error);
            });
        });
        // Send updates to each user
        Object.entries(updatesByUser).forEach(([userId, updates]) => {
            try {
                const io = (0, sockets_1.getIO)();
                io.to(`user_${userId}`).emit('social_media_update', {
                    timestamp: new Date(),
                    updates
                });
            }
            catch (error) {
                console.error('Error sending real-time update:', error);
            }
        });
    }
    /**
     * Manually trigger an update for a specific user
     */
    async updateUserAccounts(userId) {
        const accounts = await SocialMedia_1.default.find({
            userId,
            connected: true,
            accessToken: { $exists: true, $ne: null },
            platformId: { $exists: true, $ne: null }
        });
        const results = [];
        for (const account of accounts) {
            try {
                const result = await this.updateSingleAccount(account);
                results.push(result);
            }
            catch (error) {
                console.error(`Error updating ${account.platform} account for user ${userId}:`, error);
                results.push({
                    success: false,
                    platform: account.platform,
                    username: account.username,
                    oldCount: account.followerCount,
                    newCount: account.followerCount,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
    /**
     * Get update status
     */
    getStatus() {
        return {
            isRunning: !!this.updateInterval,
            isUpdating: this.isUpdating
        };
    }
}
exports.default = SocialMediaUpdateService;
