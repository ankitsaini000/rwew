import React, { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';

interface SocialActionsProps {
  initialLikes?: number;
  onShare?: () => void;
  className?: string;
}

const SocialActions: React.FC<SocialActionsProps> = ({
  initialLikes = 0,
  onShare,
  className = ''
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setLiked(true);
    }
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      alert('Profile shared successfully!');
    }
  };
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button 
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
          liked 
            ? 'text-pink-600 bg-pink-50 hover:bg-pink-100' 
            : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
        }`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        <span className="font-medium">{likes}</span>
      </button>
      
      <button 
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">Share</span>
      </button>
    </div>
  );
};

export default SocialActions; 