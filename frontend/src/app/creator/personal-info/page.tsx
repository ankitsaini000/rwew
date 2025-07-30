'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonalInfoRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new path structure
    router.push('/creator-setup/personal-info');
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Redirecting to creator personal info page...</div>;
} 