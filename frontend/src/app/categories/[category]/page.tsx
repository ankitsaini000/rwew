"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategories, getFilteredCreators } from "@/services/api";
import { ChevronLeft, Star, Users, Sparkles } from "lucide-react";
import CreatorCard, { CreatorCardProps } from '@/components/creator/CreatorCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';


const categoryIcons: Record<string, string> = {
  "Fashion & Beauty": "👗",
  "Travel": "✈️",
  "Fitness & Health": "💪",
  "Health & Fitness": "💪",
  "Tech": "💻",
  "Technology & Gadgets": "💻",
  "Music": "🎵",
  "Gaming": "🎮",
  "Food & Cooking": "🍳",
  "Food & Beverage": "🍳",
  "Education": "📚",
  "Lifestyle": "🌟",
  "Finance & Business": "💼",
  "Entertainment": "🎬",
  "Parenting & Family": "👨‍👩‍👧‍👦",
  "Automobile": "🚗",
  "Art & Creativity": "🎨",
  "Home & Gardening": "🏡",
  "Pets & Animals": "🐾",
  "Motivation & Spirituality": "🧘",
  "Books & Literature": "📖",
  "Events & Festivals": "🎉",
  "Environment & Social Causes": "🌱",
  "Others": "📁"
};

function normalizeCategoryName(name: string): string {
  if (!name) return "Others";
  const n = name.toLowerCase();
  if (["tech", "technology", "technology & gadgets"].includes(n)) return "Technology & Gadgets";
  if (["food & cooking", "food & beverage"].includes(n)) return "Food & Beverage";
  if (["fitness & health", "health & fitness"].includes(n)) return "Health & Fitness";
  if (["art", "creativity", "art & creativity"].includes(n)) return "Art & Creativity";
  if (["parenting", "family", "parenting & family"].includes(n)) return "Parenting & Family";
  if (["home", "gardening", "home & gardening"].includes(n)) return "Home & Gardening";
  if (["motivation", "spirituality", "motivation & spirituality"].includes(n)) return "Motivation & Spirituality";
  if (["books", "literature", "books & literature"].includes(n)) return "Books & Literature";
  if (["events", "festivals", "events & festivals"].includes(n)) return "Events & Festivals";
  if (["environment", "social causes", "environment & social causes"].includes(n)) return "Environment & Social Causes";
  return name;
}

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  if (!params || !params.category) {
    return <div className="text-center py-20 text-gray-500 text-lg">Loading...</div>;
  }
  const categoryParam = decodeURIComponent(params.category as string);
  const [category, setCategory] = useState<any>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreCreators, setMoreCreators] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const cats = await getCategories();
      const found = cats.find((c: any) => normalizeCategoryName(c.name) === categoryParam);
      setCategory(found);
      const creatorsRes = await getFilteredCreators({ category: categoryParam, limit: 12 });
      setCreators(creatorsRes.creators || []);
      let moreRes = await getFilteredCreators({ category: categoryParam, limit: 24 });
      let more = moreRes.creators || [];
      // Fallback: If no more creators in this category, show from all categories
      if (more.length === 0) {
        moreRes = await getFilteredCreators({ limit: 24 });
        more = moreRes.creators || [];
      }
      setMoreCreators(more);
      setLoading(false);
    }
    fetchData();
  }, [categoryParam]);

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pb-16">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-b-3xl shadow-lg mb-10">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-10 flex flex-col sm:flex-row items-center gap-6">
          <button
            className="absolute left-4 top-8 flex items-center gap-2 text-white hover:underline z-10"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <span className="text-6xl sm:text-7xl drop-shadow-lg">{categoryIcons[normalizeCategoryName(category?.name)] || "📁"}</span>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 drop-shadow-lg flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-7 h-7 text-yellow-200 animate-pulse" />
              {normalizeCategoryName(category?.name || categoryParam)}
            </h1>
            <p className="text-purple-100 text-lg font-medium mb-2">
              {category?.subcategories?.length || 0} subcategories
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {category?.subcategories?.map((sub: any) => (
                <span key={sub.name} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/30 backdrop-blur-sm">
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">
          Top Creators in {normalizeCategoryName(category?.name || categoryParam)}
        </h2>
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">Loading...</div>
        ) : !category ? (
          <div className="text-center py-20 text-red-500 text-lg">Category not found</div>
        ) : creators.length === 0 ? (
          <div className="text-gray-400 text-center py-10">No creators found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator: any) => {
              const cardProps: CreatorCardProps = {
                id: creator.id || creator._id || creator.username,
                username: creator.username || creator.personalInfo?.username || '',
                fullName: creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || '',
                avatar: creator.avatar || creator.personalInfo?.profileImage,
                categories: creator.categories,
                level: creator.level || creator.professionalInfo?.title,
                description: creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription,
                rating: typeof creator.rating === 'number' ? creator.rating : 
                        (typeof creator.metrics?.ratings?.average === 'number' ? creator.metrics.ratings.average : 0),
                reviewCount: typeof creator.reviewCount === 'number' ? creator.reviewCount :
                           (typeof creator.reviews === 'number' ? creator.reviews :
                           (typeof creator.metrics?.ratings?.count === 'number' ? creator.metrics.ratings.count : 0)),
                startingPrice: creator.startingPrice || (creator.pricing?.basic ? `₹${creator.pricing.basic}` : undefined),
                isLiked: false,
                title: creator.title || creator.professionalInfo?.title,
                socialMedia: creator.socialMedia,
              };
              return (
                <CreatorCard key={cardProps.id} {...cardProps} />
              );
            })}
          </div>
        )}
      </div>

      {/* More Creators Section */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">
          Discover More Creators
        </h2>
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">Loading...</div>
        ) : moreCreators.length === 0 ? (
          <div className="text-gray-400 text-center py-10">No more creators found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {moreCreators.map((creator: any) => {
              const cardProps: CreatorCardProps = {
                id: creator.id || creator._id || creator.username,
                username: creator.username || creator.personalInfo?.username || '',
                fullName: creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || '',
                avatar: creator.avatar || creator.personalInfo?.profileImage,
                categories: creator.categories,
                level: creator.level || creator.professionalInfo?.title,
                description: creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription,
                rating: typeof creator.rating === 'number' ? creator.rating : 
                        (typeof creator.metrics?.ratings?.average === 'number' ? creator.metrics.ratings.average : 0),
                reviewCount: typeof creator.reviewCount === 'number' ? creator.reviewCount :
                           (typeof creator.reviews === 'number' ? creator.reviews :
                           (typeof creator.metrics?.ratings?.count === 'number' ? creator.metrics.ratings.count : 0)),
                startingPrice: creator.startingPrice || (creator.pricing?.basic ? `₹${creator.pricing.basic}` : undefined),
                isLiked: false,
                title: creator.title || creator.professionalInfo?.title,
                socialMedia: creator.socialMedia,
              };
              return (
                <CreatorCard key={cardProps.id} {...cardProps} />
              );
            })}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}