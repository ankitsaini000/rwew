"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { demoCategoryIcons } from "../../lib/demoImages";
import { getCategories } from "../../services/api";
import {
  Shirt,
  Plane,
  Dumbbell,
  Gamepad2,
  Utensils,
  Monitor,
  Paintbrush,
  Briefcase,
  PiggyBank,
  Palette,
  BookOpen,
  Music,
  Users,
  Globe,
  Star,
  HeartHandshake,
  Sparkles,
  Camera,
  Film,
  ShoppingBag,
  User,
  Layers,
  Smile,
  Sun,
  Leaf,
  // Add more Lucide icons as needed
} from "lucide-react";
import { useRouter } from "next/navigation";

const categoryEmojis: Record<string, string> = {
  "Fashion & Beauty": "👚",
  "Health & Fitness": "💪",
  "Lifestyle": "😊",
  "Travel": "✈️",
  "Food & Beverage": "🍔",
  "Technology & Gadgets": "💻",
  "Gaming": "🎮",
  "Education": "📚",
  "Finance & Business": "💼",
  "Entertainment": "🎬",
  "Parenting & Family": "👨‍👩‍👧‍👦",
  "Automobile": "🚗",
  "Art & Creativity": "🎨",
  "Home & Gardening": "🏡",
  "Pets & Animals": "🐾",
  "Motivation & Spirituality": "🧘",
  "Books": "📖",
  "Books & Literature": "📚",
  "Events & Festivals": "🎉",
  "Environment & Social Causes": "🌱",
  "Others": "🔗",
  // Add more as needed
};

const categoryBgColors: Record<string, string> = {
  "Fashion & Beauty": "bg-pink-50",
  "Travel": "bg-blue-50",
  "Fitness & Health": "bg-green-50",
  "Gaming": "bg-pink-100",
  "Food & Cooking": "bg-yellow-50",
  "Technology": "bg-gray-100",
  "Arts & Crafts": "bg-indigo-50",
  "Finance": "bg-emerald-50",
  "Education": "bg-blue-50",
  "Music": "bg-pink-50",
  "Lifestyle": "bg-orange-50",
  "Business": "bg-gray-50",
  "Art": "bg-indigo-50",
  "Photography": "bg-purple-50",
  "Film": "bg-gray-50",
  "Shopping": "bg-pink-50",
  "Personal": "bg-gray-50",
  "Events": "bg-yellow-50",
  "Social": "bg-blue-50",
  "Global": "bg-green-50",
  "Inspiration": "bg-yellow-50",
  "Nature": "bg-green-50",
  // Add more as needed
};

export const Categories = () => {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryScroll, setCategoryScroll] = React.useState(0);

  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/categories/${encodeURIComponent(category)}`);
  };

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    const container = document.getElementById("categories-container");
    if (container) {
      const scrollAmount = 200;
      const newScroll =
        direction === "left"
          ? categoryScroll - scrollAmount
          : categoryScroll + scrollAmount;

      container.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
      setCategoryScroll(newScroll);
    }
  };

  return (
    <section className="py-6 md:py-16 relative overflow-hidden">
      {/* Enhanced Decorative background */}
      <div className="absolute top-0 right-0 w-40 md:w-80 h-40 md:h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-40 md:w-80 h-40 md:h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute top-1/3 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-3 md:px-4 relative z-10">
        {/* Header with Title and Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-12">
          <h2 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-fadeInRight">
            Choose your Categories
          </h2>
          <div className="flex gap-1 md:gap-2 animate-fadeInLeft">
            <button
              onClick={() => scrollCategories("left")}
              className="p-1 md:p-2 rounded-full bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/40 hover:text-purple-600 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              className="p-1 md:p-2 rounded-full bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/40 hover:text-purple-600 transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Categories Slider */}
        <div className="relative max-w-full md:max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-6 md:py-12 bg-transparent backdrop-blur-sm border border-white/20">Loading categories...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-6 md:py-12 bg-transparent backdrop-blur-sm border border-white/20">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-400 py-6 md:py-12 bg-transparent backdrop-blur-sm border border-white/20">No categories found.</div>
          ) : (
            <div
              id="categories-container"
              className="flex overflow-x-auto scroll-smooth gap-3 md:gap-8 px-2 md:px-4 pb-4 md:pb-0 hide-scrollbar touch-pan-x snap-x snap-mandatory"
            >
              {categories.map((category, idx) => (
                <div
                  key={category.name || category.title || idx}
                  className="flex-shrink-0 w-[100px] md:w-[160px] cursor-pointer group animate-fadeInUp snap-start"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="flex flex-col items-center">
                    {/* Circle with Emoji Icon - Removed white background */}
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-transparent backdrop-blur-sm flex items-center justify-center mb-2 md:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border border-white/20">
                      <span className="text-2xl md:text-4xl">
                        {categoryEmojis[category.name] || "❓"}
                      </span>
                    </div>
                    {/* Category Title */}
                    <span className="text-xs md:text-sm font-medium text-gray-900 text-center">
                      {category.name || category.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gradient Overlays with background color instead of white */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#f5f7ff] to-transparent pointer-events-none opacity-50" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#f5f7ff] to-transparent pointer-events-none opacity-50" />
        </div>
      </div>
    </section>
  );
};
