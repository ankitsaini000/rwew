import express from 'express';
import passport from 'passport';
import { facebookCallback, facebookLogin } from '../controllers/authController';
import { trackAuthIntent } from '../middleware/authIntent';

const router = express.Router();

// Facebook Auth Routes - Generic login
router.get('/facebook', facebookLogin);

// Facebook Auth for specific registration paths
router.get('/facebook/brand', trackAuthIntent('brand'), facebookLogin);
router.get('/facebook/creator', trackAuthIntent('creator'), facebookLogin);

// Facebook callback handler
router.get(
  '/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }), 
  facebookCallback
);

export default router; 