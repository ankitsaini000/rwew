import express from 'express';
import axios from 'axios';
import SocialMediaAccount from '../models/SocialMedia';
import User from '../models/User';
import { isAuthenticated } from '../middleware/auth';
import { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier, getCodeVerifier } from '../utils/pkce';
import { updateCreatorProfileSocialFollowers } from '../services/socialMediaUpdateService';

const router = express.Router();

// Facebook App credentials - use environment variables or fallback to hardcoded values (for demo)
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "1373525770463712";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "d360afc169c7db24e270b7e9a5c6ff8b";

// YouTube OAuth credentials
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || "736836177928-j5u2t6i1qdj9r6se292fp6arf8pd89h5.apps.googleusercontent.com";
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "RLjgKLDXajn5GA0Ui0NpWXuW0xcDQHGgv4x-V_CVXK4RCpWxbq";

// Twitter OAuth credentials
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || "OG5adEx4Y1FrNmh4SG15bWF0UkY6MTpjaQ";
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || "yYFZklP4A72hjsJuHN1369j0PqwSnvfnk0uybvk0_vgkB-cxEE";

// Helper to get frontend URL
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

// Add this helper function at the top of the file:
async function checkDuplicateSocialAccount(platform: string, platformId: string, userId: any) {
  if (!platform || !platformId) return false;
  const existing = await SocialMediaAccount.findOne({ platform, platformId });
  return existing && existing.userId.toString() !== userId.toString();
}

// Facebook authentication endpoint
router.get('/facebook-instagram-auth', isAuthenticated, (req, res) => {
  // Save session info for the callback
  if (req.session) {
    req.session.socialMediaRedirect = true;
    req.session.currentUserId = req.user._id.toString(); // Store current user ID
  }
  
  // The scope includes the permissions needed to access Instagram data
  const scope = [
    'email',
    'pages_show_list',
    'business_management',
    'instagram_basic',
    'instagram_manage_insights',
    'pages_read_engagement'
  ];
  
  // Redirect to Facebook OAuth with user ID in state parameter
  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/facebook/callback`;
  const state = req.user._id; // Pass user ID through state parameter
  
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope.join(',')}&response_type=code&state=${state}`;
  
  console.log('Initiating Facebook auth for user:', req.user._id);
  res.redirect(authUrl);
});

