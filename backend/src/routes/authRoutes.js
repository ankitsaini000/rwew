const express = require('express');
const passport = require('passport');
const { facebookCallback, facebookLogin } = require('../controllers/authController');

const router = express.Router();

// Facebook Auth Routes
router.get('/facebook', facebookLogin);
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), facebookCallback);

module.exports = router; 