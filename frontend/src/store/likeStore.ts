import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface LikedCreator {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorCategory: string;
  timestamp: number;
}

interface LikeState {
  likedCreators: LikedCreator[];
  addLike: (creator: Omit<LikedCreator, 'id' | 'timestamp'>) => void;
  removeLike: (creatorId: string) => void;
  isLiked: (creatorId: string) => boolean;
}

export const useLikeStore = create<LikeState>()(
  persist(
    (set, get) => ({
      likedCreators: [],
      
      addLike: (creator) => {
        const { likedCreators } = get();
        // Check if already liked
        if (likedCreators.some(like => like.creatorId === creator.creatorId)) {
          console.log(`Creator ${creator.creatorId} already liked`);
          return;
        }
        
        const newCreator = {
          id: uuidv4(),
          ...creator,
          timestamp: Date.now(),
        };
        
        console.log(`Adding liked creator:`, newCreator);
        
        set({
          likedCreators: [
            ...likedCreators,
            newCreator,
          ],
        });
      },
      
      removeLike: (creatorId) => {
        const { likedCreators } = get();
        console.log(`Removing like for creator ${creatorId}`);
        
        set({
          likedCreators: likedCreators.filter(
            (creator) => creator.creatorId !== creatorId
          ),
        });
      },
      
      isLiked: (creatorId) => {
        const { likedCreators } = get();
        const result = likedCreators.some(like => like.creatorId === creatorId);
        console.log(`Checking if creator ${creatorId} is liked:`, result);
        return result;
      },
    }),
    {
      name: 'liked-creators-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ likedCreators: state.likedCreators }),
      // Debug the initial hydration
      onRehydrateStorage: () => (state) => {
        console.log('Likes store hydrated:', state?.likedCreators?.length || 0, 'liked creators');
      },
    }
  )
); 