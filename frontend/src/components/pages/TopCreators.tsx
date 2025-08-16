import { DashboardLayout } from "../layout/DashboardLayout";
import { Star, TrendingUp, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollCreators = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      const scrollLeft = direction === "left" 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                Top Creators
              </h1>
              <p className="text-xs md:text-base text-gray-600">
                Discover the most influential creators in their fields
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3 md:mt-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Creators
              </button>
              <button
                onClick={() => setFilter("trending")}
                className={`px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors flex items-center gap-1 ${
                  filter === "trending"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                Trending
              </button>
            </div>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden justify-end mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => scrollCreators("left")}
                className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCreators("right")}
                className="p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Creators Container - Grid on desktop, horizontal scroll on mobile */}
          <div 
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 hide-scrollbar snap-x snap-mandatory touch-pan-x mobile-smooth-scroll"
          >
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex-shrink-0 w-[280px] md:w-auto snap-start group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-28 md:h-48">
                  <img
                    src={creator.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {creator.trending && (
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-purple-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      Trending
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 md:p-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-2 md:gap-4 -mt-8 md:-mt-12 mb-2 md:mb-4 relative">
                    <div className="ring-4 ring-white rounded-full">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {creator.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {creator.username}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2">
                    {creator.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-xs md:text-sm">{creator.rating}</span>
                      <span className="text-gray-400 text-xs">
                        ({creator.reviews})
                      </span>
                    </div>
                    <div className="text-gray-400">•</div>
                    <div className="text-gray-600 text-xs md:text-sm">
                      {creator.followers} followers
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 md:pt-4 border-t">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">STARTING AT</p>
                      <p className="text-sm md:text-lg font-semibold text-purple-600">
                        {creator.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 md:p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button className="px-2 py-1 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs md:text-sm">
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
