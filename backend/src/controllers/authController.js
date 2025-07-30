const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

// @desc    Facebook login handler
// @route   GET /api/auth/facebook
// @access  Public
exports.facebookLogin = asyncHandler(async (req, res) => {
  const passport = req.app.get('passport');
  passport.authenticate('facebook', { scope: ['email'] })(req, res);
});

// @desc    Facebook callback handler
// @route   GET /api/auth/facebook/callback
// @access  Public
exports.facebookCallback = asyncHandler(async (req, res) => {
  // User is already authenticated by passport at this point
  const user = req.user;
  
  if (!user) {
    res.status(401);
    throw new Error('Facebook authentication failed');
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Set a cookie with the token for the frontend
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Redirect to the frontend with success
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/facebook/success?token=${token}`);
}); 