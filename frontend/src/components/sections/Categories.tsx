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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header with Title and Navigation */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Choose your Categories
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCategories("left")}
              className="p-2 rounded-full border border-gray-200 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              className="p-2 rounded-full border border-gray-200 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Slider */}
        <div className="relative max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading categories...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No categories found.</div>
          ) : (
            <div
              id="categories-container"
              className="flex overflow-x-hidden scroll-smooth gap-8 px-4"
            >
              {categories.map((category, idx) => (
                <div
                  key={category.name || category.title || idx}
                  className="flex-shrink-0 w-[160px] cursor-pointer group"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="flex flex-col items-center">
                    {/* Circle with Emoji Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${categoryBgColors[category.name] || "bg-gray-50"}`}>
                      <span className="text-4xl">
                        {categoryEmojis[category.name] || "❓"}
                      </span>
                    </div>
                    {/* Category Title */}
                    <span className="text-sm font-medium text-gray-900 text-center">
                      {category.name || category.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
