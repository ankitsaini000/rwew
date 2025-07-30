import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/notifications - Get all notifications for user
router.get('/', getNotifications);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

export default router; 