// Facebook authentication callback
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=auth_failed`);
    }
    
    // Extract user ID from state parameter
    const userId = state;
    console.log('Received callback with user ID from state:', userId);
    
    // Exchange code for access token
    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/facebook/callback`;
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;
    
    const tokenResponse = await axios.get(tokenUrl);
    const { access_token: accessToken } = tokenResponse.data;
    
    if (!accessToken) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_access_token`);
    }
    
    // Get user info from Facebook
    const userInfoResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
    const { id: facebookId, name, email } = userInfoResponse.data;
    
    // 1. Get user's Facebook pages
    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    
    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_pages`);
    }
    
    // Use the first page
    const page = pagesResponse.data.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    
    // 2. Get Instagram Business Account connected to this page
    const instagramResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );
    
    if (!instagramResponse.data.instagram_business_account) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_instagram_account`);
    }
    
    const instagramAccountId = instagramResponse.data.instagram_business_account.id;
    
    // 3. Get Instagram account details including username and follower count
    const instagramInfoResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${pageAccessToken}`
    );
    
    if (!instagramInfoResponse.data) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=instagram_info_failed`);
    }
    
    const instagramData = instagramInfoResponse.data;
    
    // 4. Find user using the ID from state parameter
    let user;
    
    // Use the user ID from the state parameter (most reliable)
    if (userId) {
      user = await User.findById(userId);
      console.log('Found user from state parameter:', user?._id);
    }
    
    // Fallback to session if state parameter fails
    if (!user && req.session && req.session.currentUserId) {
      user = await User.findById(req.session.currentUserId);
      console.log('Found user from session:', user?._id);
    }
    
    // Final fallback to email lookup (least reliable)
    if (!user && email) {
      user = await User.findOne({ email });
      console.log('Found user from email lookup:', user?._id);
    }
    
    if (!user) {
      console.log('No user found - redirecting to error page');
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=user_not_found`);
    }
    
    console.log('Using user for social media account creation:', user._id, user.email);
    
    // Before calling findOneAndUpdate, add:
    if (await checkDuplicateSocialAccount('facebook', facebookId, user._id)) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=facebook_account_already_connected`);
    }
    
    // 5. Store Facebook account data
    await SocialMediaAccount.findOneAndUpdate(
      { platform: 'facebook', platformId: facebookId },
      {
        userId: user._id,
        platform: 'facebook',
        username: name,
        platformId: facebookId,
        accessToken: accessToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        connected: true,
        lastUpdated: new Date(),
        metadata: {
          pageId,
          pageName: page.name
        }
      },
      { upsert: true, new: true }
    );
    await updateCreatorProfileSocialFollowers(user._id, 'facebook', 0, name); // Facebook follower count not fetched here
    
    // 6. Store Instagram account data
    if (await checkDuplicateSocialAccount('instagram', instagramAccountId, user._id)) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=instagram_account_already_connected`);
    }
    await SocialMediaAccount.findOneAndUpdate(
      { platform: 'instagram', platformId: instagramAccountId },
      {
        userId: user._id,
        platform: 'instagram',
        username: instagramData.username,
        followerCount: instagramData.followers_count || 0,
        platformId: instagramAccountId,
        accessToken: pageAccessToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        connected: true,
        lastUpdated: new Date(),
        metadata: {
          profilePictureUrl: instagramData.profile_picture_url,
          mediaCount: instagramData.media_count,
          facebookPageId: pageId
        }
      },
      { upsert: true, new: true }
    );
    await updateCreatorProfileSocialFollowers(user._id, 'instagram', instagramData.followers_count || 0, instagramData.username);
    
    // 7. Store Instagram data in client-side storage for seamless UX
    const clientSideData = {
      username: instagramData.username,
      followerCount: instagramData.followers_count || 0,
      profilePictureUrl: instagramData.profile_picture_url,
      mediaCount: instagramData.media_count,
      connected: true
    };
    
    // Add session data
    if (req.session) {
      req.session.facebookId = facebookId;
      req.session.instagramConnected = true;
    }
    
    // Instead of using inline script which violates CSP, redirect with data in URL to frontend
    const encodedData = encodeURIComponent(JSON.stringify(clientSideData));
    return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?instagramData=${encodedData}&success=true`);
  } catch (error) {
    console.error('Facebook/Instagram auth error:', error);
    return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=server_error`);
  }
});

// YouTube authentication endpoint
router.get('/youtube-auth', isAuthenticated, (req, res) => {
  // Save session info for the callback
  if (req.session) {
    req.session.socialMediaRedirect = true;
    req.session.currentUserId = req.user._id.toString(); // Store current user ID
  }
  
  // The scope includes the permissions needed to access YouTube data
  const scope = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ];
  
  // Redirect to YouTube OAuth with user ID in state parameter
  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/youtube/callback`;
  const state = req.user._id; // Pass user ID through state parameter
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${YOUTUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope.join(' ')}&response_type=code&state=${state}&access_type=offline&prompt=consent`;
  
  console.log('Initiating YouTube auth for user:', req.user._id);
  res.redirect(authUrl);
});

