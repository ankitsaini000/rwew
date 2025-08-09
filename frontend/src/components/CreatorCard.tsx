import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreatorCardData } from '@/types/creator';
import { FaStar, FaHeart } from 'react-icons/fa';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';

interface CreatorCardProps {
  creator: CreatorCardData;
  onToggleLike?: (id: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onToggleLike }) => {
  const {
    id,
    username,
    fullName,
    avatar,
    category,
    level,
    description,
    rating,
    reviewCount,
    startingPrice,
    isLiked,
    socialLinks
  } = creator;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleLike) {
      onToggleLike(id);
    }
  };
  
  // Ensure username is never empty with fallback to ID fragment
  const displayUsername = username || `user_${id.substring(0, 8)}`;

  return (
    <Link href={`/creator/${displayUsername}`} className="block group">
      <div className="glass-morphism overflow-hidden transition-all duration-300 group-hover:translate-y-[-5px] group-hover:shadow-lg">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="relative h-16 w-16 mr-4 overflow-hidden rounded-full border-2 border-white/50 shadow-md">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={fullName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-semibold">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
              <p className="text-sm text-purple-600">@{displayUsername}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="inline-block px-2 py-0.5 bg-purple-100/50 rounded-full mr-1">{category}</span> 
                <span className="inline-block px-2 py-0.5 bg-blue-100/50 rounded-full">{level}</span>
              </div>
            </div>
            <button
              onClick={handleLikeClick}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/50"
              aria-label={isLiked ? "Unlike creator" : "Like creator"}
            >
              <FaHeart className={`transition-transform duration-300 ${isLiked ? "text-red-500 scale-110" : "group-hover:scale-110"}`} size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2 h-10 mb-3">{description}</p>

          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-500 mr-2">
              <FaStar size={14} />
              <span className="text-sm ml-1 font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
          </div>

          {socialLinks && (
            <div className="flex space-x-2 mb-3">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-pink-600 p-1.5 rounded-full hover:bg-white/50 transition-colors">
                  <FaInstagram size={16} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-blue-400 p-1.5 rounded-full hover:bg-white/50 transition-colors">
                  <FaTwitter size={16} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-red-600 p-1.5 rounded-full hover:bg-white/50 transition-colors">
                  <FaYoutube size={16} />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-black p-1.5 rounded-full hover:bg-white/50 transition-colors">
                  <FaTiktok size={16} />
                </a>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">${startingPrice}</span>
                <span className="text-xs text-gray-500"> starting price</span>
              </div>
              <span className="text-xs px-3 py-1.5 glass-button text-purple-700 rounded-full transition-all group-hover:bg-white/30">View Profile</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;