'use client';

import React, { useState, useEffect } from 'react';
import { sendMessageToCreator } from '@/services/api';
import { toast } from 'react-hot-toast';
import API from '@/services/api';
import Link from 'next/link';

export default function TestMessagePage() {
  const [receiverId, setReceiverId] = useState(''); // New test user ID
  const [subject, setSubject] = useState('Test Message');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInfo, setAuthInfo] = useState<any>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Get auth information for debugging
    try {
      const user = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      setAuthInfo({
        token: token ? `${token.substring(0, 10)}...` : null,
        user: user ? JSON.parse(user) : null,
        userRole,
        isAuthenticated: !!token
      });
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to send messages.');
      return;
    }
    
    if (!receiverId) {
      toast.error('Please enter a valid receiver ID');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setIsSending(true);
    setResult(null);
    
    try {
      // Get the current user's email from auth info
      const currentUserEmail = authInfo?.user?.email;
      
      if (!currentUserEmail) {
        throw new Error('No sender email found. Please make sure you are logged in.');
      }
      
      console.log('Sending message with data:', {
        receiverId,
        content,
        subject,
        senderEmail: currentUserEmail,
        authInfo: {
          isAuthenticated: authInfo?.isAuthenticated,
          userRole: authInfo?.userRole,
          hasToken: !!authInfo?.token
        }
      });
      
      const response = await sendMessageToCreator({
        receiverId,
        content,
        subject,
        senderEmail: currentUserEmail
      });
      
      console.log('Message send response:', response);
      setResult(response);
      
      if (response.success) {
        toast.success('Message sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      setResult({
        error: true,
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Message Page</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Authentication Status:</h2>
        <pre className="text-sm">
          {JSON.stringify(authInfo, null, 2)}
        </pre>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Receiver ID (required):</label>
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter the receiver's user ID"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Using test user ID: {receiverId}
          </p>
        </div>
        
        <div>
          <label className="block mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter message subject"
          />
        </div>
        
        <div>
          <label className="block mb-1">Message Content (required):</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2 h-32"
            placeholder="Type your message here..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSending || !isAuthenticated}
          className={`px-4 py-2 rounded ${
            !isAuthenticated ? 'bg-gray-400' :
            isSending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium`}
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      
      {/* Result Display */}
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 