'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const TestOrderPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createTestOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in first');
        return;
      }

      const response = await fetch('http://localhost:5001/api/orders/test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Test order created:', data.data);
        
        // Redirect to order-confirmation page with the test order
        const testUrl = data.data.testUrl;
        router.push(testUrl);
      } else {
        setError(data.error || 'Failed to create test order');
      }
    } catch (err) {
      console.error('Error creating test order:', err);
      setError('Failed to create test order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Order Creation</h1>
        <p className="text-gray-600 mb-6">
          This page creates a test order with proper creator info to test the order-confirmation page.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <button
          onClick={createTestOrder}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Creating Test Order...' : 'Create Test Order'}
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>This will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Create a test creator user</li>
            <li>Create a test order</li>
            <li>Create a test payment record</li>
            <li>Redirect to order-confirmation page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestOrderPage; 