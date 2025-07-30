'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function FacebookAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const { isAuthenticated, handleFacebookToken } = useAuth();

  useEffect(() => {
    const handleFacebookLogin = async () => {
      try {
        if (token) {
          // Handle the Facebook token through AuthContext
          await handleFacebookToken(token);
          
          // Get user role and redirect accordingly
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'creator') {
            router.push('/creator-dashboard');
          } else {
            router.push('/brand-dashboard');
          }
        } else {
          // No token found
          router.push('/login?error=facebook_auth_failed');
        }
      } catch (error) {
        console.error('Error during Facebook login:', error);
        router.push('/login?error=facebook_auth_failed');
      }
    };

    if (token && !isAuthenticated) {
      handleFacebookLogin();
    } else if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'creator') {
        router.push('/creator-dashboard');
      } else {
        router.push('/brand-dashboard');
      }
    }
  }, [token, router, isAuthenticated, handleFacebookToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Processing Facebook Login</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Please wait while we complete your Facebook login...
        </p>
      </div>
    </div>
  );
} 