"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCreatorByUsername } from "../../services/creatorApi";
import Link from "next/link";
import Image from "next/image";

interface CreatorData {
  personalInfo?: {
    fullName?: string;
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
  };
  stats?: {
    followers?: number;
    following?: number;
    projects?: number;
  };
}

export const CreatorProfilePage = () => {
  const params = useParams();
  const username = params?.id as string;
  
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreator() {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCreatorByUsername(username);
        
        if (response && response.data) {
          setCreator(response.data);
          setError(null);
        } else {
          setError(response.error || `Creator "${username}" not found`);
        }
      } catch (error: any) {
        console.error(`Error fetching creator:`, error);
        setError(error?.message || `Creator "${username}" not found`);
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/creators" className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            View All Creators
          </Link>
        </div>
      </div>
    );
  }

  // Extract creator information with defaults
  const fullName = creator?.personalInfo?.fullName || creator?.personalInfo?.name || "Creator";
  const displayUsername = creator?.personalInfo?.username || username;
  const followers = creator?.stats?.followers || 0;
  const following = creator?.stats?.following || 0;
  const projects = creator?.stats?.projects || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Header with Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center overflow-hidden">
                {creator?.personalInfo?.avatar ? (
                  <Image 
                    src={typeof creator.personalInfo.avatar === 'string' ? creator.personalInfo.avatar : ''} 
                    alt={fullName} 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized={typeof creator.personalInfo.avatar === 'string' && creator.personalInfo.avatar.startsWith('data:')}
                  />
                ) : (
                  <span className="text-4xl font-bold text-purple-600">
                    {fullName[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            </div>

          {/* Profile Information */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-purple-600 font-medium">@{displayUsername}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-gray-900">{followers.toLocaleString()}</span>
                <span className="text-sm text-gray-600">Followers</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-gray-900">{following.toLocaleString()}</span>
                <span className="text-sm text-gray-600">Following</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="block text-2xl font-bold text-gray-900">{projects.toLocaleString()}</span>
                <span className="text-sm text-gray-600">Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
