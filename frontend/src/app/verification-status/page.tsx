'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function VerificationStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) {
      setLoading(false);
      return;
    }

    const urlStatus = searchParams.get('status');
    const urlMessage = searchParams.get('message');
    const urlType = searchParams.get('type');

    if (urlStatus) {
      setStatus(urlStatus);
      if (urlStatus === 'success') {
        setMessage(urlMessage || `Your ${urlType || 'account'} has been successfully verified!`);
      } else {
        setMessage(urlMessage || 'There was an error during verification.');
      }
    } else {
      setMessage('No verification status found.');
    }
    setLoading(false);
  }, [searchParams]);

  const handleDashboardClick = () => {
    router.push('/brand-dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="ml-2 text-gray-700">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        {status === 'success' ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <h1 className={`text-2xl font-bold mb-3 ${status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
          {status === 'success' ? 'Verification Successful!' : 'Verification Failed'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="mt-8">
          <button
            onClick={handleDashboardClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Verification Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerificationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <VerificationStatusContent />
    </Suspense>
  );
}