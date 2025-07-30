import React from 'react';
import { ContentItem } from '../../types/profiles';

interface ContentGridProps {
  items: ContentItem[];
  emptyMessage: string;
  isLoading: boolean;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  emptyMessage, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">Loading content...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {item.thumbnailUrl || item.imageUrl ? (
            <div className="aspect-video bg-gray-100">
              <img 
                src={item.thumbnailUrl || item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            )}
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                {item.type}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentGrid; 