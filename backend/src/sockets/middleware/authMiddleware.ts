import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../models/User';
import { AuthenticatedSocket, IUserSocket } from '../../types/socket';

export const socketAuth = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Get token from handshake query or auth header
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret') as any;
    
    if (!decoded || !decoded.id) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Find user
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Create simplified user object for socket
    const socketUser: IUserSocket = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || undefined,
      role: user.role
    };

    // Attach user to socket
    socket.user = socketUser;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
}; 