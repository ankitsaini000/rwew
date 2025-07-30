"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '../../components/NotificationDropdown';

export default function TestNotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [testMessage, setTestMessage] = useState('');
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to test notifications</h1>
          <p className="text-gray-600">You need to be authenticated to see notifications.</p>
        </div>
      </div>
    );
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Always redirect to /messages for message notifications
    if (notification.type === 'message') {
      router.push('/messages');
    } else if (notification.type === 'order') {
      // Redirect based on user role
      if (user?.role === 'brand') {
        router.push('/brand-dashboard');
      } else if (user?.role === 'creator') {
        router.push('/creator-dashboard');
      } else {
        // Fallback to general dashboard
        router.push('/dashboard');
      }
    } else if (notification.type === 'quote_request') {
      // Redirect based on user role for quote requests
      if (user?.role === 'brand') {
        router.push('/brand-dashboard');
      } else if (user?.role === 'creator') {
        router.push('/creator-dashboard');
      } else {
        // Fallback to general dashboard
        router.push('/dashboard');
      }
    } else if (notification.type === 'promotion') {
      router.push('/available-promotions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notification System Test</h1>
            <NotificationDropdown />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Stats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Notification Stats</h2>
              <div className="space-y-2">
                <p className="text-blue-800">
                  <span className="font-medium">Total Notifications:</span> {notifications.length}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Unread Count:</span> {unreadCount}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">User ID:</span> {user?._id}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-green-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={markAllAsRead}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark All as Read
                </button>
                <p className="text-sm text-green-700">
                  Click the notification bell to see notifications in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Notifications</h2>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Send a message to another user to trigger a notification
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {notification.fromUser?.fullName || 'System'}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-700">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">How to Test</h2>
          <div className="space-y-2 text-yellow-800">
            <p>1. Open another browser window/tab and log in as a different user</p>
            <p>2. Send a message to this user (you can use the chat feature)</p>
            <p>3. You should see a real-time notification appear in the bell icon</p>
            <p>4. Click on notifications to mark them as read</p>
          </div>
        </div>
      </div>
    </div>
  );
} 