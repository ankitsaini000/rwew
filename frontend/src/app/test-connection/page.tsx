'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Testing connection to backend...');
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Test the API root endpoint
        const response = await axios.get(API_URL.replace('/api', ''));
        console.log('API connection test response:', response.data);
        
        setStatus('success');
        setMessage('Successfully connected to backend API!');
        setResponse(response.data);
      } catch (error) {
        console.error('API connection test error:', error);
        setStatus('error');
        setMessage('Failed to connect to backend API');
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        API Connection Test
      </h1>
      
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${
            status === 'loading' ? 'bg-yellow-500' : 
            status === 'success' ? 'bg-green-500' : 
            'bg-red-500'
          }`}></div>
          <span className="font-medium">Status: {status}</span>
        </div>
        
        <p className="mb-4">{message}</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {response && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">API Response:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
              <pre className="text-xs">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">MongoDB Connection Information:</h3>
          <p>The backend is attempting to connect to MongoDB using the URI in your <code className="bg-gray-100 p-1 rounded">.env</code> file.</p>
          <p className="mt-2">Check the backend console for connection logs and any errors.</p>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/test-mongo" 
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go to MongoDB Test Form
          </a>
        </div>
      </div>
    </div>
  );
} 