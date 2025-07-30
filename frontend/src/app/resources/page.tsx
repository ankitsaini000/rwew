"use client";

import React, { useState, useRef, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

const resourceCategories = [
  "Guides",
  "Templates",
  "Case Studies",
  "Videos",
  "Webinars",
];

const featuredResources = [
  {
    id: 1,
    title: "Ultimate Guide to Influencer Marketing",
    description: "A comprehensive guide to launching successful influencer campaigns.",
    category: "Guides",
    featured: true,
  },
  {
    id: 2,
    title: "Brand Collaboration Template",
    description: "Downloadable template for brand-creator collaborations.",
    category: "Templates",
    featured: true,
  },
  {
    id: 3,
    title: "Case Study: Viral Campaign",
    description: "How a creator went viral with a brand partnership.",
    category: "Case Studies",
    featured: true,
  },
];

const allResources = [
  ...featuredResources,
  {
    id: 4,
    title: "Content Planning Worksheet",
    description: "Plan your next campaign with this worksheet.",
    category: "Templates",
    featured: false,
  },
  {
    id: 5,
    title: "Webinar: Social Media Trends 2024",
    description: "Watch our latest webinar on social trends.",
    category: "Webinars",
    featured: false,
  },
  {
    id: 6,
    title: "Video: Creator Success Stories",
    description: "Hear from top creators about their journey.",
    category: "Videos",
    featured: false,
  },
  // Add more as needed
];

const faqData = [
  {
    question: "How do I access resources?",
    answer: "All resources are available to registered users. Simply browse or search to get started.",
  },
  {
    question: "Can I download templates?",
    answer: "Yes, templates and guides are available for download where indicated.",
  },
  {
    question: "How often are new resources added?",
    answer: "We update our resource library monthly with new guides, templates, and case studies.",
  },
];

function FAQAccordion({ data }: { data: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="border rounded-lg bg-white">
          <button
            className="w-full flex justify-between items-center p-4 text-left text-purple-700 font-medium focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <span>{item.question}</span>
            {openIndex === idx ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openIndex === idx && (
            <div className="p-4 pt-0 text-gray-700">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResourcesContent() {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filtered resources based on search and category
  const filteredResources = allResources.filter((res) => {
    const matchesCategory = !activeCategory || res.category === activeCategory;
    const matchesSearch =
      !search ||
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.description.toLowerCase().includes(search.toLowerCase()) ||
      res.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Suggestions: resource titles and category names that match the search
  const categorySuggestions =
    search.length > 0
      ? resourceCategories.filter(cat => cat.toLowerCase().includes(search.toLowerCase()))
      : [];
  const resourceSuggestions =
    search.length > 0
      ? allResources
          .filter((res) =>
            res.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((res) => res.title)
          .slice(0, 5)
      : [];
  const suggestions = [...categorySuggestions, ...resourceSuggestions].slice(0, 5);

  const handleSuggestionClick = (suggestion: string) => {
    // If suggestion is a category, set as activeCategory and clear search
    if (resourceCategories.includes(suggestion)) {
      setActiveCategory(suggestion);
      setSearch("");
      setShowSuggestions(false);
      if (searchRef.current) searchRef.current.blur();
      return;
    }
    // Otherwise, treat as resource title
    setSearch(suggestion);
    setShowSuggestions(false);
    if (searchRef.current) searchRef.current.blur();
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-purple-600 via-purple-300 to-white text-purple-900 py-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center">Resources</h1>
        <p className="max-w-2xl text-center text-lg md:text-xl mb-6">Guides, templates, and case studies to help you succeed on our platform.</p>
        {/* Search Bar with Suggestions */}
        <div className="relative w-full max-w-xl mb-8">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Search resources..."
            className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none text-lg"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-purple-200 rounded-lg shadow-lg mt-1 z-10">
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 cursor-pointer hover:bg-purple-100 text-purple-800"
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {resourceCategories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border font-medium transition-colors text-sm ${activeCategory === cat ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-700 border-purple-300 hover:bg-purple-100"}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>
      {/* Featured Resources */}
      <section className="max-w-5xl mx-auto w-full px-4 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Featured Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredResources.map((res) => (
            <button
              key={res.id}
              onClick={() => router.push(`/resources/${res.id}`)}
              className="bg-white rounded-lg shadow p-6 flex flex-col text-left hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
              tabIndex={0}
              aria-label={`View details for ${res.title}`}
            >
              <h3 className="font-semibold text-lg mb-2 text-purple-700">{res.title}</h3>
              <p className="text-gray-700 mb-2">{res.description}</p>
              <span className="text-xs text-purple-500 font-medium mt-auto">{res.category}</span>
            </button>
          ))}
        </div>
      </section>
      {/* Browse All Resources */}
      <section className="max-w-5xl mx-auto w-full px-4 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Browse All Resources</h2>
        {filteredResources.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No resources found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <button
                key={res.id}
                onClick={() => router.push(`/resources/${res.id}`)}
                className="bg-white rounded-lg shadow p-6 flex flex-col text-left hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
                tabIndex={0}
                aria-label={`View details for ${res.title}`}
              >
                <h3 className="font-semibold text-lg mb-2 text-purple-700">{res.title}</h3>
                <p className="text-gray-700 mb-2">{res.description}</p>
                <span className="text-xs text-purple-500 font-medium mt-auto">{res.category}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      {/* Newsletter CTA */}
      <section className="w-full bg-purple-50 py-10 px-4 flex flex-col items-center mb-12">
        <h2 className="text-2xl font-bold mb-2 text-purple-800">Stay Updated!</h2>
        <p className="mb-4 text-purple-700">Subscribe to our newsletter for the latest resources and platform updates.</p>
        <form className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto w-full px-4 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Frequently Asked Questions</h2>
        <FAQAccordion data={faqData} />
      </section>
      <Footer />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <ResourcesContent />
    </Suspense>
  );
} 