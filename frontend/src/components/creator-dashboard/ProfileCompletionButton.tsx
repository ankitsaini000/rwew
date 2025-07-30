'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface ProfileCompletionData {
  isComplete: boolean;
  completionPercentage: number;
}

export default function ProfileCompletionButton() {
  const [completionData, setCompletionData] = useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCompletionData();
  }, []);

  const fetchCompletionData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/creators/completion-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompletionData({
          isComplete: data.data.percentage === 100,
          completionPercentage: data.data.percentage
        });
      }
    } catch (error) {
      console.error('Error fetching completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    router.push('/creator-setup/personal-info');
  };

  if (loading) {
    return null;
  }

  // If profile is complete (100%), don't show the button
  if (completionData?.isComplete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
            <p className="text-sm text-gray-600">
              {completionData?.completionPercentage || 0}% complete - Complete your profile to get more opportunities
            </p>
          </div>
        </div>
        <button
          onClick={handleCompleteProfile}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          <span>Complete Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 