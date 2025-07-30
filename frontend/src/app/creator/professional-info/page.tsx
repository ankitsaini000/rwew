'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfessionalInfoRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new path structure
    router.push('/creator-setup/professional-info');
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Redirecting to creator professional info page...</div>;
} 