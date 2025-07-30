import { create } from "zustand";
import { persist } from "zustand/middleware";
import { likeCreator as likeCreatorAPI, unlikeCreator as unlikeCreatorAPI, getLikedCreators } from "@/services/api";
import { toast } from "react-hot-toast";
import axios from "axios";

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  reviews: number;
  category: string;
  categories?: string[]; // Add categories array for multiple categories
  level: string;
  description: string;
  startingPrice: string;
  isLiked?: boolean;
  location: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    facebook?: string;
    tiktok?: string;
  };
  // ... other creator properties
}

interface CreatorStore {
  likedCreators: Creator[];
  isLoading: boolean;
  error: string | null;
  toggleLike: (creator: Creator) => Promise<void>;
  removeLike: (creatorId: string) => Promise<void>;
  fetchLikedCreators: () => Promise<void>;
  setLikedCreators: (creators: Creator[]) => void;
}

export const useCreatorStore = create<CreatorStore>()(
  persist(
    (set, get) => ({
      likedCreators: [],
      isLoading: false,
      error: null,
      
      toggleLike: async (creator) => {
        try {
          // First check for authentication
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Please log in to like creators');
            return;
          }

          // Validate creator object
          if (!creator) {
            console.error('Invalid creator object:', creator);
            toast.error('Invalid creator data');
            return;
          }

          console.log('STORE: toggleLike received creator:', creator);
          
          // Extract and normalize the creator ID
          let creatorId = creator.id;
          
          // Debug log the raw ID 
          console.log('STORE: Raw creator ID:', creatorId, 'Type:', typeof creatorId);
          
          // Handle different ID formats
          if (typeof creatorId === 'object' && creatorId !== null) {
            console.log('STORE: ID is an object, extracting properties:', creatorId);
            creatorId = (creatorId as any)?._id || 
                       (creatorId as any)?.id || 
                       (creatorId as any)?.creatorId || 
                       (creatorId as any)?.userId || '';
          }
          
          // Ensure ID is a string and clean it
          creatorId = String(creatorId || '').trim();
          
          // Check if ID still invalid after extraction/cleaning
          if (!creatorId || creatorId === 'undefined' || creatorId === 'null' || creatorId === '') {
            // Try to extract username-based ID if already present
            if (creator.id && typeof creator.id === 'string' && creator.id.startsWith('username_')) {
              creatorId = creator.id;
              console.log('STORE: Using username-based ID:', creatorId);
            } 
            // Generate a deterministic ID based on username or name
            else if (creator.username || creator.name) {
              const tempIdBase = creator.username || creator.name || 'unknown';
              creatorId = `temp_${tempIdBase.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`;
              console.log('STORE: Generated temporary ID for creator:', creatorId);
            } else {
              console.error('STORE: No valid ID could be determined');
              toast.error('Unable to like - cannot determine creator identity');
              return;
            }
          }
          
          console.log('STORE: Final normalized creator ID for API call:', creatorId);
          
          const isLiked = get().likedCreators.some((c) => c.id === creatorId);
          console.log('STORE: Current like status:', isLiked);
          
          // Optimistic UI update
          set((state) => {
            console.log('STORE: Updating like status in store');
            return {
              likedCreators: isLiked
                ? state.likedCreators.filter((c) => c.id !== creatorId)
                : [...state.likedCreators, { ...creator, id: creatorId, isLiked: true }],
            };
          });
          
          console.log(`STORE: Calling API to ${isLiked ? 'unlike' : 'like'} creator with ID:`, creatorId);
          
          // Call the API
          if (isLiked) {
            const response = await unlikeCreatorAPI(creatorId);
            
            // Show success message based on MongoDB validation
            if (response.success) {
              if (creatorId.startsWith('temp_') || creatorId.startsWith('username_')) {
                toast.success('Creator unliked successfully (local only)');
              } else {
                toast.success('Creator unliked successfully');
                console.log('✅ STORE: Like record successfully removed from MongoDB database');
              }
            }
          } else {
            console.log('STORE: Sending like request with creatorId:', creatorId);
            const response = await likeCreatorAPI(creatorId);
            console.log('STORE: Like response:', response);
            
            // Show success message based on MongoDB validation
            if (response.success) {
              if (creatorId.startsWith('temp_') || creatorId.startsWith('username_')) {
                toast.success('Creator liked successfully (local only)');
              } else if (response.message === 'Already liked this creator') {
                toast.success('Creator was already liked');
                console.log('ℹ️ STORE: Creator was already liked in MongoDB database');
              } else {
                toast.success('Creator liked successfully');
                console.log('✅ STORE: Like record successfully stored in MongoDB database');
              }
            }
          }
        } catch (error: any) {
          console.error('STORE: Error toggling like:', error);
          // Log more details about the error
          if (error.response) {
            console.error('STORE: Error response data:', error.response.data);
            console.error('STORE: Error response status:', error.response.status);
            toast.error(`Failed to update like status: ${error.response?.data?.message || 'Server error'}`);
          } else if (error.request) {
            console.error('STORE: No response received:', error.request);
            toast.error('Network error. Please check your connection.');
          } else {
            toast.error('Failed to update like status');
          }
          
          // Revert optimistic update on error
          await get().fetchLikedCreators();
        }
      },
      
      removeLike: async (creatorId) => {
        try {
          // Optimistic UI update
          set((state) => ({
            likedCreators: state.likedCreators.filter((c) => c.id !== creatorId),
          }));
          
          // Call API
          await unlikeCreatorAPI(creatorId);
          toast.success('Creator unliked successfully');
        } catch (error: any) {
          console.error('Error removing like:', error);
          toast.error('Failed to unlike creator');
          
          // Revert optimistic update on error
          await get().fetchLikedCreators();
        }
      },
      
      fetchLikedCreators: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await getLikedCreators();
          
          if (response.success && response.data) {
            console.log('Fetched liked creators:', response.data);
            
            // Map the response data to the Creator format
            set({ 
              likedCreators: response.data.map((creator: any) => {
                // Ensure all required fields are present
                const socialMedia = creator.socialMedia || {};
                
                return {
                  id: creator.id || '',
                  isLiked: true,
                  name: creator.fullName || 'Creator',
                  username: creator.username || '',
                  avatar: creator.avatar || '',
                  rating: typeof creator.rating === 'number' ? creator.rating : 0,
                  reviews: typeof creator.reviews === 'number' ? creator.reviews : 0,
                  category: creator.category || 'Creator',
                  level: creator.level || '',
                  description: creator.description || 'No description available',
                  startingPrice: creator.startingPrice || 'Contact for price',
                  location: creator.location || '',
                  socialMedia: {
                    instagram: socialMedia.instagram || '',
                    twitter: socialMedia.twitter || '',
                    linkedin: socialMedia.linkedin || '',
                    youtube: socialMedia.youtube || '',
                    facebook: socialMedia.facebook || '',
                    tiktok: socialMedia.tiktok || ''
                  }
                };
              }),
              isLoading: false 
            });
          } else {
            set({ 
              error: 'Failed to fetch liked creators: ' + (response.message || 'Unknown error'),
              isLoading: false 
            });
          }
        } catch (error: any) {
          console.error('Error fetching liked creators:', error);
          set({ 
            error: 'Failed to fetch liked creators: ' + (error.message || 'Unknown error'),
            isLoading: false 
          });
        }
      },
      
      setLikedCreators: (creators) => {
        set({ likedCreators: creators });
      },
    }),
    {
      name: "creator-storage",
    }
  )
);
