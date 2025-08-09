'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaFacebook } from 'react-icons/fa';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
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
    
    if (!identifier || !password) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[LoginPage] Calling AuthContext login function');
      await login(identifier, password);
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
          err.message.includes('Invalid email/username') ||
          err.message.includes('Authentication failed') ||
          err.message.includes('Please check your email and password'))) {
        setError("Wrong email/username or password. Please try again.");
      }
      // Specific handling for network-related errors
      else if (err.message && (
          err.message.includes('Failed to fetch') || 
          err.message.includes('Network Error') ||
          err.code === 'ERR_NETWORK' || 
          err.code === 'ERR_CONNECTION_REFUSED')) {
        setError("Cannot connect to the server. Please make sure the backend server is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Wrong email/username or password. Please try again.");
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-120 h-120 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="glass-morphism max-w-md w-full space-y-6 p-5 sm:p-6 md:p-8 animate-fadeIn relative z-10 mx-4 sm:mx-auto">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-50 backdrop-blur-sm bg-opacity-70 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Email or Username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="glass-input appearance-none relative block w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="glass-input appearance-none relative block w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-base"
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
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="group relative w-full flex items-center justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Continue with Facebook
            </button>
          </div>
          
          <div className="text-center">
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}