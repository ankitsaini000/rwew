"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPublishedCreators } from '../../services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, Star, Users, Globe, CheckCircle } from 'lucide-react';
import CreatorsList from "../../components/CreatorsList";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreators() {
      try {
        setLoading(true);
        const response = await getPublishedCreators();
        if (response && response.data) {
          setCreators(response.data);
        } else {
          setError("No creators found");
        }
      } catch (err) {
        console.error("Error fetching creators:", err);
        setError("Failed to load creators");
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, []);

  const filters = [
    { id: 'all', label: 'All Creators', icon: Users },
    { id: 'topRated', label: 'Top Rated', icon: Star },
    { id: 'fashion', label: 'Fashion', icon: CheckCircle },
    { id: 'technology', label: 'Technology', icon: CheckCircle },
    { id: 'travel', label: 'Travel', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Discover Creative Professionals</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-700 mb-4">No Creators Found</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-gray-600">Please check back later or explore different categories.</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center p-8 bg-yellow-50 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">No Creators Yet</h2>
            <p className="text-gray-700">There are no creators available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="bg-green-100 p-3 text-center mb-8 rounded-lg">
              <p className="text-green-800 font-medium">Creators Found: {creators.length} creators available</p>
            </div>
            <CreatorsList />
          </>
        )}
      </div>
    </div>
  );
} 