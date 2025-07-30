'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfileCreationRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Wait a small delay to avoid immediate redirects
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        router.push('/profile-creation/basic-info');
      } else {
        router.push('/login?callback=/profile-creation/basic-info');
      }
    }
  }, [isAuthenticated, isInitialized, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
} 