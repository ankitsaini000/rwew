"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Creator {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  specialty?: string;
  followers?: number;
}

const CreatorsList = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockCreators: Creator[] = [
      {
        id: '1',
        username: 'johndoe',
        fullName: 'John Doe',
        specialty: 'Digital Art',
        followers: 1243,
      },
      {
        id: '2',
        username: 'sarahsmith',
        fullName: 'Sarah Smith',
        specialty: 'Photography',
        followers: 3456,
      },
      {
        id: '3',
        username: 'markjohnson',
        fullName: 'Mark Johnson',
        specialty: 'UI/UX Design',
        followers: 987,
      },
      {
        id: '4',
        username: 'emilywilson',
        fullName: 'Emily Wilson',
        specialty: 'Web Development',
        followers: 2345,
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setCreators(mockCreators);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl text-red-600 mb-2">Unable to load creators</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Featured Creators
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover talented professionals in our community
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {creators.map((creator) => (
          <Link href={`/creator/${creator.username}`} key={creator.id}>
            <div className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <div className="h-48 w-full relative bg-gradient-to-r from-purple-400 to-indigo-500">
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    {creator.avatar ? (
                      <Image 
                        src={creator.avatar} 
                        alt={creator.fullName}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-500">
                        {creator.fullName[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 pt-14 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-center text-gray-900">{creator.fullName}</h3>
                <p className="mt-1 text-sm text-center text-purple-600">@{creator.username}</p>
                
                {creator.specialty && (
                  <p className="mt-3 text-sm text-center text-gray-500">{creator.specialty}</p>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-center">
                    <div className="text-center">
                      <span className="block text-xl font-semibold text-gray-900">
                        {creator.followers?.toLocaleString()}
                      </span>
                      <span className="block text-sm text-gray-500">Followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CreatorsList; 