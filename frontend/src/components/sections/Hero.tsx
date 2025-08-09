"use client";

import { ChevronDown, Search } from "lucide-react";
import { Input } from "../ui/input";
import { categories, stats } from "../../lib/data";
import { demoInfluencerImages } from "../../lib/demoImages";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "../../services/api";

export const Hero = ({ selectedCategory, setSelectedCategory }: { selectedCategory: string; setSelectedCategory: (cat: string) => void }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="md:w-1/2 space-y-8 animate-fadeInRight">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="glass-effect text-purple-700 text-sm font-medium px-4 py-1 rounded-full">
                  #1 Influencer Marketplace
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Where
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  {" "}
                  Creators & Brands
                </span>{" "}
                Connect
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                The perfect platform for influencers to showcase their talent
                and for brands to find their ideal promotional partners.
              </p>
            </div>

            {/* Two-button CTA section */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp animate-delay-200">
              <Link
                href="/register?type=creator"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all text-center"
              >
                Join as Influencer
              </Link>
              <Link
                href="/register?type=brand"
                className="px-6 py-3 glass-button text-purple-600 font-medium rounded-xl hover:bg-white/40 transition-all text-center"
              >
                Register as Brand
              </Link>
            </div>

            {/* Search Section */}
            <div className="glass-card p-3 max-w-xl animate-fadeInUp animate-delay-300">
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    className="appearance-none w-40 px-4 py-3.5 rounded-xl bg-white/50 border-0 text-gray-600 focus:ring-2 focus:ring-purple-600"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Categories</option>
                    {categoriesLoading && <option disabled>Loading...</option>}
                    {categoriesError && <option disabled>{categoriesError}</option>}
                    {!categoriesLoading && !categoriesError && categories.map((category) => (
                      <option key={category.name || category.title} value={category.name || category.title}>
                        {category.name || category.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Search influencers..."
                    className="w-full pl-10 py-3.5 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-purple-600"
                  />
                  <Search className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-12 animate-fadeInUp animate-delay-400">
              {stats.map((stat, index) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Influencer Grid with glass effect */}
          <div className="hidden md:block relative w-1/2 animate-fadeInLeft">
            <div className="grid grid-cols-3 gap-4 p-4">
              {/* First column */}
              <div className="space-y-4">
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-100">
                  <img
                    src={demoInfluencerImages[0]}
                    alt="Influencer"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-200">
                  <img
                    src={demoInfluencerImages[1]}
                    alt="Influencer"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              
              {/* Second column */}
              <div className="space-y-4 pt-8">
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-300">
                  <img
                    src={demoInfluencerImages[2]}
                    alt="Influencer"
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-400">
                  <img
                    src={demoInfluencerImages[3]}
                    alt="Influencer"
                    className="w-full h-40 object-cover"
                  />
                </div>
              </div>
              
              {/* Third column */}
              <div className="space-y-4 pt-16">
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-500">
                  <img
                    src={demoInfluencerImages[4]}
                    alt="Influencer"
                    className="w-full h-36 object-cover"
                  />
                </div>
                <div className="glass-card overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInDown animate-delay-200">
                  <img
                    src={demoInfluencerImages[5]}
                    alt="Influencer"
                    className="w-full h-44 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
