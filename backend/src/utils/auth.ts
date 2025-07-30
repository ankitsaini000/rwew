import { Request } from 'express';

/**
 * Gets the authenticated user ID from the request
 * Throws an error if user is not authenticated
 */
export const getAuthUserId = (req: Request): string => {
  if (!req.user || !req.user._id) {
    throw new Error('User not authenticated');
  }
  return req.user._id.toString();
};

/**
 * Returns true if the user has the specified role
 * Returns false if user is not authenticated or doesn't have the role
 */
export const hasRole = (req: Request, role: string): boolean => {
  return req.user?.role === role;
};

/**
 * Checks if the user has any of the specified roles
 * Returns false if user is not authenticated or doesn't have any of the roles
 */
export const hasAnyRole = (req: Request, roles: string[]): boolean => {
  if (!req.user || !req.user.role) return false;
  return roles.includes(req.user.role);
}; 