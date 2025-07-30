'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFilteredCreators } from '@/services/api';
import { Star, CheckCircle, MessageSquare, Heart } from 'lucide-react';
import CreatorCard from '@/components/creator/CreatorCard';

// Define Creator interface for this component
interface Creator {
  _id: string;
  name: string;
  username?: string;
  bio: string;
  category: string;
  subcategory?: string;
  profileImage?: string;
  avatar?: string;
  rating: number;
  reviews: number;
  tags: string[];
  profileUrl?: string;
  price: number;
  verified?: boolean;
  level?: string;
  ordersInQueue?: number;
  followers?: {
    [key: string]: number | undefined;
    instagram?: number;
    facebook?: number;
    twitter?: number;
    youtube?: number;
    linkedin?: number;
  };
  socialInfo?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    followersCount?: {
      [key: string]: number;
    };
  };
  professionalInfo?: {
    categories: string[];
  };
}

// Mock data for testing - this will be replaced with API call
const mockCreators: Creator[] = [
  {
    _id: '1',
    name: 'Alex Johnson',
    bio: 'Digital content creator specializing in lifestyle and travel content with over 5 years of experience.',
    category: 'Lifestyle & Travel',
    rating: 4.9,
    followers: {
      instagram: 120000,
      facebook: 85000,
      twitter: 45000,
      youtube: 200000,
      linkedin: 15000
    },
    reviews: 142,
    verified: true,
    level: 'Level 2 Seller',
    ordersInQueue: 5,
    tags: ['lifestyle', 'travel', 'photography'],
    price: 299,
    professionalInfo: {
      categories: ['Lifestyle', 'Travel', 'Photography']
    }
  },
  {
    _id: '2',
    name: 'Sarah Williams',
    bio: 'Tech blogger and web developer creating engaging tutorials and product reviews.',
    category: 'Technology',
    rating: 4.7,
    followers: {
      instagram: 75000,
      facebook: 120000,
      twitter: 180000,
      youtube: 320000,
      linkedin: 90000
    },
    reviews: 98,
    verified: true,
    level: 'Top Rated',
    ordersInQueue: 3,
    tags: ['technology', 'web dev', 'programming'],
    price: 499,
    professionalInfo: {
      categories: ['Technology', 'Web Development', 'Programming']
    }
  },
  {
    _id: '3',
    name: 'Michael Chen',
    bio: 'Fashion influencer with a passion for sustainable brands and minimalist design.',
    category: 'Fashion',
    rating: 4.8,
    followers: {
      instagram: 350000,
      facebook: 220000,
      twitter: 150000,
      youtube: 280000,
      linkedin: 25000
    },
    reviews: 215,
    verified: true,
    level: 'Level 2 Seller',
    ordersInQueue: 8,
    tags: ['fashion', 'sustainability', 'design'],
    price: 349,
    professionalInfo: {
      categories: ['Fashion', 'Sustainability', 'Design']
    }
  }
];

interface CreatorsListProps {
  creators?: Creator[];
}

export default function CreatorsList({ creators: propCreators }: CreatorsListProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);
  
  useEffect(() => {
    const loadCreators = async () => {
      try {
        // If creators were passed as props, use those
        if (propCreators && propCreators.length > 0) {
          setCreators(propCreators);
          setLoading(false);
          return;
        }
        
        // Get real data from MongoDB API
        const response = await getFilteredCreators({});
        
        console.log('API response:', response);
        
        if (response && Array.isArray(response.creators)) {
          setCreators(response.creators);
        } else {
          console.error('API response format is not as expected, using mock data:', response);
          setCreators(mockCreators);
          setUseMock(true);
        }
      } catch (err: any) {
        console.error('API error, using mock data:', err);
        setError('Could not load real data. Displaying mock creators.');
        setCreators(mockCreators);
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadCreators();
  }, [propCreators]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <div className="grid grid-cols-1 gap-6">
          {creators.map((creator) => (
            <CreatorCard
              key={creator._id}
              id={creator._id}
              username={creator.username || ''}
              fullName={creator.name}
              avatar={creator.profileImage || creator.avatar}
              categories={creator.professionalInfo?.categories || (creator.category ? [creator.category] : [])}
              level={creator.level}
              description={creator.bio}
              rating={creator.rating}
              reviewCount={creator.reviews}
              startingPrice={creator.price ? `$${creator.price}` : undefined}
              isLiked={false}
              title={undefined}
              completedProjects={0}
              socialMedia={creator.socialInfo}
            />
          ))}
        </div>
      </div>
    );
  }

  if (creators.length === 0 && !useMock) {
    return <div className="text-center py-10">No creators found.</div>;
  }
  
  return (
    <div className="space-y-6">
      {creators.map((creator) => (
        <CreatorCard
          key={creator._id}
          id={creator._id}
          username={creator.username || ''}
          fullName={creator.name}
          avatar={creator.profileImage || creator.avatar}
          categories={creator.professionalInfo?.categories || (creator.category ? [creator.category] : [])}
          level={creator.level}
          description={creator.bio}
          rating={creator.rating}
          reviewCount={creator.reviews}
          startingPrice={creator.price ? `$${creator.price}` : undefined}
          isLiked={false} // or use actual like status if available
          title={undefined}
          completedProjects={0}
          socialMedia={creator.socialInfo}
        />
      ))}
      {useMock && (
        <div className="text-center text-sm mt-4 text-gray-500">
          Using mock data for demonstration purposes.
        </div>
      )}
    </div>
  );
} 