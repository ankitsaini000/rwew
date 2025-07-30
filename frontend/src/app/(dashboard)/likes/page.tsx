'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLikeStore, LikedCreator } from '@/store/likeStore';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Search, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function LikesPage() {
  const { likedCreators, removeLike } = useLikeStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Debug likes on mount
  useEffect(() => {
    console.log("LikesPage mounted, total liked creators:", likedCreators.length);
    
    // Check localStorage directly to debug potential issues
    const likesData = localStorage.getItem("liked-creators-storage");
    if (likesData) {
      try {
        const parsedData = JSON.parse(likesData);
        console.log("Likes from localStorage:", parsedData.state.likedCreators.length);
        console.log("Likes data:", parsedData.state.likedCreators);
      } catch (err) {
        console.error("Error parsing likes from localStorage:", err);
      }
    } else {
      console.log("No likes found in localStorage");
    }
  }, [likedCreators.length]);

  // Filter liked creators based on search term
  const filteredCreators = likedCreators.filter(creator => 
    creator.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.creatorCategory.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp); // Most recent first

  const handleRemoveLike = (creatorId: string) => {
    console.log(`Removing like for creator ${creatorId}`);
    removeLike(creatorId);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Liked Creators</h1>
            <p className="text-gray-600 mt-1">Manage your favorite creators</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search creators..."
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {likedCreators.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Liked Creators Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              When you like creators, they'll appear here for easy access to their profiles and services.
            </p>
            <Link 
              href="/creators" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Explore Creators
            </Link>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-600">No creators match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onRemove={() => handleRemoveLike(creator.creatorId)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

interface CreatorCardProps {
  creator: LikedCreator;
  onRemove: () => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onRemove }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img 
                src={creator.creatorAvatar}
                alt={creator.creatorName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{creator.creatorName}</h3>
              <p className="text-sm text-gray-500">{creator.creatorCategory}</p>
            </div>
          </div>
          <button 
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove from likes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Liked {formatDistanceToNow(creator.timestamp, { addSuffix: true })}
          </span>
          <Link 
            href={`/creator/${creator.creatorId}`}
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View Profile <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}; 