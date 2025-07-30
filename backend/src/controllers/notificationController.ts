import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification';

// Get all notifications for the logged-in user
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const notifications = await Notification.find({ user: userId })
    .populate('fromUser', 'fullName username avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  // Transform notifications to include conversationId as string
  const transformedNotifications = notifications.map(notification => {
    const notificationObj = notification.toObject();
    if (notificationObj.conversationId) {
      (notificationObj as any).conversationId = notificationObj.conversationId.toString();
    }
    return notificationObj;
  });

  res.status(200).json({
    success: true,
    data: transformedNotifications
  });
});

// Mark a notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { id } = req.params;
  
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  ).populate('fromUser', 'fullName username avatar');

  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// Mark all notifications as read for a user
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: `Marked ${result.modifiedCount} notifications as read`
  });
});

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const count = await Notification.countDocuments({ 
    user: userId, 
    isRead: false 
  });

  res.status(200).json({
    success: true,
    count
  });
}); 