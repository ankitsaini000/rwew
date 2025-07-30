'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CategoryCard } from '@/components/category-card';
import CreatorCard from '@/components/creator/CreatorCard';
import { ChevronDown, ChevronUp, ArrowDown } from 'lucide-react';
import { getCategories } from '@/services/api';
import { useRouter } from 'next/navigation';

// Dummy data for creators (replace with real data as needed)

const steps = [
  {
    icon: '1',
    title: 'Browse & Discover',
    description: 'Explore our curated list of creators and brands. Use filters to find the perfect match.'
  },
  {
    icon: '2',
    title: 'Connect & Chat',
    description: 'Message directly on our platform to discuss ideas, requirements, and expectations.'
  },
  {
    icon: '3',
    title: 'Place Your Order',
    description: 'Book services or collaborations securely through our platform with transparent pricing.'
  },
  {
    icon: '4',
    title: 'Review & Grow',
    description: 'Leave feedback, build relationships, and grow your network for future opportunities.'
  }
];

const features = [
  {
    icon: '💬',
    title: 'Direct Messaging',
    description: 'Communicate easily and keep all project details in one place.'
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: 'All transactions are protected until you approve the work.'
  },
  {
    icon: '✅',
    title: 'Verified Profiles',
    description: 'Look for verified badges for extra trust and security.'
  },
  {
    icon: '🎯',
    title: 'Custom Offers',
    description: 'Negotiate and receive custom offers tailored to your needs.'
  }
];

const trustBadges = [
  { icon: '🛡️', text: 'Trusted by 10,000+ users' },
  { icon: '💳', text: 'Secure payment system' },
  { icon: '⭐', text: 'Top-rated support' },
];

const ctaCards = [
  {
    icon: '🔍',
    heading: 'Search our catalog',
    subtext: 'Find creators and brands by category, expertise, or price.',
    link: '/find-creators',
  },
  {
    icon: '🎁',
    heading: 'Get tailored offers',
    subtext: 'Receive custom proposals that fit your project needs.',
    link: '/creator-profile-edit',
  },
  {
    icon: '📅',
    heading: 'Schedule a consultation',
    subtext: 'Book a call to discuss your project in detail.',
    link: '/contact-us',
  },
];

const faqs = [
  {
    q: 'How do I find the right creator or brand?',
    a: 'Use our search and filter tools to browse profiles, portfolios, and reviews to find your best match.'
  },
  {
    q: 'Is payment secure?',
    a: 'Yes, all payments are held securely until you approve the work.'
  },
  {
    q: 'Can I communicate before booking?',
    a: 'Absolutely! Use our messaging system to discuss your project before making any commitments.'
  },
  {
    q: 'What if I need help?',
    a: 'Our support team is here to assist you at every step.'
  }
];

function FAQAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={faq.q} className="border rounded-lg bg-white">
          <button
            className="w-full flex justify-between items-center p-4 text-left font-medium text-green-900 focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
            aria-controls={`faq-panel-${idx}`}
          >
            <span>{faq.q}</span>
            {openIndex === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {openIndex === idx && (
            <div id={`faq-panel-${idx}`} className="p-4 pt-0 text-gray-700 border-t">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Use a demo video URL
const demoVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

// Emoji mapping for categories
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

export default function HowItWorksPage() {
  // Fetch categories from backend
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setCategoriesError('Failed to load categories');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-purple-600 via-purple-300 to-white text-white py-12 px-4 flex flex-col items-center relative">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center text-purple-100">How Our Platform Works</h1>
        <p className="max-w-2xl text-center text-lg md:text-xl mb-8 text-purple-200">Discover how to connect, collaborate, and grow with our seamless creator-brand marketplace.</p>
        {/* Demo Video */}
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
          <video
            src={demoVideoUrl}
            controls
            className="w-full rounded-lg shadow-lg bg-black"
            style={{ maxHeight: 360 }}
          />
          <span className="mt-2 text-purple-100 text-sm opacity-80">Watch this quick demo to see how it works!</span>
        </div>
        {/* Scroll Indicator */}
        <div className="flex flex-col items-center mt-2">
          <span className="text-xs text-purple-100">Check it out</span>
          <ArrowDown className="w-6 h-6 animate-bounce mt-1 text-purple-200" />
        </div>
      </section>

      {/* Step-by-Step Process Section */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8 text-purple-700">4 Simple Steps to Your Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {steps.map((step, idx) => (
            <div key={step.title} className="bg-purple-50 rounded-lg shadow p-6 flex flex-col items-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{step.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-center text-purple-700">{step.title}</h3>
              <p className="text-center text-gray-700 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <a href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">Get Started</a>
        </div>
      </section>

      {/* Feature Highlights / Tips Section */}
      <section className="w-full bg-purple-50 py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8 text-purple-700">Tips for Success</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map(feature => (
            <div key={feature.title} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="text-3xl mb-2 text-purple-600">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-purple-700">{feature.title}</h3>
              <p className="text-center text-gray-700 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Assurance Section */}
      <section className="w-full py-8 px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
          {trustBadges.map(badge => (
            <div key={badge.text} className="flex items-center gap-3 bg-purple-50 rounded-lg px-6 py-4 shadow">
              <span className="text-2xl text-purple-600">{badge.icon}</span>
              <span className="font-medium text-purple-900">{badge.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ctaCards.map(card => (
            <a key={card.heading} href={card.link} className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-md transition">
              <div className="text-3xl mb-2 text-purple-600">{card.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-purple-700">{card.heading}</h3>
              <p className="text-center text-gray-700 text-sm mb-2">{card.subtext}</p>
              <span className="text-purple-800 font-medium mt-auto">Learn more &rarr;</span>
            </a>
          ))}
        </div>
      </section>

      {/* Category Browser Section */}
      <section className="w-full bg-purple-50 py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-2 text-purple-700">Browse Categories</h2>
        <p className="text-center text-purple-600 mb-8">Find inspiration for your next project by exploring our most popular categories.</p>
        {categoriesLoading ? (
          <div className="text-center text-gray-500 py-8">Loading categories...</div>
        ) : categoriesError ? (
          <div className="text-center text-red-500 py-8">{categoriesError}</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No categories found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {categories.map((category: any) => {
              const name = category.name || category.title || "";
              const emoji = categoryEmojis[normalizeCategoryName(name)] || "❓";
              return (
                <CategoryCard
                  key={category._id || name}
                  icon={emoji}
                  title={name}
                  onClick={() => router.push(`/categories/${encodeURIComponent(normalizeCategoryName(name))}`)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold text-center mb-8 text-purple-700">FAQs</h2>
        <FAQAccordion faqs={faqs} />
      </section>

      <Footer />
    </div>
  );
} 