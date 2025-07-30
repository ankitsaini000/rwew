import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getAuthUserId, hasRole, hasAnyRole } from '../utils/auth';

/**
 * Example controller showing best practices for handling authenticated users
 */

// Pattern 1: Using the utility function
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    // This will throw if user is not authenticated
    const userId = getAuthUserId(req);
    
    // Safe to use userId after this point
    res.json({
      userId,
      userRole: req.user?.role || 'unknown',
      isAdmin: hasRole(req, 'admin')
    });
  } catch (error) {
    res.status(401);
    throw new Error('User not authenticated');
  }
});

// Pattern 2: Using null checks and optional chaining
export const checkUserPermissions = asyncHandler(async (req: Request, res: Response) => {
  // Early return if user is not authenticated
  if (!req.user) {
    res.status(401);
    throw new Error('User not authenticated');
  }
  
  // Safe to use req.user after this point
  const { _id, role } = req.user;
  
  res.json({
    userId: _id.toString(),
    userRole: role,
    canAccessAdminArea: role === 'admin',
    canAccessCreatorArea: hasAnyRole(req, ['admin', 'creator'])
  });
});

// Pattern 3: Using optional chaining throughout
export const getBasicInfo = asyncHandler(async (req: Request, res: Response) => {
  // Use optional chaining to safely access properties
  const userId = req.user?._id?.toString();
  const userRole = req.user?.role;
  
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }
  
  res.json({
    userId,
    userRole: userRole || 'unknown'
  });
}); 