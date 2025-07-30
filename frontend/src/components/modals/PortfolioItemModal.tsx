import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface PortfolioItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string;
    title?: string;
    description?: string;
    image?: string | { url?: string };
    url?: string;
    client?: string;
    category?: string;
    projectDate?: string;
  };
}

export const PortfolioItemModal = ({
  isOpen,
  onClose,
  item
}: PortfolioItemModalProps) => {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Process image URL to handle both string and object formats
  const imageUrl = typeof item.image === 'string' 
    ? item.image 
    : (item.image && typeof item.image === 'object' && 'url' in item.image) 
      ? item.image.url 
      : '';

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{item.title || 'Portfolio Item'}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imageUrl && (
              <div className="overflow-hidden rounded-lg">
                <img 
                  src={imageUrl} 
                  alt={item.title || 'Portfolio item'} 
                  className="w-full h-auto object-cover"
                  style={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error';
                  }}
                />
              </div>
            )}
            
            <div>
              {item.category && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {item.category}
                  </span>
                </div>
              )}
              
              {item.client && (
                <p className="text-gray-600 mb-2">
                  <strong>Client:</strong> {item.client}
                </p>
              )}
              
              {item.projectDate && (
                <p className="text-gray-600 mb-4">
                  <strong>Date:</strong> {item.projectDate}
                </p>
              )}
              
              {item.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">About this project</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                </div>
              )}
              
              {item.url && (
                <Button 
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 