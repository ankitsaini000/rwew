import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreatorStore } from '@/store/creatorStore';
import { toast } from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export interface CreatorCardProps {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  category?: string;
  categories?: string[];
  level?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  startingPrice?: string;
  isLiked?: boolean;
  title?: string;
  completedProjects?: number;
  showCategories?: boolean;
  showSocialMedia?: boolean;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
  };
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  id,
  username,
  fullName,
  avatar,
  category,
  categories,
  level,
  description,
  rating,
  reviewCount,
  startingPrice,
  isLiked,
  title,
  completedProjects,
  showCategories = true,
  socialMedia
}) => {
  const router = useRouter();
  const { toggleLike } = useCreatorStore();
  const { ref, inView } = useInView({ triggerOnce: true });
  const hasSentImpression = useRef(false);
  
  // Debug logging for categories
  console.log('🎯 CreatorCard Debug - Creator:', fullName);
  console.log('🎯 CreatorCard Debug - categories prop:', categories);
  console.log('🎯 CreatorCard Debug - category prop:', category);
  console.log('🎯 CreatorCard Debug - categories type:', typeof categories);
  console.log('🎯 CreatorCard Debug - categories length:', categories?.length);

  // Debug logging for categories
  console.log('🎯 CreatorCard Debug - Creator:', fullName);
  console.log('🎯 CreatorCard Debug - categories prop:', categories);
  console.log('🎯 CreatorCard Debug - category prop:', category);
  console.log('🎯 CreatorCard Debug - categories type:', typeof categories);
  console.log('🎯 CreatorCard Debug - categories length:', categories?.length);

  // Ensure username is never empty with fallback to user ID fragment
  const displayUsername = username || `user_${id.substring(0, 8)}`;

  const handleCardClick = () => {
    // Store recently viewed creator ID in localStorage
    if (id) {
      let recent = [];
      try {
        recent = JSON.parse(localStorage.getItem('recentlyViewedCreators') || '[]');
      } catch (e) {
        recent = [];
      }
      // Remove if already exists
      recent = recent.filter((cid: string) => cid !== id);
      // Add to front
      recent.unshift(id);
      // Limit to 10
      if (recent.length > 10) recent = recent.slice(0, 10);
      localStorage.setItem('recentlyViewedCreators', JSON.stringify(recent));
    }
    // Clean up the username for proper routing
    let routeUsername = displayUsername;
    
    // Remove @ prefix if present
    if (routeUsername.startsWith('@')) {
      routeUsername = routeUsername.substring(1);
    }
    
    // Ensure the username is URL-safe
    routeUsername = routeUsername.trim();
    
    // Log information about the card click
    console.log('🖱️ CARD CLICK: User clicked on creator profile card');
    console.log('👤 Creator Details:');
    console.log('   - ID:', id);
    console.log('   - Name:', fullName);
    console.log('   - Username:', displayUsername);
    console.log('   - Category:', category);
    console.log('   - Current like status:', isLiked ? 'Liked' : 'Not liked');
    
    // Navigate to the creator profile page
    console.log('🔄 Navigating to creator profile:', `/creator/${routeUsername}`);
    router.push(`/creator/${routeUsername}`);
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to like creators');
        // User is not authenticated, redirect to login
        router.push('/login?callbackUrl=/find-creators');
        return;
      }
      
      // Debug log the raw ID to help diagnose the issue
      console.log('CARD: Raw ID from props:', id, 'Type:', typeof id);
      
      // Check if the ID is a MongoDB ID - this is important for backend validation
      const isValidMongoId = (idToCheck: string) => {
        return /^[0-9a-fA-F]{24}$/.test(idToCheck);
      };
      
      // Normalize ID - handle different formats and ensure we have a valid string ID
      let creatorId = id;
      
      // Handle object IDs with multiple possible properties (database objects, API responses, etc)
      if (typeof creatorId === 'object' && creatorId !== null) {
        console.log('CARD: ID is an object, extracting properties:', creatorId);
        creatorId = (creatorId as any)?._id || 
                   (creatorId as any)?.id || 
                   (creatorId as any)?.creatorId || 
                   (creatorId as any)?.userId || '';
      }
      
      // Convert to string if it's not already and trim whitespace
      creatorId = String(creatorId || '').trim();
      
      // Check MongoDB ID validity
      const isMongoId = isValidMongoId(creatorId);
      console.log('CARD: Is valid MongoDB ID format?', isMongoId);
      
      // If ID is still missing or invalid, try to use username as fallback
      if (!creatorId || creatorId === 'undefined' || creatorId === 'null' || creatorId === '') {
        console.log('CARD: No valid ID found, attempting to use username as fallback');
        
        // If there's a username available, use it to generate a consistent ID
        if (username) {
          creatorId = `username_${username.replace('@', '').trim()}`;
          console.log('CARD: Generated ID from username:', creatorId);
        } else {
          console.error('CARD: Missing or invalid creator ID for like action and no username fallback available');
          toast.error('Unable to like creator - invalid ID');
          return;
        }
      }
      
      // Log the validated ID for debugging
      console.log('CARD: CREATOR ID FOR LIKE ACTION:', creatorId);
      
      // Show loading state
      toast.loading(isLiked ? 'Unliking...' : 'Liking...', { id: 'like-toast', duration: 2000 });
      
      // Create the creator object with all available data
      const creatorData = {
        id: creatorId,
        name: fullName,
        username: displayUsername,
        avatar: avatar || '',
        rating: rating || 0,
        reviews: reviewCount || 0,
        category: category || 'Creator',
        level: level || 'Creator',
        description: description || '',
        startingPrice: startingPrice || '₹0',
        isLiked: !isLiked,
        location: '',
      };
      
      // Log the complete creator data being sent to toggleLike
      console.log('CARD: Sending creator data to toggleLike:', creatorData);
      
      // Only attempt to like if we have a valid ID or a fallback
      await toggleLike(creatorData);
      
      // Success - toast is shown by toggleLike function
      toast.dismiss('like-toast');
    } catch (error) {
      console.error('CARD: Error in handleToggleLike:', error);
      toast.error(`Failed to ${isLiked ? 'unlike' : 'like'} creator. Please try again.`);
    }
  };

  useEffect(() => {
    if (inView && !hasSentImpression.current) {
      hasSentImpression.current = true;
      const token = localStorage.getItem('token');
      if (token) {
        axios.post(
          'http://localhost:5001/api/creators/dashboard-impression',
          { creatorId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch((err) => {
          // Optionally log or handle error
          console.error('Failed to send impression:', err);
        });
      }
    }
  }, [inView, id]);

  return (
    <div
      ref={ref}
      className="group bg-white rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 h-[360px] sm:h-[380px] md:h-[420px] flex flex-col justify-between overflow-hidden card-gradient-bg card-hover-effect"
      onClick={handleCardClick}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="flex gap-3 md:gap-4">
          <div className="relative">
            <img
              src={avatar || 'https://via.placeholder.com/100?text=Creator'}
              alt={fullName}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-purple-200 shadow-md group-hover:ring-purple-300 transition-all duration-300"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">{fullName}</h3>
            <p className="text-xs md:text-sm text-gray-500">{displayUsername}</p>
            
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-yellow-500">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs md:text-sm font-medium text-gray-900 ml-1">
                  {rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-500">
                ({reviewCount ?? 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-wrap gap-2">
          {/* Categories rendering */}
          {showCategories && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories && categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <span key={idx} className="inline-block">
                    <Link
                      href={`/categories/${encodeURIComponent(cat)}`}
                      className="category-pill"
                      prefetch={false}
                      onClick={e => e.stopPropagation()}
                    >
                      {cat}
                    </Link>
                  </span>
                ))
              ) : category ? (
                <span className="category-pill">
                  {category}
                </span>
              ) : null}
            </div>
          )}
          {level && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100 group-hover:border-gray-200 transition-colors">
              {level}
            </span>
          )}
        </div>
        {title && (
          <p className="text-sm text-purple-600 font-medium mt-1">{title}</p>
        )}
        <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
          {description || 'No description available'}
        </p>

        {/* Social Links */}
        <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
          {/* Social media links with responsive sizing */}
          {typeof socialMedia?.instagram === "string" && socialMedia.instagram ? (
            <a
              href={socialMedia.instagram}
              onClick={(e) => e.stopPropagation()}
              className="p-1 sm:p-1.5 md:p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-pink-500 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          ) : socialMedia?.instagram ? (
            <span
              className="p-1 sm:p-1.5 md:p-2 rounded-lg text-gray-300"
              title="Instagram profile not linked"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </span>
          ) : null}
          {typeof socialMedia?.twitter === "string" && socialMedia.twitter ? (
            <a
              href={socialMedia.twitter}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-blue-400 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          ) : socialMedia?.twitter ? (
            <span
              className="p-2 rounded-lg text-gray-300"
              title="Twitter profile not linked"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </span>
          ) : null}
          {typeof socialMedia?.linkedin === "string" && socialMedia.linkedin ? (
            <a
              href={socialMedia.linkedin}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-blue-600 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.407 0 22.675 0z" />
              </svg>
            </a>
          ) : socialMedia?.linkedin ? (
            <span
              className="p-2 rounded-lg text-gray-300"
              title="LinkedIn profile not linked"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.407 0 22.675 0z" />
              </svg>
            </span>
          ) : null}
          {typeof socialMedia?.youtube === "string" && socialMedia.youtube ? (
            <a
              href={socialMedia.youtube}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-red-500 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          ) : socialMedia?.youtube ? (
            <span
              className="p-2 rounded-lg text-gray-300"
              title="YouTube channel not linked"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </span>
          ) : null}
          {typeof socialMedia?.facebook === "string" && socialMedia.facebook ? (
            <a
              href={socialMedia.facebook}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-blue-600 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
            </a>
          ) : socialMedia?.facebook ? (
            <span
              className="p-2 rounded-lg text-gray-300"
              title="Facebook profile not linked"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
            </span>
          ) : null}
          {typeof socialMedia?.tiktok === "string" && socialMedia.tiktok ? (
            <a
              href={socialMedia.tiktok}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-gray-50/80 text-gray-400 hover:text-black transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          ) : socialMedia?.tiktok ? (
            <span
              className="p-2 rounded-lg text-gray-300"
              title="TikTok profile not linked"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </span>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-6 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Starting from</p>
          <p className="text-lg font-semibold text-purple-600">
            {startingPrice || 'Contact for price'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Clean up the username for proper routing
              let routeUsername = displayUsername;
              
              // Remove @ prefix if present
              if (routeUsername.startsWith('@')) {
                routeUsername = routeUsername.substring(1);
              }
              
              // Ensure the username is URL-safe
              routeUsername = routeUsername.trim();
              
              // Navigate to the creator profile page
              router.push(`/creator/${routeUsername}`);
            }}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            View
          </button>
          <button
            onClick={handleToggleLike}
            className="relative group/like p-2 rounded-full hover:bg-red-50 transition-colors bg-gray-50 group-hover:bg-white"
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover/like:opacity-100 transition-opacity" />
            <svg
              className={`w-6 h-6 sm:w-7 sm:h-7 ${
                isLiked ? "text-red-500" : "text-gray-400"
              } hover:text-red-500 transition-colors relative`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;