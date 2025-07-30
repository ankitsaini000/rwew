export interface BaseProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: Record<string, SocialLink>;
  contentStats?: {
    posts?: number;
    followers?: number;
    following?: number;
  };
  content?: ContentItem[];
}

export interface SocialLink {
  url: string;
  handle?: string;
  followers?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'article';
  createdAt: string;
}

export interface CreatorProfile extends BaseProfile {
  skills?: string[];
  experience?: Experience[];
}

export interface BrandProfile extends BaseProfile {
  industry?: string;
  foundedYear?: number;
  companySize?: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
} 