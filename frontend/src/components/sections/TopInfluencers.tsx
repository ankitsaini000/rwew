"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getCategories, getFilteredCreators } from "../../services/api";
import CreatorCard from "../creator/CreatorCard";

export const TopInfluencers = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setCreators(res.creators || []);
      } catch (err) {
        setError("Failed to load creators");
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, [selectedCategory]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Top Creators</h2>
            <p className="text-gray-600 mt-2">
              Work with talented creators from around the world
            </p>
          </div>
          <button className="text-gray-600 hover:text-purple-600 font-medium">
            View All Creators
          </button>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            <button
              key="All"
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === "All"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"}
              `}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === cat.name
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"}
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading creators...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No creators found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {creators.map((creator) => (
              <div key={creator.id || creator._id || creator.username} className="w-full max-w-[280px]">
                <CreatorCard
                  id={creator.id || creator._id || creator.username}
                  username={creator.username || creator.personalInfo?.username || ''}
                  fullName={creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || ''}
                  avatar={creator.avatar || creator.personalInfo?.profileImage}
                  categories={creator.professionalInfo?.categories || (creator.category ? [creator.category] : [])}
                  level={creator.level || creator.professionalInfo?.title}
                  description={creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription}
                  rating={creator.rating || creator.metrics?.ratings?.average || 0}
                  reviewCount={creator.reviewCount || creator.metrics?.ratings?.count || 0}
                  startingPrice={typeof creator.startingPrice === 'string' || typeof creator.startingPrice === 'number'
                    ? creator.startingPrice
                    : (typeof creator.pricing?.basic === 'number' ? `₹${creator.pricing.basic}` : undefined)}
                  isLiked={false}
                  title={creator.title || creator.professionalInfo?.title}
                  completedProjects={creator.completedProjects}
                  socialMedia={{
                    instagram: creator.socialMedia?.socialProfiles?.instagram?.url || '',
                    twitter: creator.socialMedia?.socialProfiles?.twitter?.url || '',
                    linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || '',
                    youtube: creator.socialMedia?.socialProfiles?.youtube?.url || '',
                    facebook: creator.socialMedia?.socialProfiles?.facebook?.url || '',
                    tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url || '',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
