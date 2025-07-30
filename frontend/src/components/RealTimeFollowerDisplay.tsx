'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FollowerCount {
  username: string;
  followerCount: number;
  lastUpdated: string;
}

interface FollowerCounts {
  [platform: string]: FollowerCount;
}

interface SocialMediaUpdate {
  type: string;
  timestamp: string;
  updates: Array<{
    success: boolean;
    platform: string;
    username: string;
    oldCount: number;
    newCount: number;
    error?: string;
  }>;
}

const RealTimeFollowerDisplay: React.FC = () => {
  const [followerCounts, setFollowerCounts] = useState<FollowerCounts>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [socket, setSocket] = useState<any>(null);

  // Fetch initial follower counts
  const fetchFollowerCounts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/social-media/follower-counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowerCounts(data.data || {});
        setLastUpdate(new Date());
      } else {
        console.error('Failed to fetch follower counts');
      }
    } catch (error) {
      console.error('Error fetching follower counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manually trigger update
  const triggerUpdate = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to update follower counts');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/social-media/trigger-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Follower counts updated successfully!');
        
        // Refresh the counts after update
        await fetchFollowerCounts();
      } else {
        toast.error('Failed to update follower counts');
      }
    } catch (error) {
      console.error('Error triggering update:', error);
      toast.error('Failed to update follower counts');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001'}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected for real-time updates');
      // Send authentication
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data: SocialMediaUpdate = JSON.parse(event.data);
        
        if (data.type === 'social_media_update') {
          // Update follower counts with new data
          const updatedCounts = { ...followerCounts };
          
          data.updates.forEach(update => {
            if (update.success && update.newCount !== update.oldCount) {
              updatedCounts[update.platform] = {
                username: update.username,
                followerCount: update.newCount,
                lastUpdated: data.timestamp
              };
              
              // Show toast for significant changes
              const change = update.newCount - update.oldCount;
              if (Math.abs(change) >= 10) { // Only show for changes of 10+ followers
                const changeText = change > 0 ? `+${change.toLocaleString()}` : change.toLocaleString();
                toast.success(`${update.platform} followers: ${changeText}`, {
                  duration: 3000
                });
              }
            }
          });
          
          setFollowerCounts(updatedCounts);
          setLastUpdate(new Date(data.timestamp));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchFollowerCounts();
  }, []);

  // Format number with K/M suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get platform icon and color
  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return { color: 'text-pink-500', bg: 'bg-pink-50', name: 'Instagram' };
      case 'youtube':
        return { color: 'text-red-500', bg: 'bg-red-50', name: 'YouTube' };
      case 'twitter':
        return { color: 'text-blue-400', bg: 'bg-blue-50', name: 'Twitter' };
      case 'facebook':
        return { color: 'text-blue-600', bg: 'bg-blue-50', name: 'Facebook' };
      case 'linkedin':
        return { color: 'text-blue-700', bg: 'bg-blue-50', name: 'LinkedIn' };
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-50', name: platform };
    }
  };

  // Get change indicator
  const getChangeIndicator = (oldCount: number, newCount: number) => {
    const change = newCount - oldCount;
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (Object.keys(followerCounts).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <p>No connected social media accounts found.</p>
          <p className="text-sm mt-2">Connect your social media accounts to see real-time follower counts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Follower Counts</h3>
            <p className="text-sm text-gray-500">
              {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Never updated'}
            </p>
          </div>
          <button
            onClick={triggerUpdate}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>

      {/* Follower counts grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(followerCounts).map(([platform, data]) => {
            const platformInfo = getPlatformInfo(platform);
            
            return (
              <div
                key={platform}
                className={`p-4 rounded-lg border ${platformInfo.bg} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${platformInfo.color.replace('text-', 'bg-')} mr-2`}></div>
                    <span className="font-medium text-gray-900">{platformInfo.name}</span>
                  </div>
                  {getChangeIndicator(data.followerCount, data.followerCount)} {/* Placeholder for change indicator */}
                </div>
                
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.followerCount)}
                </div>
                
                <div className="text-sm text-gray-500 mt-1">
                  @{data.username}
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-update status */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Auto-updates every 5 minutes
          </span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-600">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeFollowerDisplay; 