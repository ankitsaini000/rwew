import { IUser } from '../models/User';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User extends IUser {}

    // Ensure Request.user has all IUser properties
    interface Request {
      user?: IUser;
    }
  }
} 