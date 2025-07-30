import React from 'react';
import CreatorCard from './CreatorCard';
import { CreatorCardData } from '@/types/creator';
import { FaFilter } from 'react-icons/fa';

interface CreatorGridProps {
  creators: CreatorCardData[];
  onToggleLike?: (id: string) => void;
  isLoading?: boolean;
  showFilters?: boolean;
}

const CreatorGrid: React.FC<CreatorGridProps> = ({ 
  creators, 
  onToggleLike, 
  isLoading = false,
  showFilters = false 
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No creators found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {creators.length} creators
          </div>
          <button className="flex items-center text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <FaFilter className="mr-2" size={12} />
            <span>Filter</span>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {creators.map((creator) => (
          <CreatorCard 
            key={creator.id} 
            creator={creator} 
            onToggleLike={onToggleLike} 
          />
        ))}
      </div>
    </div>
  );
};

export default CreatorGrid; 