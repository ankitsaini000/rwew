"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Star, Users, MapPin, CheckCircle2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Creator {
  id: number;
  name: string;
  avatar: string;
  location: string;
  category: string;
  rating: number;
  followers: string;
  price: string;
  tags: string[];
  isVerified: boolean;
}

export const LikePage = () => {
  const router = useRouter();
  const [likedCreators, setLikedCreators] = useState<Creator[]>([]);

  useEffect(() => {
    // Get liked creators from localStorage
    const liked = localStorage.getItem("likedCreators");
    if (liked) {
      setLikedCreators(JSON.parse(liked));
    }
  }, []);

  const handleUnlike = (creatorId: number) => {
    const updatedLikes = likedCreators.filter(
      (creator) => creator.id !== creatorId
    );
    setLikedCreators(updatedLikes);
    localStorage.setItem("likedCreators", JSON.stringify(updatedLikes));
  };

  const handleViewProfile = (creatorId: number) => {
    router.push(`/creator/${creatorId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Liked Creators
              </h1>
              <p className="text-gray-600">
                {likedCreators.length} creators you've liked
              </p>
            </div>
          </div>

          {likedCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 relative group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {creator.name}
                        </h3>
                        {creator.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {creator.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{creator.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{creator.followers}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {creator.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-semibold text-gray-900">
                      From {creator.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUnlike(creator.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleViewProfile(creator.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No liked creators yet
              </h3>
              <p className="text-gray-600">
                Start exploring and like creators to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
