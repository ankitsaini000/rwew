import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from 'react-hot-toast';

// Import from services
import { publishProfile } from '../services/api';

export interface CreatorProfile {
  id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    username: string;
    bio: string;
    profileImage: string;
    location: {
      state: string;
      country: string;
    };
    languages: string[];
    skills: string[];
  },
  professionalInfo: {
    title: string;
    category: string;
    subcategory: string;
    expertise: string[];
    level: string;
    yearsOfExperience: number;
    tags: string[];
  };
  pricing: {
    packages: {
      basic: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      standard: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
      premium: {
        name: string;
        price: number;
        description: string;
        deliveryTime: number;
        revisions: number;
        features: string[];
      };
    };
    customOffers: boolean;
  };
  descriptionFaq: {
    brief: string;
    detailed: string;
    faq: Array<{ question: string; answer: string }>;
  };
  socialMedia: {
    website: string;
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    other: Array<{ platform: string; url: string }>;
    followersCount: Record<string, number>;
  };
  gallery: {
    images: string[];
    videos: string[];
  };
  portfolio: Array<{ title: string; url: string; description?: string }>;
  status: 'draft' | 'published' | 'suspended';
  completionStatus: {
    personalInfo: boolean;
    professionalInfo: boolean;
    descriptionFaq: boolean;
    socialMedia: boolean;
    pricing: boolean;
    gallery: boolean;
    portfolio: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

// Default values for a new profile
const getDefaultProfile = (): Partial<CreatorProfile> => ({
  personalInfo: {
    fullName: '',
    username: '',
    bio: '',
    profileImage: '',
    location: {
      state: '',
      country: '',
    },
    languages: [],
    skills: []
  },
  professionalInfo: {
    title: '',
    category: '',
    subcategory: '',
    expertise: [],
    level: 'intermediate',
    yearsOfExperience: 0,
    tags: []
  },
  pricing: {
    packages: {
      basic: {
        name: 'Basic',
        price: 0,
        description: '',
        deliveryTime: 3,
        revisions: 1,
        features: []
      },
      standard: {
        name: 'Standard',
        price: 0,
        description: '',
        deliveryTime: 5,
        revisions: 2,
        features: []
      },
      premium: {
        name: 'Premium',
        price: 0,
        description: '',
        deliveryTime: 7,
        revisions: 3,
        features: []
      }
    },
    customOffers: false
  },
  descriptionFaq: {
    brief: '',
    detailed: '',
    faq: []
  },
  gallery: {
    images: [],
    videos: []
  },
  portfolio: [],
  socialMedia: {
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    other: [],
    followersCount: {}
  },
  status: 'draft',
  completionStatus: {
    personalInfo: false,
    professionalInfo: false,
    descriptionFaq: false,
    socialMedia: false,
    pricing: false,
    gallery: false,
    portfolio: false
  }
});

interface CreatorProfileStore {
  currentProfile: Partial<CreatorProfile>;
  updateCurrentProfile: (section: keyof CreatorProfile, data: Partial<any>) => void;
  resetCurrentProfile: () => void;
  getCompletedSections: () => string[];
  getProfileCompletionPercentage: () => number;
  saveToLocalStorage: () => boolean;
  loadFromLocalStorage: () => boolean;
  isProfileComplete: () => boolean;
  checkProfileCompleteness: (status: any) => boolean;
  getProfileCompletenessChecks: () => Record<string, boolean>;
}

// Helper to compress images
const compressImage = async (base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
};

// Check if localStorage is approaching quota
const checkStorageQuota = (): { percentUsed: number, available: boolean } => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }
    
    // Estimate total available (typical browsers offer 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB to be safe
    const percentUsed = (totalSize / estimatedLimit) * 100;
    
    return {
      percentUsed,
      available: percentUsed < 90 // Consider it unavailable if above 90%
    };
  } catch (e) {
    console.error('Error checking storage quota:', e);
    return { percentUsed: 100, available: false }; 
  }
};

// Helper to clear unused gallery images
const clearUnusedGalleryImages = () => {
  if (typeof window === 'undefined') return;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('creator_gallery_image_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Error clearing unused gallery images:', e);
  }
};

