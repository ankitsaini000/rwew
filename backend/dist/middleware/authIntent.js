"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthIntent = exports.getAuthIntent = exports.trackAuthIntent = void 0;
/**
 * Middleware to track user authentication intent (for brand or creator registration)
 * Stores the intent in session to be used during the authentication callback
 */
const trackAuthIntent = (intent) => {
    return (req, res, next) => {
        // Store intent in session
        req.session.authIntent = intent;
        // For debugging
        console.log(`Auth intent set to: ${intent}`);
        next();
    };
};
exports.trackAuthIntent = trackAuthIntent;
/**
 * Get the stored auth intent from session
 */
const getAuthIntent = (req) => {
    return req.session.authIntent;
};
exports.getAuthIntent = getAuthIntent;
/**
 * Clear the auth intent from session
 */
const clearAuthIntent = (req) => {
    delete req.session.authIntent;
};
exports.clearAuthIntent = clearAuthIntent;
