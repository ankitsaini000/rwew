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
    <Link href={`/creator/${displayUsername}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="relative h-16 w-16 mr-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={fullName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-semibold">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fullName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">@{displayUsername}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category} · {level}</div>
            </div>
            <button
              onClick={handleLikeClick}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label={isLiked ? "Unlike creator" : "Like creator"}
            >
              <FaHeart className={isLiked ? "text-red-500" : ""} size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 h-10 mb-3">{description}</p>

          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-500 mr-2">
              <FaStar size={14} />
              <span className="text-sm ml-1 font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">({reviewCount} reviews)</span>
          </div>

          {socialLinks && (
            <div className="flex space-x-2 mb-3">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-pink-600">
                  <FaInstagram size={16} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-blue-400">
                  <FaTwitter size={16} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-red-600">
                  <FaYoutube size={16} />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-black">
                  <FaTiktok size={16} />
                </a>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">${startingPrice}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400"> starting price</span>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">View Profile</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard; 