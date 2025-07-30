"use client";

import React, { useEffect } from 'react';
import { useCreatorStore } from '@/store/creatorStore';
import CreatorCard from '@/components/creator/CreatorCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const LikedCreatorsPage = () => {
  const { likedCreators, fetchLikedCreators, isLoading, error } = useCreatorStore();
  const router = useRouter();

  useEffect(() => {
    // Get the token from localStorage to check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Redirect if not authenticated
    if (!token) {
      router.push('/login?callbackUrl=/liked-creators');
      return;
    }

    // Fetch liked creators when the component mounts
    console.log('Fetching liked creators...');
    fetchLikedCreators()
      .then(() => console.log('Liked creators fetched successfully'))
      .catch(err => console.error('Error fetching liked creators:', err));
  }, [fetchLikedCreators, router]);

  // Debug: Log the current state of liked creators
  useEffect(() => {
    console.log('Current liked creators state:', { count: likedCreators.length, likedCreators });
  }, [likedCreators]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse flex flex-col">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 h-80 rounded-xl"></div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <p className="font-semibold">Error loading liked creators:</p>
          <p>{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={() => fetchLikedCreators()}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!likedCreators || likedCreators.length === 0) {
      return (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">No liked creators yet</h2>
          <p className="mt-2 text-gray-500">
            You haven't liked any creators yet. Explore creators and click the heart icon to add them to your likes.
          </p>
          <Link
            href="/find-creators"
            className="mt-6 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Explore Creators
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedCreators.map((creator) => {
          // Debug: Log each creator data
          console.log('Rendering creator card:', creator);
          
          return (
            <CreatorCard
              key={creator.id}
              id={creator.id}
              username={creator.username}
              fullName={creator.name}
              avatar={creator.avatar}
              categories={creator.categories || (creator.category ? [creator.category] : [])}
              level={creator.level}
              description={creator.description}
              rating={creator.rating}
              reviewCount={creator.reviews}
              startingPrice={creator.startingPrice}
              isLiked={true}
              socialMedia={creator.socialMedia}
            />
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Liked Creators</h1>
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default LikedCreatorsPage; 