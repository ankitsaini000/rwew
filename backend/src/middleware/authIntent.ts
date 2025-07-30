import { Request, Response, NextFunction } from 'express';
import { SessionData } from 'express-session';

// Extend the SessionData type to include our custom properties
declare module 'express-session' {
  interface SessionData {
    authIntent?: 'brand' | 'creator';
  }
}

/**
 * Middleware to track user authentication intent (for brand or creator registration)
 * Stores the intent in session to be used during the authentication callback
 */
export const trackAuthIntent = (intent: 'brand' | 'creator') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store intent in session
    req.session.authIntent = intent;
    
    // For debugging
    console.log(`Auth intent set to: ${intent}`);
    
    next();
  };
};

/**
 * Get the stored auth intent from session
 */
export const getAuthIntent = (req: Request): 'brand' | 'creator' | undefined => {
  return req.session.authIntent;
};

/**
 * Clear the auth intent from session
 */
export const clearAuthIntent = (req: Request): void => {
  delete req.session.authIntent;
}; 