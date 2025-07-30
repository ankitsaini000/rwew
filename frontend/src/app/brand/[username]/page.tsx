'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PublicBrandProfileView from '@/components/pages/profiles/PublicBrandProfileView';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function PublicBrandProfilePage({ params }: { params: { username: string } }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/brand-profiles/${params.username}`);
        setProfileData(response.data.data);
      } catch (err) {
        console.error('Error fetching brand profile:', err);
        setError('Failed to load brand profile');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProfile();
  }, [params.username]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <DashboardLayout>
      <PublicBrandProfileView profileData={profileData} />
    </DashboardLayout>
  );
}
