// Type for the data structure returned from the API
export interface BackendCreator {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
    email?: string;
  };
  personalInfo: {
    profileImage?: string;
    bio?: string;
    username?: string;
  };
  professionalInfo: {
    category?: string;
    title?: string;
    categories?: string[];
  };
  descriptionFaq: {
    briefDescription?: string;
  };
  socialMedia: {
    socialProfiles?: {
      instagram?: { url?: string };
      twitter?: { url?: string };
      linkedin?: { url?: string };
      youtube?: { url?: string };
      facebook?: { url?: string };
      tiktok?: { url?: string };
    };
  };
  pricing: {
    basic?: { price?: number };
    standard?: { price?: number };
    premium?: { price?: number };
  };
  rating?: number;
  reviews?: number;
}

// Type for the data structure used by our CreatorCard component
export interface CreatorCardData {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  category: string;
  categories?: string[];
  level: string;
  description: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  isLiked: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

// Helper function to transform backend data to frontend card data
export const mapBackendCreatorToCardData = (
  creator: BackendCreator, 
  isLiked: boolean = false
): CreatorCardData => {
  // Get starting price from any available pricing tier
  const pricing = creator.pricing?.standard?.price || 
                  creator.pricing?.basic?.price || 
                  creator.pricing?.premium?.price || 0;

  // Map social media URLs
  const socialMedia = {
    instagram: creator.socialMedia?.socialProfiles?.instagram?.url,
    twitter: creator.socialMedia?.socialProfiles?.twitter?.url,
    youtube: creator.socialMedia?.socialProfiles?.youtube?.url,
    tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url,
  };

  return {
    id: creator._id,
    username: creator.userId?.username || creator.personalInfo?.username || `user_${creator._id.substring(0, 8)}`,
    fullName: creator.userId?.fullName || 'Creator Name',
    avatar: creator.personalInfo?.profileImage || creator.userId?.avatar,
    category: creator.professionalInfo?.category || 'Creator',
    categories: creator.professionalInfo?.categories || [],
    level: creator.professionalInfo?.title || 'Creator',
    description: creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || '',
    rating: creator.rating || 0,
    reviewCount: creator.reviews || 0,
    startingPrice: pricing,
    isLiked,
    socialLinks: socialMedia
  };
};

export interface CreatorProfile extends CreatorCardData {
  email: string;
  phone?: string;
  location?: string;
  languages: string[];
  skills: string[];
  portfolio: PortfolioItem[];
  about: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  services: Service[];
  availability: Availability;
  joinedDate: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: string;
}

export interface Availability {
  status: 'available' | 'busy' | 'unavailable';
  message?: string;
  nextAvailableDate?: string;
} 