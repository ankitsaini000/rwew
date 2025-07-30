"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_facebook_1 = require("passport-facebook");
const User_1 = __importDefault(require("../models/User"));
const configurePassport = () => {
    // Serialize the user ID to the session
    passport_1.default.serializeUser((user, done) => {
        done(null, user._id);
    });
    // Deserialize the user from the session
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await User_1.default.findById(id);
            done(null, user);
        }
        catch (err) {
            done(err, null);
        }
    });
    // Configure Facebook Strategy
    passport_1.default.use(new passport_facebook_1.Strategy({
        clientID: process.env.FACEBOOK_APP_ID || '1373525770463712',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'd360afc169c7db24e270b7e9a5c6ff8b',
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5001/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'picture.type(large)', 'displayName', 'gender', 'birthday', 'link'],
    }, async (accessToken, refreshToken, profile, done) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            console.log('Facebook authentication profile received:', {
                id: profile.id,
                emails: profile.emails,
                displayName: profile.displayName,
                photos: (_a = profile.photos) === null || _a === void 0 ? void 0 : _a.length
            });
            // Extract profile info
            const profileEmail = profile.emails && profile.emails[0].value;
            if (!profileEmail) {
                return done(new Error('No email found in Facebook profile'), null);
            }
            // Look for existing user with this Facebook ID or email
            let user = await User_1.default.findOne({
                $or: [
                    { facebookId: profile.id },
                    { email: profileEmail }
                ]
            });
            let isNewUser = false;
            // Prepare social profile data
            const facebookProfile = {
                id: profile.id,
                name: profile.displayName,
                email: profileEmail,
                profileUrl: profile.profileUrl || ((_b = profile._json) === null || _b === void 0 ? void 0 : _b.link),
                lastUpdated: new Date()
            };
            if (user) {
                // Update the user's Facebook ID if not already set
                if (!user.facebookId) {
                    user.facebookId = profile.id;
                    user.loginMethod = 'facebook';
                    // If profile has an image and user doesn't, update it
                    if (((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) && !user.avatar) {
                        user.avatar = profile.photos[0].value;
                    }
                    // Update or add Facebook profile information
                    if (!user.socialProfiles) {
                        user.socialProfiles = { facebook: facebookProfile };
                    }
                    else {
                        user.socialProfiles.facebook = facebookProfile;
                    }
                    // Update last login timestamp
                    user.lastLogin = new Date();
                    await user.save();
                    console.log('Updated existing user with Facebook ID:', user._id);
                }
                else {
                    // User already has Facebook connected, just update the profile
                    if (!user.socialProfiles) {
                        user.socialProfiles = { facebook: facebookProfile };
                    }
                    else {
                        user.socialProfiles.facebook = facebookProfile;
                    }
                    // Update last login timestamp
                    user.lastLogin = new Date();
                    await user.save();
                    console.log('Updated existing Facebook profile for user:', user._id);
                }
            }
            else {
                // Create a new user with Facebook data
                isNewUser = true;
                // Format the name properly
                const fullName = profile.displayName ||
                    `${((_e = profile.name) === null || _e === void 0 ? void 0 : _e.givenName) || ''} ${((_f = profile.name) === null || _f === void 0 ? void 0 : _f.familyName) || ''}`.trim();
                // Generate a username from email or name
                const usernameBase = profileEmail.split('@')[0] ||
                    fullName.toLowerCase().replace(/\s+/g, '');
                const username = `${usernameBase}_${Math.floor(Math.random() * 1000)}`;
                user = await User_1.default.create({
                    email: profileEmail,
                    fullName: fullName,
                    username: username,
                    facebookId: profile.id,
                    avatar: ((_h = (_g = profile.photos) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.value) || null,
                    passwordHash: Math.random().toString(36).slice(-16), // Random password
                    isVerified: true, // Facebook users are verified by default
                    loginMethod: 'facebook',
                    socialProfiles: { facebook: facebookProfile },
                    lastLogin: new Date()
                    // Role will be set by the controller based on the auth intent
                    // Default role is 'client'
                });
                console.log('Created new user from Facebook profile:', user._id);
            }
            // Attach a flag to indicate if this is a new user
            user.isNew = isNewUser;
            return done(null, user);
        }
        catch (err) {
            console.error('Facebook authentication error:', err);
            return done(err, null);
        }
    }));
    return passport_1.default;
};
exports.configurePassport = configurePassport;