// YouTube authentication callback
router.get('/youtube/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=auth_failed`);
    }
    
    // Extract user ID from state parameter
    const userId = state;
    console.log('Received YouTube callback with user ID from state:', userId);
    
    // Exchange code for access token
    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/youtube/callback`;
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    const tokenResponse = await axios.post(tokenUrl, {
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });
    
    const { access_token: accessToken, refresh_token: refreshToken } = tokenResponse.data;
    
    if (!accessToken) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_access_token`);
    }
    
    // Get YouTube channel information
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_youtube_channel`);
    }
    
    const channel = channelResponse.data.items[0];
    const channelId = channel.id;
    const channelData = channel.snippet;
    const statistics = channel.statistics;
    
    // Find user using the ID from state parameter
    let user;
    
    // Use the user ID from the state parameter (most reliable)
    if (userId) {
      user = await User.findById(userId);
      console.log('Found user from state parameter:', user?._id);
    }
    
    // Fallback to session if state parameter fails
    if (!user && req.session && req.session.currentUserId) {
      user = await User.findById(req.session.currentUserId);
      console.log('Found user from session:', user?._id);
    }
    
    if (!user) {
      console.log('No user found - redirecting to error page');
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=user_not_found`);
    }
    
    console.log('Using user for YouTube account creation:', user._id, user.email);
    
    // Before calling findOneAndUpdate, add:
    if (await checkDuplicateSocialAccount('youtube', channelId, user._id)) {
      return res.status(400).json({ message: 'This social account is already connected to another user.' });
    }
    
    // Store YouTube account data
    await SocialMediaAccount.findOneAndUpdate(
      { platform: 'youtube', platformId: channelId },
      {
        userId: user._id,
        platform: 'youtube',
        username: channelData.title,
        followerCount: parseInt(statistics.subscriberCount) || 0,
        platformId: channelId,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        connected: true,
        lastUpdated: new Date(),
        metadata: {
          channelId,
          channelTitle: channelData.title,
          channelDescription: channelData.description,
          channelThumbnail: channelData.thumbnails?.default?.url,
          videoCount: parseInt(statistics.videoCount) || 0,
          viewCount: parseInt(statistics.viewCount) || 0
        }
      },
      { upsert: true, new: true }
    );
    await updateCreatorProfileSocialFollowers(user._id, 'youtube', parseInt(statistics.subscriberCount) || 0, channelData.title);
    
    // Store YouTube data in client-side storage for seamless UX
    const clientSideData = {
      username: channelData.title,
      channelId: channelId,
      subscriberCount: parseInt(statistics.subscriberCount) || 0,
      videoCount: parseInt(statistics.videoCount) || 0,
      viewCount: parseInt(statistics.viewCount) || 0,
      channelThumbnail: channelData.thumbnails?.default?.url,
      connected: true
    };
    
    // Add session data
    if (req.session) {
      req.session.youtubeConnected = true;
    }
    
    // Redirect with data in URL to frontend
    const encodedData = encodeURIComponent(JSON.stringify(clientSideData));
    return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?youtubeData=${encodedData}&success=true`);
  } catch (error) {
    console.error('YouTube auth error:', error);
    return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=server_error`);
  }
});

