import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/User';

interface JwtPayload {
  id: string;
}

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    userId: string;
    facebookId?: string;
    instagramConnected?: boolean;
    youtubeConnected?: boolean;
    socialMediaRedirect?: boolean;
    currentUserId?: string;
  }
}

// Middleware to check if user is authenticated via JWT or session
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First try JWT token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const user = await verifyToken(token);
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    // Try JWT token from query parameter (for browser redirects)
    const queryToken = req.query.token as string;
    if (queryToken) {
      const user = await verifyToken(queryToken);
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    // Fallback to session authentication
    if (req.session && req.session.userId) {
      // Try to find user by session ID
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }
    
    // If neither JWT nor session works, return error
    return res.status(401).json({ error: 'Not authenticated' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Not authenticated' });
  }
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    return null;
  }
};

// Protect routes (ensure user is authenticated)
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const user = await verifyToken(token);
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorize by role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not authorized to access this route`);
    }
    
    next();
  };
};

// Admin middleware
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
}; 