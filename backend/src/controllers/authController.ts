import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { generateToken } from '../utils/tokenUtils';
import { getAuthIntent, clearAuthIntent } from '../middleware/authIntent';

// @desc    Facebook login handler
// @route   GET /api/auth/facebook, /api/auth/facebook/brand, /api/auth/facebook/creator
// @access  Public
export const facebookLogin = asyncHandler(async (req: Request, res: Response) => {
  // Log auth intent for debugging
  const authIntent = getAuthIntent(req);
  console.log(`Starting Facebook auth flow with intent: ${authIntent || 'generic'}`);
  
  const passport = req.app.get('passport');
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res);
});

// @desc    Facebook callback handler
// @route   GET /api/auth/facebook/callback
// @access  Public
export const facebookCallback = asyncHandler(async (req: Request, res: Response) => {
  // User is already authenticated by passport at this point
  const user = req.user as any;
  
  if (!user) {
    console.error('Facebook callback received with no user');
    res.status(401);
    throw new Error('Facebook authentication failed');
  }

  console.log(`Facebook authentication successful for user: ${user._id}, current role: ${user.role}`);

  // Check if there's a registration intent (brand or creator)
  const authIntent = getAuthIntent(req);
  console.log(`Auth intent from session: ${authIntent || 'none'}`);
  
  // Update user role based on registration intent if this is a new registration
  // or if the user is currently a client (default role)
  if (authIntent && (user.role === 'client' || user.isNew)) {
    const previousRole = user.role;
    user.role = authIntent;
    await user.save();
    console.log(`Updated user role from ${previousRole} to: ${authIntent}`);
  }
  
  // Clear the auth intent from session
  clearAuthIntent(req);

  // Generate JWT token
  const token = generateToken(user._id);
  console.log(`Generated JWT token for user: ${user._id}`);

  // Get the redirect URL based on the user's role
  let redirectPath = '/auth/facebook/success';
  if (user.role === 'brand') {
    redirectPath = '/brand/dashboard';
  } else if (user.role === 'creator') {
    redirectPath = '/creator/dashboard';
  }

  console.log(`Redirecting user to: ${redirectPath}`);

  // Set a cookie with the token for the frontend
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Add user info to the redirect URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectUrl = `${frontendUrl}${redirectPath}?token=${token}&userId=${user._id}&role=${user.role}`;
  
  // Redirect to the frontend with success
  res.redirect(redirectUrl);
}); 