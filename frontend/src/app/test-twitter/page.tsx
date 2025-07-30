'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';

export default function TestTwitterPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleTwitterConnect = () => {
    setIsConnecting(true);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first to connect your Twitter account');
      setIsConnecting(false);
      return;
    }
    
    // Redirect to Twitter auth
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const authUrl = `${apiBaseUrl}/api/social-media/twitter-auth?token=${encodeURIComponent(token)}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Twitter Connection</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            This page tests the Twitter OAuth connection functionality.
          </p>
          
          <Button
            onClick={handleTwitterConnect}
            disabled={isConnecting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isConnecting ? 'Connecting...' : 'Connect Twitter Account'}
          </Button>
          
          <div className="text-sm text-gray-500 text-center">
            <p>Make sure you have:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Logged in to the application</li>
              <li>Valid Twitter API credentials configured</li>
              <li>Backend server running</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 