// Twitter authentication endpoint
router.get('/twitter-auth', isAuthenticated, (req, res) => {
  // Save session info for the callback
  if (req.session) {
    req.session.socialMediaRedirect = true;
    req.session.currentUserId = req.user._id.toString(); // Store current user ID
  }
  
  // The scope includes the permissions needed to access Twitter data
  const scope = [
    'tweet.read',
    'users.read',
    'follows.read'
  ];
  
  // Redirect to Twitter OAuth with user ID in state parameter
  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/twitter/callback`;
  const state = req.user._id; // Pass user ID through state parameter
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Store code verifier in session
  if (req.session) {
    storeCodeVerifier(req.session, codeVerifier);
  }
  
  const authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope.join(' ')}&response_type=code&state=${state}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  
  console.log('Initiating Twitter auth for user:', req.user._id);
  res.redirect(authUrl);
});

// Twitter authentication callback
router.get('/twitter/callback', async (req, res) => {
  try {
    let { code, state } = req.query;
    if (Array.isArray(code)) code = code[0];
    if (Array.isArray(state)) state = state[0];
    if (typeof code !== 'string' || typeof state !== 'string') {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=auth_failed`);
    }
    
    // Extract user ID from state parameter
    const userId = state;
    console.log('Received Twitter callback with user ID from state:', userId);
    
    // Exchange code for access token
    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/social-media/twitter/callback`;
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    
    const codeVerifier = getCodeVerifier(req.session);
    if (!codeVerifier) {
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_code_verifier`);
    }
    
    // Step 1: Prepare Client Credentials
    const clientId = "OG5adEx4Y1FrNmh4SG15bWF0UkY6MTpjaQ";
    const clientSecret = "RLjgKLDXajn5GA0Ui0NpWXuW0xcDQHGgv4x-V_CVXK4RCpWxbq";
    
    // Step 2: Base64 Encode Your Credentials
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    // Step 3: Update Axios Request with Authorization Header (Critical Step)
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', codeVerifier);
    
    console.log('🚩 Step 1: Attempting Twitter OAuth token exchange...');
    console.log('Request URL:', tokenUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('Code verifier exists:', !!codeVerifier);
    
    let accessToken: string;
    let refreshToken: string;
    
    try {
      const tokenResponse = await axios.post(
        tokenUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,  // ✅ THIS LINE IS ESSENTIAL
          },
        }
      );

      console.log("✅ Twitter OAuth response clearly:", JSON.stringify(tokenResponse.data, null, 2));
      
      const responseData = tokenResponse.data;
      accessToken = responseData.access_token;
      refreshToken = responseData.refresh_token;
      
      if (!accessToken) {
        console.error('❌ No access token received from Twitter');
        return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_access_token`);
      }
      
      console.log('✅ Access token received successfully');
      
    } catch (error: any) {
      console.error("⚠️ Twitter OAuth Axios Error:", error.response?.data || error.message);
      console.error("⚠️ Error status:", error.response?.status);
      console.error("⚠️ Error headers:", error.response?.headers);
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=oauth_failed`);
    }
    
    // 🚩 Step 2: Verify User Information Retrieval from Twitter
    console.log('🚩 Step 2: Fetching Twitter user information...');
    console.log('Using access token:', accessToken ? '✅ Present' : '❌ Missing');
    
    let userResponse: any;
    
    try {
      userResponse = await axios.get(
        'https://api.twitter.com/2/users/me?user.fields=id,username,name,profile_image_url,public_metrics',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log("✅ Twitter user info:", JSON.stringify(userResponse.data, null, 2));
      
      if (!userResponse.data.data) {
        console.error('❌ No Twitter user data received');
        return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=no_twitter_account`);
      }
      
      console.log('✅ Twitter user data received successfully');
      
    } catch (error: any) {
      console.error("⚠️ Twitter user info fetch error:", error.response?.data || error.message);
      console.error("⚠️ Error status:", error.response?.status);
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=user_info_failed`);
    }
    
    const twitterUser = userResponse.data.data;
    const twitterUserId = twitterUser.id;
    const username = twitterUser.username;
    const name = twitterUser.name;
    const profileImageUrl = twitterUser.profile_image_url;
    const publicMetrics = twitterUser.public_metrics;
    
    // Find user using the ID from state parameter
    let user;
    
    // Use the user ID from the state parameter (most reliable)
    if (userId) {
      user = await User.findById(userId);
      console.log('Found user from state parameter:', user?._id);
    }
    
    // Fallback to session if state parameter fails
    if (!user && req.session && req.session.currentUserId) {
      user = await User.findById(req.session.currentUserId);
      console.log('Found user from session:', user?._id);
    }
    
    if (!user) {
      console.log('No user found - redirecting to error page');
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=user_not_found`);
    }
    
    console.log('Using user for Twitter account creation:', user._id, user.email);
    
    // Before calling findOneAndUpdate, add:
    if (await checkDuplicateSocialAccount('twitter', twitterUserId, user._id)) {
      // Redirect to frontend with error message
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=twitter_account_already_connected`);
    }
    
    // 🚩 Step 3: Ensure User Info is Clearly Saved in Database
    console.log('🚩 Step 3: Saving Twitter data to database...');
    console.log('Twitter user data to save:', {
      userId: user._id,
      platform: 'twitter',
      username: username,
      followerCount: publicMetrics.followers_count || 0,
      platformId: twitterUserId,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });
    
    try {
      const savedAccount = await SocialMediaAccount.findOneAndUpdate(
        { platform: 'twitter', platformId: twitterUserId },
        {
          userId: user._id,
          platform: 'twitter',
          username: username,
          followerCount: publicMetrics.followers_count || 0,
          platformId: twitterUserId,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          connected: true,
          lastUpdated: new Date(),
          metadata: {
            twitterId: userId,
            displayName: name,
            profileImageUrl: profileImageUrl,
            followingCount: publicMetrics.following_count || 0,
            tweetCount: publicMetrics.tweet_count || 0,
            listedCount: publicMetrics.listed_count || 0
          }
        },
        { upsert: true, new: true }
      );
      await updateCreatorProfileSocialFollowers(user._id, 'twitter', publicMetrics.followers_count || 0, username);
      
      console.log("✅ Twitter info saved to DB successfully:", savedAccount._id);
      
      // --- Update CreatorProfile with Twitter data ---
      const { CreatorProfile } = require('../models/CreatorProfile');
      try {
        await CreatorProfile.findOneAndUpdate(
          { userId: user._id },
          {
            $set: {
              'socialMedia.socialProfiles.twitter.handle': username,
              'socialMedia.socialProfiles.twitter.followers': publicMetrics.followers_count || 0,
              'socialMedia.socialProfiles.twitter.url': `https://twitter.com/${username}`
            }
          },
          { upsert: true }
        );
        // Fetch and log the updated Twitter data for verification
        const updatedProfile = await CreatorProfile.findOne({ userId: user._id });
        if (updatedProfile) {
          console.log('[DEBUG] Updated CreatorProfile Twitter:', updatedProfile.socialMedia?.socialProfiles?.twitter);
        } else {
          console.log('[DEBUG] CreatorProfile not found after update');
        }
      } catch (err) {
        console.error('❌ Failed to update CreatorProfile with Twitter info:', (err as any).message || err);
      }
      
    } catch (error: any) {
      console.error("⚠️ Database save error:", error.message);
      return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=database_save_failed`);
    }
    
    // 🚩 Step 4: Verify Frontend Integration
    console.log('🚩 Step 4: Preparing frontend redirect...');
    
    // Store Twitter data in client-side storage for seamless UX
    const clientSideData = {
      username: username,
      displayName: name,
      followerCount: publicMetrics.followers_count || 0,
      followingCount: publicMetrics.following_count || 0,
      tweetCount: publicMetrics.tweet_count || 0,
      profileImageUrl: profileImageUrl,
      connected: true
    };
    
    console.log('Client-side data to send:', clientSideData);
    
    // Add session data
    if (req.session) {
      (req.session as any).twitterConnected = true;
      console.log('✅ Session updated with Twitter connection');
    }
    
    // Redirect with data in URL to frontend
    const encodedData = encodeURIComponent(JSON.stringify(clientSideData));
    const redirectUrl = `${getFrontendUrl()}/creator-setup/social-media?twitterData=${encodedData}&success=true`;
    
    console.log('✅ Redirecting to frontend:', redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Twitter auth error:', error);
    return res.redirect(`${getFrontendUrl()}/creator-setup/social-media?error=server_error`);
  }
});

// Get user's connected social media accounts
router.get('/accounts', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const accounts = await SocialMediaAccount.find({ userId });
    
    return res.status(200).json({ accounts });
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    return res.status(500).json({ error: 'Failed to fetch social media accounts' });
  }
});

// Disconnect a social media account
router.delete('/accounts/:platform', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { platform } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    await SocialMediaAccount.findOneAndDelete({ userId, platform });
    
    return res.status(200).json({ message: `${platform} account disconnected successfully` });
  } catch (error) {
    console.error(`Error disconnecting ${req.params.platform} account:`, error);
    return res.status(500).json({ error: `Failed to disconnect ${req.params.platform} account` });
  }
});

// Manually update social media details (for platforms without API integration)
router.post('/manual-update', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { platform, platformId, username, url, followerCount } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!platform || !platformId || !username) {
      return res.status(400).json({ error: 'Platform, platformId, and username are required' });
    }
    
    // Before calling findOneAndUpdate, add:
    if (await checkDuplicateSocialAccount(platform, platformId, userId)) {
      return res.status(400).json({ message: 'This social account is already connected to another user.' });
    }
    
    const updatedAccount = await SocialMediaAccount.findOneAndUpdate(
      { platform, platformId },
      {
        userId,
        platform,
        username,
        url,
        followerCount: parseInt(followerCount) || 0,
        platformId,
        connected: false,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return res.status(200).json({ account: updatedAccount });
  } catch (error) {
    console.error('Error updating social media account:', error);
    return res.status(500).json({ error: 'Failed to update social media account' });
  }
});

// Get social media update service status
router.get('/update-status', isAuthenticated, (req, res) => {
  try {
    const SocialMediaUpdateService = require('../services/socialMediaUpdateService').default;
    const service = SocialMediaUpdateService.getInstance();
    const status = service.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting update status:', error);
    res.status(500).json({ error: 'Failed to get update status' });
  }
});

// Manually trigger update for current user
router.post('/trigger-update', isAuthenticated, async (req, res) => {
  try {
    const SocialMediaUpdateService = require('../services/socialMediaUpdateService').default;
    const service = SocialMediaUpdateService.getInstance();
    
    const results = await service.updateUserAccounts(req.user._id);
    
    res.json({
      success: true,
      data: {
        message: 'Update triggered successfully',
        results
      }
    });
  } catch (error) {
    console.error('Error triggering update:', error);
    res.status(500).json({ error: 'Failed to trigger update' });
  }
});

// Start auto-update service (admin only)
router.post('/start-auto-update', isAuthenticated, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const SocialMediaUpdateService = require('../services/socialMediaUpdateService').default;
    const service = SocialMediaUpdateService.getInstance();
    service.startAutoUpdate();
    
    res.json({
      success: true,
      message: 'Auto-update service started'
    });
  } catch (error) {
    console.error('Error starting auto-update:', error);
    res.status(500).json({ error: 'Failed to start auto-update' });
  }
});

// Stop auto-update service (admin only)
router.post('/stop-auto-update', isAuthenticated, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const SocialMediaUpdateService = require('../services/socialMediaUpdateService').default;
    const service = SocialMediaUpdateService.getInstance();
    service.stopAutoUpdate();
    
    res.json({
      success: true,
      message: 'Auto-update service stopped'
    });
  } catch (error) {
    console.error('Error stopping auto-update:', error);
    res.status(500).json({ error: 'Failed to stop auto-update' });
  }
});

// Get real-time follower counts for current user
router.get('/follower-counts', isAuthenticated, async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find({
      userId: req.user._id,
      connected: true
    }).select('platform username followerCount lastUpdated');
    
    const followerCounts = accounts.reduce((acc, account) => {
      acc[account.platform] = {
        username: account.username,
        followerCount: account.followerCount,
        lastUpdated: account.lastUpdated
      };
      return acc;
    }, {} as any);
    
    res.json({
      success: true,
      data: followerCounts
    });
  } catch (error) {
    console.error('Error getting follower counts:', error);
    res.status(500).json({ error: 'Failed to get follower counts' });
  }
});

// Admin search/export endpoint for social accounts
router.get('/search', async (req, res) => {
  try {
    const { userId, platform, platformId, format } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;
    if (platform) query.platform = platform;
    if (platformId) query.platformId = platformId;
    const accounts = await SocialMediaAccount.find(query).lean();
    if (format === 'csv') {
      // Export as CSV
      const { Parser } = require('json2csv');
      const fields = ['_id', 'userId', 'platform', 'platformId', 'username', 'connected', 'followerCount', 'createdAt', 'updatedAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(accounts);
      res.header('Content-Type', 'text/csv');
      res.attachment('social_accounts_export.csv');
      return res.send(csv);
    }
    // Default: return JSON
    res.json({ count: accounts.length, accounts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search/export social accounts' });
  }
});

export default router; 