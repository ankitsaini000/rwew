'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the first step of the onboarding process with a new creator-setup prefix
    router.push('/creator-setup/personal-info');
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Redirecting to creator onboarding...</div>;
} 