export const useCreatorProfileStore = create<CreatorProfileStore>()(
  persist(
    (set, get) => ({
      currentProfile: getDefaultProfile(),
      
      // Update a specific section of the profile
      updateCurrentProfile: (section, data) => {
        set(state => {
          const sectionData = state.currentProfile[section] || {};
          
          // Create a new profile with updated section
          const newProfile = { 
            ...state.currentProfile,
            [section]: {
              ...(sectionData as Record<string, any>),
              ...data
            }
          };
          
          // Update completion status based on required fields
          let completionStatus = { ...state.currentProfile.completionStatus } as CreatorProfile['completionStatus'];
          
          // Determine if section is complete based on specific requirements
          switch(section) {
            case 'personalInfo':
              completionStatus.personalInfo = !!(data as any).username && !!(data as any).fullName;
              break;
            case 'professionalInfo':
              completionStatus.professionalInfo = !!(data as any).title && !!(data as any).category;
              break;
            case 'pricing':
              completionStatus.pricing = !!(data as any).packages?.basic?.price;
              break;
            case 'descriptionFaq':
              completionStatus.descriptionFaq = !!(data as any).detailed || !!(data as any).brief;
              break;
            case 'gallery':
              completionStatus.gallery = !!(
                (data as any).images?.length || 
                (data as any).videos?.length
              );
              break;
            case 'portfolio':
              completionStatus.portfolio = Array.isArray(data) && data.length > 0;
              break;
            case 'socialMedia':
              completionStatus.socialMedia = !!(
                (data as any).website || 
                (data as any).instagram || 
                (data as any).twitter || 
                (data as any).facebook || 
                (data as any).linkedin || 
                (data as any).youtube
              );
              break;
          }
          
          newProfile.completionStatus = completionStatus as CreatorProfile['completionStatus'];
          newProfile.updatedAt = Date.now();
          
          // Save to localStorage
          try {
            // Special handling for gallery images which can be large
            if (section === 'gallery' && data.images && data.images.length > 0) {
              // Clear previous gallery images
              clearUnusedGalleryImages();
              
              // Store each image separately with compression
              const processImages = async () => {
                for (let i = 0; i < Math.min(data.images.length, 5); i++) {
                  try {
                    // Compress the image before storing
                    const compressedImage = await compressImage(data.images[i], 600, 0.6);
                    if (compressedImage) {
                      localStorage.setItem(`creator_gallery_image_${i}`, compressedImage);
                    }
                  } catch (e) {
                    console.warn(`Could not store gallery image ${i}:`, e);
                  }
                }
              };
              
              // Execute image processing
              processImages().catch(e => console.error("Image processing failed:", e));
            }
            
            // Store section data
            localStorage.setItem(`creator_${section}`, JSON.stringify(data));
            
            // Update overall profile completeness flag
            localStorage.setItem('creator_profile_exists', 'true');
          } catch (error) {
            console.error(`Error saving ${section} to localStorage:`, error);
            toast.error(`Could not save ${section} data. Try reducing image sizes or removing some items.`);
          }
          
          return { currentProfile: newProfile };
        });
      },
      
      // Reset the profile to defaults
      resetCurrentProfile: () => {
        set({ currentProfile: getDefaultProfile() });
        
        // Clear all localStorage keys related to creator profile
        if (typeof window !== 'undefined') {
          const sections = [
            'creator_personalInfo', 
            'creator_professionalInfo', 
            'creator_pricing', 
            'creator_descriptionFaq', 
            'creator_gallery', 
            'creator_portfolio',
            'creator_socialMedia'
          ];
          
          sections.forEach(key => localStorage.removeItem(key));
          
          // Clear gallery images
          clearUnusedGalleryImages();
        }
      },
      
      // Get array of completed section names
      getCompletedSections: () => {
        const { completionStatus } = get().currentProfile;
        if (!completionStatus) return [];
        
        return Object.entries(completionStatus)
          .filter(([_, isComplete]) => isComplete)
          .map(([section]) => section);
      },
      
      // Calculate profile completion percentage
      getProfileCompletionPercentage: () => {
        const { completionStatus } = get().currentProfile;
        if (!completionStatus) return 0;
        
        const totalSections = Object.keys(completionStatus).length;
        const completedSections = Object.values(completionStatus).filter(Boolean).length;
        
        return Math.round((completedSections / totalSections) * 100);
      },
      
      // Save entire profile to localStorage
      saveToLocalStorage: () => {
        if (typeof window === 'undefined') return false;
        
        try {
          // Check if we have enough storage space
          const { available } = checkStorageQuota();
          if (!available) {
            toast.error('Browser storage is full. Please clear some data or use fewer images.');
            return false;
          }
          
          const profile = get().currentProfile;
          
          // Save each section separately
          Object.entries(profile).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'completionStatus') {
              try {
                localStorage.setItem(`creator_${key}`, JSON.stringify(value));
              } catch (e) {
                console.error(`Error saving ${key} to localStorage:`, e);
              }
            }
          });
          
          // Store the username for easier retrieval
          if (profile.personalInfo?.username) {
            localStorage.setItem('username', profile.personalInfo.username);
          }
          
          return true;
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          toast.error('Failed to save profile data. Storage may be full.');
          return false;
        }
      },
      
      // Load profile from localStorage
      loadFromLocalStorage: () => {
        try {
          console.log('Loading profile data from localStorage...');
          
          // Load all sections from localStorage
          const personalInfo = localStorage.getItem('creator_personalInfo');
          const professionalInfo = localStorage.getItem('creator_professionalInfo');
          const pricing = localStorage.getItem('creator_pricing');
          const descriptionFaq = localStorage.getItem('creator_descriptionFaq');
          const socialMedia = localStorage.getItem('creator_socialMedia');
          const gallery = localStorage.getItem('creator_gallery');
          const portfolio = localStorage.getItem('creator_portfolio');
          
          // Create a new profile object with the default values
          const newProfile = getDefaultProfile();
          let isDataLoaded = false;
          
          // Parse and set each section
          if (personalInfo) {
            try {
              newProfile.personalInfo = JSON.parse(personalInfo);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing personal info:', e);
            }
          }
          
          if (professionalInfo) {
            try {
              newProfile.professionalInfo = JSON.parse(professionalInfo);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing professional info:', e);
            }
          }
          
          if (pricing) {
            try {
              newProfile.pricing = JSON.parse(pricing);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing pricing data:', e);
            }
          }
          
          if (descriptionFaq) {
            try {
              newProfile.descriptionFaq = JSON.parse(descriptionFaq);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing description & FAQ:', e);
            }
          }
          
          if (socialMedia) {
            try {
              newProfile.socialMedia = JSON.parse(socialMedia);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing social media:', e);
            }
          }
          
          if (gallery) {
            try {
              newProfile.gallery = JSON.parse(gallery);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing gallery:', e);
            }
          }
          
          if (portfolio) {
            try {
              newProfile.portfolio = JSON.parse(portfolio);
              isDataLoaded = true;
            } catch (e) {
              console.error('Error parsing portfolio:', e);
            }
          }
          
          // Load gallery images
          if (newProfile.gallery && Array.isArray(newProfile.gallery.images)) {
            const galleryImages = [];
            for (let i = 0; i < 5; i++) {
              const imageKey = `creator_gallery_image_${i}`;
              const imageData = localStorage.getItem(imageKey);
              if (imageData) {
                galleryImages.push(imageData);
              }
            }
            
            if (galleryImages.length > 0) {
              newProfile.gallery.images = galleryImages;
            }
          }
          
          // Update completion status
          newProfile.completionStatus = {
            personalInfo: !!(newProfile.personalInfo?.fullName && newProfile.personalInfo?.username),
            professionalInfo: !!(newProfile.professionalInfo?.title && newProfile.professionalInfo?.category),
            descriptionFaq: !!(newProfile.descriptionFaq?.detailed || newProfile.descriptionFaq?.brief),
            socialMedia: !!(
              newProfile.socialMedia?.website || 
              newProfile.socialMedia?.instagram || 
              newProfile.socialMedia?.twitter || 
              newProfile.socialMedia?.facebook ||
              newProfile.socialMedia?.linkedin ||
              newProfile.socialMedia?.youtube
            ),
            pricing: !!(newProfile.pricing?.packages?.basic?.price),
            gallery: !!(newProfile.gallery?.images && newProfile.gallery.images.length > 0),
            portfolio: !!(newProfile.portfolio && newProfile.portfolio.length > 0)
          };
          
          // If we loaded at least some data, update the current profile
          if (isDataLoaded) {
            console.log('Successfully loaded profile data from localStorage');
            set({ currentProfile: newProfile });
            return true;
          } else {
            console.warn('No profile data found in localStorage');
            return false;
          }
        } catch (error) {
          console.error('Error loading profile from localStorage:', error);
          return false;
        }
      },
      
      // Check if profile is complete with required sections
      isProfileComplete: () => {
        // In development mode, always return true to bypass completion checks
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: bypassing profile completion check');
          return true;
        }

        const requiredSections = ['personalInfo', 'professionalInfo', 'descriptionFaq', 'socialMedia'];
        const completionStatus = get().currentProfile.completionStatus;
        
        if (!completionStatus) return false;
        
        const isComplete = requiredSections.every(section => 
          completionStatus[section as keyof typeof completionStatus] === true
        );
        
        return isComplete;
      },
      
      // Check profile completeness status
      checkProfileCompleteness: (status: any) => {
        if (!status) return false;
        
        const requiredSections = ['personalInfo', 'professionalInfo', 'descriptionFaq', 'socialMedia'];
        return requiredSections.every(section => status[section] === true);
      },
      
      // Get profile completeness checks for each section
      getProfileCompletenessChecks: () => {
        const { completionStatus } = get().currentProfile;
        if (!completionStatus) return {};
        
        return {
          ...completionStatus,
          isComplete: get().isProfileComplete()
        };
      }
    }),
    {
      name: "creator-profile-storage",
      // Only store the currentProfile state in localStorage
      partialize: (state) => ({ currentProfile: state.currentProfile }),
    }
  )
);
