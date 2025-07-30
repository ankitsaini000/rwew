'use client';

import React, { useState, useEffect } from 'react';
import API from '@/services/api';

export default function TestMessageEndpoint() {
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state for test-send
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('Test message content');
  const [senderEmail, setSenderEmail] = useState('');
  const [testSendResult, setTestSendResult] = useState<any>(null);
  const [testSendError, setTestSendError] = useState<string | null>(null);
  const [testSendLoading, setTestSendLoading] = useState(false);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing message endpoint: /messages/test');
      const response = await API.get('/messages/test');
      console.log('Response:', response.data);
      setTestResult(response.data);
    } catch (err: any) {
      console.error('Error testing message endpoint:', err);
      setError(err.message || 'Failed to connect to message endpoint');
    } finally {
      setLoading(false);
    }
  };
  
  const testSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSendLoading(true);
    setTestSendError(null);
    setTestSendResult(null);
    
    try {
      console.log('Testing send message endpoint: /messages/test-send');
      console.log('Data:', { receiverId, content, senderEmail });
      
      const response = await API.post('/messages/test-send', {
        receiverId,
        content,
        senderEmail: senderEmail || undefined
      });
      
      console.log('Response:', response.data);
      setTestSendResult(response.data);
    } catch (err: any) {
      console.error('Error testing send message endpoint:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send test message';
      setTestSendError(errorMessage);
      
      setTestSendResult({
        error: true,
        message: errorMessage,
        details: err.response?.data || err.toString()
      });
    } finally {
      setTestSendLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Message Endpoint</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test connectivity section */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test Connectivity</h2>
          <p className="mb-4 text-gray-600">
            Tests if the message API endpoints are reachable. This endpoint doesn't require authentication.
          </p>
          
          <div className="mb-6">
            <button 
              onClick={testEndpoint}
              disabled={loading}
              className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              {loading ? 'Testing...' : 'Test Endpoint Connection'}
            </button>
          </div>
          
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-300 rounded text-red-700">
              <h3 className="font-semibold mb-2">Error:</h3>
              <p>{error}</p>
            </div>
          )}
          
          {testResult && (
            <div className="p-4 bg-green-50 border border-green-300 rounded">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Test sending section */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test Sending Message</h2>
          <p className="mb-4 text-gray-600">
            Tests sending a message without authentication. This is for debugging only.
          </p>
          
          <form onSubmit={testSendMessage} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Receiver ID:</label>
              <input
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                placeholder="MongoDB ObjectId of recipient"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Message Content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded p-2 text-sm h-20"
                placeholder="Enter message content"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Sender Email (optional):</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                placeholder="Email of sender (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, the system will try to find this user as the sender
              </p>
            </div>
            
            <button
              type="submit"
              disabled={testSendLoading}
              className={`px-4 py-2 rounded ${testSendLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {testSendLoading ? 'Sending...' : 'Send Test Message'}
            </button>
          </form>
          
          {testSendError && (
            <div className="p-4 mt-4 bg-red-50 border border-red-300 rounded text-red-700">
              <h3 className="font-semibold mb-2">Error:</h3>
              <p>{testSendError}</p>
            </div>
          )}
          
          {testSendResult && !testSendError && (
            <div className="p-4 mt-4 bg-green-50 border border-green-300 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-white p-3 rounded border overflow-auto text-xs">
                {JSON.stringify(testSendResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border rounded">
        <h2 className="text-xl font-semibold mb-4">Message API Debug Information</h2>
        
        <h3 className="font-medium mb-2">API Routes</h3>
        <ul className="list-disc pl-5 mb-4">
          <li><code className="bg-gray-100 px-1">GET /api/messages/test</code> - Test endpoint (no auth required)</li>
          <li><code className="bg-gray-100 px-1">POST /api/messages/test-send</code> - Test sending (no auth required)</li>
          <li><code className="bg-gray-100 px-1">POST /api/messages</code> - Send a message (auth required)</li>
          <li><code className="bg-gray-100 px-1">GET /api/messages/conversations</code> - Get user conversations</li>
          <li><code className="bg-gray-100 px-1">GET /api/messages/:userId</code> - Get conversation with a user</li>
          <li><code className="bg-gray-100 px-1">PUT /api/messages/:messageId/read</code> - Mark message as read</li>
        </ul>
      </div>
    </div>
  );
} 