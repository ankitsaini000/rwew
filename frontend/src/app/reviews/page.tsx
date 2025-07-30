'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import CreatorReviews from '../../components/creator-dashboard/CreatorReviews';
import { Star, Award, TrendingUp } from 'lucide-react';
import { getCreatorReviews, getBrandReviews } from '../../services/api';
import BrandReviews from '../../components/brand-dashboard/BrandReviews';

type Review = {
  _id?: string;
  orderId: {
    _id: string;
    orderID: string;
    service: string;
  };
  creatorId: string;
  brandId: {
    _id: string;
    fullName: string;
    avatar?: string;
    username: string;
  };
  rating: number;
  comment: string;
  reply?: {
    text: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
        if (!userStr || !userRole) {
          setError('You must be logged in to view your reviews.');
          setReviews([]);
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        let data;
        if (userRole === 'creator') {
          data = await getCreatorReviews(user._id, 50);
          setReviews((data && data.data && data.data.reviews) ? data.data.reviews : []);
          setCreatorId(user._id);
        } else if (userRole === 'brand') {
          data = await getBrandReviews(50);
          setReviews((data && data.data && Array.isArray(data.data)) ? data.data : []);
          setCreatorId(null);
        } else {
          setError('Unsupported user role.');
          setReviews([]);
          setCreatorId(null);
        }
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-8 w-8 border-3 border-purple-600 rounded-full border-t-transparent"></div>
              <p className="text-gray-500 font-medium">Loading reviews...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">Unable to load reviews</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
              <p className="text-gray-600 mt-1">See and manage your reviews</p>
            </div>
          </div>
        </div>
        {creatorId ? (
          <CreatorReviews creatorId={creatorId} title="My Reviews" showAllLink={false} limit={50} showStats={true} />
        ) : (
          <BrandReviews />
        )}
      </div>
    </DashboardLayout>
  );
} 