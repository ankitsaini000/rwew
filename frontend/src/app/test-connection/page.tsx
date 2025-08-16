'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [socketStatus, setSocketStatus] = useState<string>('Testing...');
  const socket = useSocket();

  useEffect(() => {
    // Test API connection
    testApiConnection();
    
    // Test socket connection
    if (socket) {
      setSocketStatus('✅ Socket connected');
    } else {
      setSocketStatus('❌ Socket not connected');
    }
  }, [socket]);

  const testApiConnection = async () => {
    try {
      const response = await fetch('https://rwew.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus('✅ API connection successful');
      } else {
        setApiStatus(`❌ API connection failed: ${response.status}`);
      }
    } catch (error) {
      setApiStatus(`❌ API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testSocketConnection = () => {
    if (socket?.connected) {
      setConnectionStatus('✅ Socket connection successful');
    } else {
      setConnectionStatus('❌ Socket connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Connection Test Page</h1>
        
        <div className="grid gap-6">
          {/* API Connection Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Connection Test</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`text-sm ${apiStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {apiStatus}
              </span>
            </div>
            <button
              onClick={testApiConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test API Connection
            </button>
          </div>

          {/* Socket Connection Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Socket Connection Test</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`text-sm ${socketStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {socketStatus}
              </span>
            </div>
            <button
              onClick={testSocketConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Test Socket Connection
            </button>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Connection Status</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`text-sm ${connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus}
              </span>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</p>
              <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwew.onrender.com'}</p>
              <p><strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'https://rwew.onrender.com'}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 