'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  
  // Prevent navigation to login page if already authenticated
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (
      isAuthenticated &&
      user &&
      (userRole === 'creator' || userRole === 'brand') &&
      (user.role === 'creator' || user.role === 'brand') &&
      typeof window !== 'undefined'
    ) {
      if (userRole === 'creator') {
        router.push('/creator-dashboard');
      } else if (userRole === 'brand') {
        router.push('/brand-dashboard');
      }
    }
    // Check for Facebook auth error
    const fbError = searchParams?.get('error');
    if (fbError === 'facebook_auth_failed') {
      setError('Facebook authentication failed. Please try again or use email login.');
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[LoginPage] Calling AuthContext login function');
      await login(email, password);
      console.log('[LoginPage] Login successful, checking role for redirect');
      
      // Only redirect if login was successful
      // Force a slight delay to allow state updates to complete
      setTimeout(() => {
        // Redirection based on role in localStorage
        const userRole = localStorage.getItem('userRole');
        console.log('[LoginPage] userRole from localStorage:', userRole);
        console.log('[LoginPage] user object from AuthContext:', user);
        
        if (userRole === 'creator') {
          console.log('[LoginPage] Redirecting to creator dashboard');
          router.push('/creator-dashboard');
        } else if (userRole === 'brand') {
          console.log('[LoginPage] Redirecting to brand dashboard');
          router.push('/brand-dashboard');
        } else {
          // If role is not set, check the user object from AuthContext
          if (user && user.role) {
            console.log('[LoginPage] Using user.role from AuthContext:', user.role);
            if (user.role === 'creator') {
              router.push('/creator-dashboard');
            } else if (user.role === 'brand') {
              router.push('/brand-dashboard');
            } else {
              // Default fallback
              router.push('/dashboard');
            }
          } else {
            // Default fallback
            console.log('[LoginPage] No role found, redirecting to dashboard');
            router.push('/dashboard');
          }
        }
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Specific handling for wrong credentials
      if (err.message && (
          err.message.includes('Invalid credentials') ||
          err.message.includes('Wrong password') ||
          err.message.includes('User not found') ||
          err.message.includes('Invalid email') ||
          err.message.includes('Authentication failed') ||
          err.message.includes('Please check your email and password'))) {
        setError("Wrong email or password. Please try again.");
      }
      // Specific handling for network-related errors
      else if (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('Network Error') ||
          err.code === 'ERR_NETWORK' || 
          err.code === 'ERR_CONNECTION_REFUSED')) {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Wrong email or password. Please try again.");
      }
      
      // Don't redirect on any error - stay on login page
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/facebook';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="group relative w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2]"
            >
              <FaFacebook className="h-5 w-5 mr-2" />
              Continue with Facebook
            </button>
          </div>
          
          <div className="text-center">
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
} 