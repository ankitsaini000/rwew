"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookInstagramCallback = exports.facebookInstagramAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
// Scopes needed for Facebook Instagram Graph API access
const INSTAGRAM_SCOPES = ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'];
/**
 * @route   GET /api/social-media/facebook-instagram-auth
 * @desc    Initiates Facebook authentication flow with Instagram permissions
 * @access  Private - User must be logged in
 */
const facebookInstagramAuth = (req, res) => {
    try {
        // Store intended redirect target for after auth
        if (req.query.redirect) {
            req.session.instagramRedirect = req.query.redirect;
        }
        // Set additional scopes for Instagram access
        const authOptions = {
            scope: ['email', 'public_profile', ...INSTAGRAM_SCOPES]
        };
        // Start Facebook authentication flow with Instagram permissions
        passport_1.default.authenticate('facebook', authOptions)(req, res);
    }
    catch (err) {
        console.error('Error initiating Facebook Instagram auth:', err);
        res.status(500).json({ message: 'Authentication failed to initialize' });
    }
};
exports.facebookInstagramAuth = facebookInstagramAuth;
/**
 * @route   GET /api/social-media/facebook-instagram/callback
 * @desc    Callback handler for Facebook with Instagram permissions
 * @access  Public - Called by Facebook OAuth
 */
const facebookInstagramCallback = async (req, res, next) => {
    try {
        // Authenticate using passport
        passport_1.default.authenticate('facebook', { session: false }, async (err, user, info) => {
            var _a;
            if (err || !user) {
                console.error('Facebook Instagram auth error:', err || 'No user returned');
                return res.redirect('/creator-setup/social-media?error=auth_failed');
            }
            try {
                // Check if we have a valid access token from Facebook
                const fbAccessToken = ((_a = user.facebook) === null || _a === void 0 ? void 0 : _a.accessToken) || (info === null || info === void 0 ? void 0 : info.accessToken);
                if (!fbAccessToken) {
                    console.error('No Facebook access token available');
                    return res.redirect('/creator-setup/social-media?error=no_access_token');
                }
                // First, get the user's Facebook pages
                const pagesResponse = await axios_1.default.get(`https://graph.facebook.com/v18.0/me/accounts`, { params: { access_token: fbAccessToken } });
                if (!pagesResponse.data || !pagesResponse.data.data || pagesResponse.data.data.length === 0) {
                    console.error('No Facebook pages found for user');
                    return res.redirect('/creator-setup/social-media?error=no_pages');
                }
                // Get the first page (or let user choose in a more sophisticated implementation)
                const page = pagesResponse.data.data[0];
                const pageId = page.id;
                const pageAccessToken = page.access_token;
                // Next, get the Instagram Business Account connected to this page
                const instagramResponse = await axios_1.default.get(`https://graph.facebook.com/v18.0/${pageId}`, {
                    params: {
                        fields: 'instagram_business_account',
                        access_token: pageAccessToken
                    }
                });
                if (!instagramResponse.data || !instagramResponse.data.instagram_business_account) {
                    console.error('No Instagram business account connected to Facebook page');
                    return res.redirect('/creator-setup/social-media?error=no_instagram_account');
                }
                const instagramAccountId = instagramResponse.data.instagram_business_account.id;
                // Get Instagram account info
                const instagramInfoResponse = await axios_1.default.get(`https://graph.facebook.com/v18.0/${instagramAccountId}`, {
                    params: {
                        fields: 'username,followers_count,profile_picture_url,name,biography,website',
                        access_token: pageAccessToken
                    }
                });
                if (!instagramInfoResponse.data) {
                    console.error('Failed to retrieve Instagram account information');
                    return res.redirect('/creator-setup/social-media?error=instagram_info_failed');
                }
                const instagramData = instagramInfoResponse.data;
                // Save the Instagram data to user profile
                await User_1.default.findByIdAndUpdate(user._id, {
                    socialMedia: Object.assign(Object.assign({}, user.socialMedia), { instagram: {
                            username: instagramData.username,
                            connected: true,
                            followersCount: instagramData.followers_count || 0,
                            pageId,
                            instagramBusinessAccountId: instagramAccountId,
                            pageAccessToken,
                            lastUpdated: new Date()
                        } })
                });
                // Store the Instagram data in localStorage via javascript
                const redirectUrl = '/creator-setup/social-media?connected=true';
                const instagramDataForClient = {
                    username: instagramData.username,
                    followerCount: instagramData.followers_count || 0,
                    profilePicture: instagramData.profile_picture_url,
                    connected: true
                };
                // Return an HTML page that sets localStorage and redirects
                res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Instagram Connected</title>
            <script>
              localStorage.setItem('instagramData', JSON.stringify(${JSON.stringify(instagramDataForClient)}));
              window.location.href = "${redirectUrl}";
            </script>
          </head>
          <body>
            <h1>Instagram Successfully Connected!</h1>
            <p>Redirecting back to your profile...</p>
          </body>
          </html>
        `);
            }
            catch (error) {
                console.error('Error in Instagram data processing:', error);
                res.redirect('/creator-setup/social-media?error=instagram_processing_failed');
            }
        })(req, res, next);
    }
    catch (err) {
        console.error('Uncaught error in Facebook Instagram callback:', err);
        res.redirect('/creator-setup/social-media?error=server_error');
    }
};
exports.facebookInstagramCallback = facebookInstagramCallback;
