import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

/**
 * Generate a JWT token
 * @param id User ID (can be string, ObjectId, or unknown)
 * @returns JWT token string
 */
export const generateToken = (id: string | Types.ObjectId) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'defaultsecret',
    { expiresIn: '30d' }
  );
};

// For CommonJS compatibility
module.exports = { generateToken }; 