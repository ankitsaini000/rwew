import axios from 'axios';
import SocialMediaAccount from '../models/SocialMedia';
import User from '../models/User';
import { getIO } from '../sockets';
import { CreatorProfile } from '../models/CreatorProfile';

interface PlatformUpdateResult {
  success: boolean;
  platform: string;
  username: string;
  oldCount: number;
  newCount: number;
  error?: string;
}

// Helper to update CreatorProfile social followers/subscribers/connections
export async function updateCreatorProfileSocialFollowers(userId: any, platform: string, count: number, username: string) {
  if (!userId) return;
  let update: any = {};
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
  await CreatorProfile.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true }
  );
}

class SocialMediaUpdateService {
  private static instance: SocialMediaUpdateService;
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;

  public static getInstance(): SocialMediaUpdateService {
    if (!SocialMediaUpdateService.instance) {
      SocialMediaUpdateService.instance = new SocialMediaUpdateService();
    }
    return SocialMediaUpdateService.instance;
  }

  /**
   * Start the automatic update service
   */
  public startAutoUpdate(): void {
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
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Stopped social media auto-update service');
    }
  }

  /**
   * Update all connected social media accounts
   */
  public async updateAllSocialMediaAccounts(): Promise<void> {
    if (this.isUpdating) {
      console.log('⚠️ Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    console.log('🔄 Starting social media update cycle...');

    try {
      // Get all connected social media accounts
      const accounts = await SocialMediaAccount.find({
        connected: true,
        accessToken: { $exists: true, $ne: null },
        platformId: { $exists: true, $ne: null }
      });

      console.log(`📊 Found ${accounts.length} connected social media accounts to update`);

      const results: PlatformUpdateResult[] = [];

      // Update each account
      for (const account of accounts) {
        try {
          const result = await this.updateSingleAccount(account);
          results.push(result);
        } catch (error) {
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
    } catch (error) {
      console.error('❌ Error in social media update cycle:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update a single social media account
   */
  private async updateSingleAccount(account: any): Promise<PlatformUpdateResult> {
    const { platform, platformId, accessToken, username, followerCount: oldCount, userId } = account;

    console.log(`🔄 Updating ${platform} account: @${username}`);

    let newCount: number;

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
    } else {
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
  private async fetchInstagramFollowers(platformId: string, accessToken: string): Promise<number | null> {
    try {
      const url = `https://graph.facebook.com/v19.0/${platformId}?fields=followers_count&access_token=${accessToken}`;
      const response = await axios.get(url);
      return response.data.followers_count ?? null;
    } catch (error: any) {
      console.error(`Failed to fetch Instagram followers for ${platformId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Fetch Facebook followers count
   */
  private async fetchFacebookFollowers(platformId: string, accessToken: string): Promise<number | null> {
    try {
      const url = `https://graph.facebook.com/v19.0/${platformId}?fields=followers_count&access_token=${accessToken}`;
      const response = await axios.get(url);
      return response.data.followers_count ?? null;
    } catch (error: any) {
      console.error(`Failed to fetch Facebook followers for ${platformId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Fetch YouTube subscribers count
   */
  private async fetchYouTubeSubscribers(platformId: string, accessToken: string): Promise<number | null> {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${platformId}&key=${accessToken}`;
      const response = await axios.get(url);
      const subscriberCount = response.data.items?.[0]?.statistics?.subscriberCount;
      return subscriberCount ? parseInt(subscriberCount) : null;
    } catch (error: any) {
      console.error(`Failed to fetch YouTube subscribers for ${platformId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Fetch Twitter followers count
   */
  private async fetchTwitterFollowers(platformId: string, accessToken: string): Promise<number | null> {
    try {
      const url = `https://api.twitter.com/2/users/${platformId}?user.fields=public_metrics`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data.data?.public_metrics?.followers_count ?? null;
    } catch (error: any) {
      console.error(`Failed to fetch Twitter followers for ${platformId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Fetch LinkedIn connections count
   */
  private async fetchLinkedInConnections(platformId: string, accessToken: string): Promise<number | null> {
    try {
      const url = `https://api.linkedin.com/v2/people/${platformId}?projection=(id,firstName,lastName,profilePicture,publicProfileUrl,localizedHeadline,numConnections)`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      return response.data.numConnections ?? null;
    } catch (error: any) {
      console.error(`Failed to fetch LinkedIn connections for ${platformId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Send real-time updates to connected clients
   */
  private sendRealTimeUpdates(results: PlatformUpdateResult[]): void {
    // Group results by user
    const updatesByUser: { [userId: string]: PlatformUpdateResult[] } = {};

    results.forEach(result => {
      // Find the user ID for this account
      SocialMediaAccount.findOne({ username: result.username, platform: result.platform })
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
        const io = getIO();
        io.to(`user_${userId}`).emit('social_media_update', {
          timestamp: new Date(),
          updates
        });
      } catch (error) {
        console.error('Error sending real-time update:', error);
      }
    });
  }

  /**
   * Manually trigger an update for a specific user
   */
  public async updateUserAccounts(userId: string): Promise<PlatformUpdateResult[]> {
    const accounts = await SocialMediaAccount.find({
      userId,
      connected: true,
      accessToken: { $exists: true, $ne: null },
      platformId: { $exists: true, $ne: null }
    });

    const results: PlatformUpdateResult[] = [];

    for (const account of accounts) {
      try {
        const result = await this.updateSingleAccount(account);
        results.push(result);
      } catch (error) {
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
  public getStatus(): { isRunning: boolean; isUpdating: boolean; lastUpdate?: Date } {
    return {
      isRunning: !!this.updateInterval,
      isUpdating: this.isUpdating
    };
  }
}export default SocialMediaUpdateService; 

