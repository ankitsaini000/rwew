import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User';

export const configurePassport = () => {
  // Serialize the user ID to the session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize the user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Configure Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID || '1373525770463712',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'd360afc169c7db24e270b7e9a5c6ff8b',
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5001/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'picture.type(large)', 'displayName', 'gender', 'birthday', 'link'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          console.log('Facebook authentication profile received:', {
            id: profile.id,
            emails: profile.emails,
            displayName: profile.displayName,
            photos: profile.photos?.length
          });
          
          // Extract profile info
          const profileEmail = profile.emails && profile.emails[0].value;
          if (!profileEmail) {
            return done(new Error('No email found in Facebook profile'), null);
          }

          // Look for existing user with this Facebook ID or email
          let user = await User.findOne({
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
            profileUrl: profile.profileUrl || profile._json?.link,
            lastUpdated: new Date()
          };

          if (user) {
            // Update the user's Facebook ID if not already set
            if (!user.facebookId) {
              user.facebookId = profile.id;
              user.loginMethod = 'facebook';
              
              // If profile has an image and user doesn't, update it
              if (profile.photos?.[0]?.value && !user.avatar) {
                user.avatar = profile.photos[0].value;
              }
              
              // Update or add Facebook profile information
              if (!user.socialProfiles) {
                user.socialProfiles = { facebook: facebookProfile };
              } else {
                user.socialProfiles.facebook = facebookProfile;
              }
              
              // Update last login timestamp
              user.lastLogin = new Date();
              
              await user.save();
              console.log('Updated existing user with Facebook ID:', user._id);
            } else {
              // User already has Facebook connected, just update the profile
              if (!user.socialProfiles) {
                user.socialProfiles = { facebook: facebookProfile };
              } else {
                user.socialProfiles.facebook = facebookProfile;
              }
              
              // Update last login timestamp
              user.lastLogin = new Date();
              
              await user.save();
              console.log('Updated existing Facebook profile for user:', user._id);
            }
          } else {
            // Create a new user with Facebook data
            isNewUser = true;
            
            // Format the name properly
            const fullName = profile.displayName || 
              `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
              
            // Generate a username from email or name
            const usernameBase = profileEmail.split('@')[0] || 
              fullName.toLowerCase().replace(/\s+/g, '');
            const username = `${usernameBase}_${Math.floor(Math.random() * 1000)}`;
            
            user = await User.create({
              email: profileEmail,
              fullName: fullName,
              username: username,
              facebookId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
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
          (user as any).isNew = isNewUser;

          return done(null, user);
        } catch (err) {
          console.error('Facebook authentication error:', err);
          return done(err, null);
        }
      }
    )
  );

  return passport;
}; 