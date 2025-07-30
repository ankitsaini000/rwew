'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialMediaRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new path structure
    router.push('/creator-setup/social-media');
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Redirecting to creator social media page...</div>;
} 