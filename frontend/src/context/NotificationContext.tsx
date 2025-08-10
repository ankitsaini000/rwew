"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { initializeSocket, getSocket, disconnectSocket, joinUserRoom } from '../utils/socket';
import { Notification, NotificationContextType } from '../types/notification';

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    console.log('NotificationContext useEffect triggered:', { user: !!user, token: !!token });
    
    if (user && token) {
      console.log('User authenticated, initializing socket and fetching notifications');
      const socket = initializeSocket(token);
      
      // Join user's personal room
      joinUserRoom(user._id);

      // Listen for new notifications
      socket.on('newNotification', (data: { notification: Notification }) => {
        console.log('Received new notification:', data.notification);
        addNotification(data.notification);
        setUnreadCount(prev => prev + 1);
      });

      // Fetch initial notifications
      fetchNotifications();

      return () => {
        console.log('Cleaning up socket connection');
        disconnectSocket();
      };
    } else {
      console.log('User not authenticated, skipping initialization');
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    if (!token) {
      console.log('No token available, skipping fetchNotifications');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwew.onrender.com'}/api/notifications`;
      console.log('Fetching notifications from:', apiUrl);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Received data:', data);
      setNotifications(data.data || []);
      
      // Calculate unread count
      const unread = data.data?.filter((n: Notification) => !n.isRead).length || 0;
      setUnreadCount(unread);
      console.log('Set notifications:', data.data?.length || 0, 'unread:', unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwew.onrender.com'}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwew.onrender.com'}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const clearError = () => {
    setError(null);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};