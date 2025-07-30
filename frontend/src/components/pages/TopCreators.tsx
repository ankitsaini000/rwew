import { DashboardLayout } from "../layout/DashboardLayout";
import { Star, TrendingUp, Heart } from "lucide-react";
import { useState } from "react";

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  category: string;
  followers: string;
  rating: number;
  reviews: number;
  description: string;
  price: string;
  isVerified: boolean;
  trending: boolean;
}

export const TopCreators = () => {
  const [filter, setFilter] = useState("all");

  const creators: Creator[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      username: "@sarahjstyle",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      coverImage:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      category: "Fashion & Style",
      followers: "2.5M",
      rating: 4.9,
      reviews: 2340,
      description:
        "Fashion and lifestyle content creator, sharing daily inspiration",
      price: "₹55,000",
      isVerified: true,
      trending: true,
    },
    {
      id: "2",
      name: "Alex Rivera",
      username: "@alexcreates",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      coverImage:
        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a",
      category: "Tech & Gaming",
      followers: "1.8M",
      rating: 4.8,
      reviews: 1890,
      description: "Tech reviews and gaming content creator",
      price: "₹48,000",
      isVerified: true,
      trending: true,
    },
    {
      id: "3",
      name: "Emma Wilson",
      username: "@emmafitness",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      coverImage:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
      category: "Fitness & Health",
      followers: "3.2M",
      rating: 4.9,
      reviews: 2800,
      description: "Fitness trainer and wellness advocate",
      price: "₹62,000",
      isVerified: true,
      trending: false,
    },
  ];

  // Filter creators with 1M+ followers
  const topCreators = creators.filter((creator) => {
    const followersCount = parseFloat(creator.followers.replace("M", ""));
    return followersCount >= 1;
  });

  // Filter by trending if selected
  const filteredCreators =
    filter === "trending"
      ? topCreators.filter((creator) => creator.trending)
      : topCreators;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Top Creators
              </h1>
              <p className="text-gray-600">
                Discover the most influential creators in their fields
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Creators
              </button>
              <button
                onClick={() => setFilter("trending")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  filter === "trending"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
            </div>
          </div>

          {/* Creators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-48">
                  <img
                    src={creator.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {creator.trending && (
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Trending
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 -mt-12 mb-4 relative">
                    <div className="ring-4 ring-white rounded-full">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {creator.username}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {creator.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{creator.rating}</span>
                      <span className="text-gray-400 text-sm">
                        ({creator.reviews})
                      </span>
                    </div>
                    <div className="text-gray-400">•</div>
                    <div className="text-gray-600 text-sm">
                      {creator.followers} followers
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">STARTING AT</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {creator.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
