"use client";

import { useState } from 'react';
import BrandVerificationForm from '@/components/brand-dashboard/BrandVerificationForm';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function BrandVerificationPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Redirect if not logged in or not a brand
  if (!loading && (!isAuthenticated || (user && user.role !== 'brand'))) {
    redirect('/login?redirect=/brand/verification');
  }

  const handleVerificationSuccess = () => {
    setVerificationSuccess(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Brand Verification</h1>
        
        {verificationSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Verification Request Submitted</h2>
            <p className="text-green-700">
              Your verification request has been submitted successfully. We'll review your information and get back to you within 1-3 business days.
            </p>
          </div>
        ) : null}
        
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Why Verify Your Brand?</h2>
            <ul className="list-disc list-inside text-blue-700 space-y-2">
              <li>Gain a verified badge that increases trust with creators</li>
              <li>Access to premium promotional features and priority support</li>
              <li>Higher visibility in creator searches</li>
              <li>Unlock advanced analytics and reporting tools</li>
            </ul>
          </div>
        </div>
        
        <BrandVerificationForm onSuccess={handleVerificationSuccess} />
      </div>
    </div>
  );
} 