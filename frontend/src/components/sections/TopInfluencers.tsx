"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories, getFilteredCreators } from "../../services/api";
import CreatorCard from "../creator/CreatorCard";

export const TopInfluencers = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorScroll, setCreatorScroll] = useState(0);

  // Resolve a starting price from various shapes coming from API
  const getStartingPrice = (creator: any): string | number | undefined => {
    const sp = creator?.startingPrice;
    if (typeof sp === 'number' && !isNaN(sp)) return sp;
    if (typeof sp === 'string' && sp.trim()) return sp;
    const std = creator?.pricing?.standard?.price ?? creator?.pricing?.standard;
    if (typeof std === 'number') return std;
    const basic = creator?.pricing?.basic?.price ?? creator?.pricing?.basic;
    if (typeof basic === 'number') return basic;
    return undefined;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getFilteredCreators({ category: selectedCategory === "All" ? "" : selectedCategory, limit: 8 });
        console.log('🔍 TopInfluencers Debug - Fetched creators:', res.creators);
        
        // Check if creators have categories
        if (res.creators && res.creators.length > 0) {
          res.creators.forEach((creator: any, index: number) => {
            console.log(`🔍 Creator ${index + 1} categories:`, {
              name: creator.name || creator.fullName,
              categories: creator.categories,
              professionalInfo: creator.professionalInfo
            });
          });
        }
        
        setCreators(res.creators || []);
      } catch (err) {
        console.error('Error fetching creators:', err);
        setError("Failed to load creators");
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, [selectedCategory]);

  const scrollCreators = (direction: "left" | "right") => {
    const container = document.getElementById("creators-container");
    if (container) {
      const scrollAmount = 280; // Approximate width of a card
      const newScroll =
        direction === "left"
          ? creatorScroll - scrollAmount
          : creatorScroll + scrollAmount;

      container.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
      setCreatorScroll(newScroll);
    }
  };

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 md:px-4">
        {/* Title Section */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">Top Creators</h2>
            <p className="text-xs md:text-base text-gray-600 mt-1 md:mt-2">
              Work with talented creators from around the world
            </p>
          </div>
          <button className="text-sm md:text-base text-purple-600 hover:text-purple-700 font-medium transition-colors">
            View All
          </button>
        </div>

        {/* Categories Filter */}
        <div className="mb-6 md:mb-8 overflow-x-auto">
          <div className="flex gap-2 md:gap-4 min-w-max pb-3 md:pb-4 snap-x snap-mandatory hide-scrollbar">
            <button
              key="All"
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors snap-start shadow-sm
                ${selectedCategory === "All"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}
              `}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors snap-start shadow-sm
                  ${selectedCategory === cat.name
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 md:py-12 text-gray-500">Loading creators...</div>
        ) : error ? (
          <div className="text-center py-8 md:py-12 text-red-500">{error}</div>
        ) : creators.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-gray-400">No creators found.</div>
        ) : (
          <div className="relative">
            {/* Mobile Navigation Controls - Only visible on small screens */}
            <div className="sm:hidden flex justify-end gap-2 mb-3">
              <button
                onClick={() => scrollCreators("left")}
                className="p-1.5 rounded-full bg-white shadow hover:bg-gray-50 text-gray-600 border border-gray-100 hover:border-purple-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCreators("right")}
                className="p-1.5 rounded-full bg-white shadow hover:bg-gray-50 text-gray-600 border border-gray-100 hover:border-purple-200 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Mobile Horizontal Scroll - Only on small screens */}
            <div 
              id="creators-container"
              className="sm:hidden flex overflow-x-auto gap-4 pb-6 hide-scrollbar snap-x snap-mandatory touch-pan-x touch-scroll mobile-smooth-scroll"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              {creators.map((creator) => (
                <div 
                  key={creator.id || creator._id || creator.username} 
                  className="flex-shrink-0 w-[280px] snap-start"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <CreatorCard
                    id={creator.id || creator._id || creator.username}
                    username={creator.username || creator.personalInfo?.username || ''}
                    fullName={creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || ''}
                    avatar={creator.avatar || creator.personalInfo?.profileImage}
                     categories={Array.isArray(creator.categories) && creator.categories.length > 0
                       ? creator.categories
                       : (creator.category ? [creator.category] : (Array.isArray(creator.professionalInfo?.categories) ? creator.professionalInfo.categories : []))}
                     category={creator.category || creator.professionalInfo?.category || ''}
                    level={creator.level || creator.professionalInfo?.title}
                    description={creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription}
                    rating={creator.rating || creator.metrics?.ratings?.average || 0}
                    reviewCount={creator.reviewCount || creator.metrics?.ratings?.count || 0}
                    startingPrice={getStartingPrice(creator)}
                    isLiked={false}
                    title={creator.title || creator.professionalInfo?.title}
                    completedProjects={creator.completedProjects}
                    showCategories={true}
                    socialMedia={creator.socialMedia}
                  />
                </div>
              ))}
            </div>
            
            {/* Desktop Grid - Only on larger screens */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
              {creators.map((creator) => (
                <div key={creator.id || creator._id || creator.username} className="w-full max-w-[280px]">
                  <CreatorCard
                    id={creator.id || creator._id || creator.username}
                    username={creator.username || creator.personalInfo?.username || ''}
                    fullName={creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || ''}
                    avatar={creator.avatar || creator.personalInfo?.profileImage}
                     categories={Array.isArray(creator.categories) && creator.categories.length > 0
                       ? creator.categories
                       : (creator.category ? [creator.category] : (Array.isArray(creator.professionalInfo?.categories) ? creator.professionalInfo.categories : []))}
                     category={creator.category || creator.professionalInfo?.category || ''}
                    level={creator.level || creator.professionalInfo?.title}
                    description={creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription}
                    rating={creator.rating || creator.metrics?.ratings?.average || 0}
                    reviewCount={creator.reviewCount || creator.metrics?.ratings?.count || 0}
                    startingPrice={getStartingPrice(creator)}
                    isLiked={false}
                    title={creator.title || creator.professionalInfo?.title}
                    completedProjects={creator.completedProjects}
                    showCategories={true}
                    socialMedia={creator.socialMedia}
                  />
                </div>
              ))}
            </div>
            
            {/* Gradient Overlays for Mobile Scroll - Only visible on small screens */}
            <div className="sm:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
            <div className="sm:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </section>
  );
};
