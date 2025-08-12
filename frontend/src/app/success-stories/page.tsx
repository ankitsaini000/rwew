"use client";

import React, { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronDown,
  ChevronUp,
  X,
  Star,
  PlayCircle,
  Building2,
  Hash,
  Globe,
  Rocket,
} from "lucide-react";
import { demoInfluencerImages, demoBrandLogos } from "@/lib/demoImages";

const mockStories = [
  {
    id: 1,
    brand: "Glow Cosmetics",
    brandLogo: demoBrandLogos[0],
    creator: "@beautybyjane",
    creatorAvatar: demoInfluencerImages[0],
    platform: "Instagram",
    industry: "Fashion",
    brandType: "D2C",
    headline: "10x Sales Growth in 3 Months",
    summary: "A beauty brand partnered with a micro-influencer to launch a viral campaign, resulting in a 10x sales increase.",
    metrics: "+900% sales, 2M reach",
    testimonial: "Working with Jane was a game-changer for our brand!",
    images: [demoInfluencerImages[1]],
    video: "",
    quote: "Jane's authenticity drove real results!",
    rating: 4.9,
  },
  {
    id: 2,
    brand: "FitFuel",
    brandLogo: demoBrandLogos[2],
    creator: "@fitwithmike",
    creatorAvatar: demoInfluencerImages[2],
    platform: "YouTube",
    industry: "Fitness",
    brandType: "Startup",
    headline: "Brand Awareness Boosted by 500%",
    summary: "A fitness brand leveraged YouTube content to build trust and awareness, gaining 10k+ new followers.",
    metrics: "+500% brand mentions, 10k followers",
    testimonial: "Mike's videos brought our message to life.",
    images: [demoInfluencerImages[3]],
    video: "",
    quote: "FitFuel is now a household name!",
    rating: 4.8,
  },
  {
    id: 3,
    brand: "TechHive",
    brandLogo: demoBrandLogos[5],
    creator: "@alex_tech",
    creatorAvatar: demoInfluencerImages[4],
    platform: "YouTube",
    industry: "Tech",
    brandType: "Enterprise",
    headline: "2M Views Product Launch",
    summary: "TechHive partnered with Alex for a deep-dive launch video and live Q&A.",
    metrics: "2M views, 150k clicks",
    testimonial: "The engagement exceeded our expectations.",
    images: [demoInfluencerImages[5]],
    video: "",
    quote: "A flawless launch with massive impact.",
    rating: 4.7,
  },
  {
    id: 4,
    brand: "TravelGo",
    brandLogo: demoBrandLogos[4],
    creator: "@wanderlisa",
    creatorAvatar: demoInfluencerImages[1],
    platform: "Instagram",
    industry: "Travel",
    brandType: "Startup",
    headline: "Destination Campaign Sells Out",
    summary: "A reels-first approach sold out limited travel packages in 1 week.",
    metrics: "+1.2M reach, 800 packages",
    testimonial: "Lisa's content converted like crazy!",
    images: [demoInfluencerImages[2]],
    video: "",
    quote: "Story-driven content delivers.",
    rating: 4.8,
  },
  {
    id: 5,
    brand: "FreshBite",
    brandLogo: demoBrandLogos[3],
    creator: "@chefmarco",
    creatorAvatar: demoInfluencerImages[0],
    platform: "TikTok",
    industry: "Food",
    brandType: "D2C",
    headline: "Recipe Series Drives Subscriptions",
    summary: "Short-form recipe series boosted meal-kit subscriptions.",
    metrics: "+65% subs, 600k saves",
    testimonial: "Snackable videos that sell.",
    images: [demoInfluencerImages[3]],
    video: "",
    quote: "Tasty content, tasty ROI.",
    rating: 4.6,
  },
  {
    id: 6,
    brand: "WellnessCo",
    brandLogo: demoBrandLogos[1],
    creator: "@mindfulmia",
    creatorAvatar: demoInfluencerImages[5],
    platform: "Blog",
    industry: "Fitness",
    brandType: "Agency",
    headline: "SEO Collab Brings Evergreen Traffic",
    summary: "Long-form blog collab ranking on page one for key terms.",
    metrics: "+300% organic traffic",
    testimonial: "Sustainable growth through content.",
    images: [demoInfluencerImages[4]],
    video: "",
    quote: "Evergreen wins.",
    rating: 4.7,
  },
  // Add more stories as needed
];

const platforms = ["Instagram", "YouTube", "TikTok", "Blog", "Podcast"];
const industries = ["Fashion", "Tech", "Food", "Fitness", "Travel"];
const brandTypes = ["Startup", "Enterprise", "D2C", "Agency"];

const quotes = [
  { text: "This platform changed our business!", author: "Brand CEO" },
  { text: "I found my dream collaborations here.", author: "Top Creator" },
  { text: "The results speak for themselves.", author: "Marketing Lead" },
];

const logos = [
  "/uploads/images/logo1.jpg",
  "/uploads/images/logo2.jpg",
  "/uploads/images/logo3.jpg",
];

const faqData = [
  { question: "How are success stories selected?", answer: "We feature real collaborations with measurable results and verified testimonials." },
  { question: "Can I submit my story?", answer: "Yes! Reach out to our team to share your success." },
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

export default function SuccessStoriesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(null);
  const [modalStory, setModalStory] = useState<any | null>(null);

  const filteredStories = useMemo(
    () =>
      mockStories.filter(
        (s) =>
          (!selectedPlatform || s.platform === selectedPlatform) &&
          (!selectedIndustry || s.industry === selectedIndustry) &&
          (!selectedBrandType || s.brandType === selectedBrandType)
      ),
    [selectedPlatform, selectedIndustry, selectedBrandType]
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_300px_at_20%_0%,rgba(168,85,247,0.15),transparent),radial-gradient(800px_300px_at_80%_100%,rgba(236,72,153,0.15),transparent)]" />
        <div className="container mx-auto px-4 py-14 md:py-18 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-3 py-1 text-xs font-semibold text-purple-700">
            <Globe className="h-3.5 w-3.5" /> Real results from real collabs
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Success Stories
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-600 text-lg">
            See how brands and creators achieved measurable growth using our platform.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-4 md:-mt-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-purple-600" /> Brand Type</label>
            <select className="mt-1 w-full rounded-lg border-gray-200 text-sm" value={selectedBrandType || ""} onChange={(e) => setSelectedBrandType(e.target.value || null)}>
              <option value="">All</option>
              {brandTypes.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Hash className="h-4 w-4 text-purple-600" /> Platform</label>
            <select className="mt-1 w-full rounded-lg border-gray-200 text-sm" value={selectedPlatform || ""} onChange={(e) => setSelectedPlatform(e.target.value || null)}>
              <option value="">All</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Rocket className="h-4 w-4 text-purple-600" /> Industry</label>
            <select className="mt-1 w-full rounded-lg border-gray-200 text-sm" value={selectedIndustry || ""} onChange={(e) => setSelectedIndustry(e.target.value || null)}>
              <option value="">All</option>
              {industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <button
              key={story.id}
              onClick={() => setModalStory(story)}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-gray-100/70 shadow-sm hover:shadow-md transition-all text-left"
              aria-label={`View details for ${story.headline}`}
            >
              <div className="rounded-2xl bg-white p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <img src={story.creatorAvatar} alt="creator" className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100" />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{story.creator}</div>
                    <div className="text-xs text-gray-500 truncate">{story.platform} • {story.industry}</div>
                  </div>
                  <img src={story.brandLogo} alt="brand" className="w-8 h-8 rounded object-cover ml-auto ring-2 ring-purple-50" />
                </div>
                <div className="rounded-xl overflow-hidden bg-gray-50">
                  <img src={story.images?.[0] || "/uploads/images/guide1.jpg"} alt="story" className="w-full h-36 object-cover" />
                </div>
                <div className="mt-3 font-bold text-gray-900">{story.headline}</div>
                <div className="mt-1 text-sm text-gray-600 line-clamp-2">{story.summary}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-purple-700 font-medium">
                  <Star className="h-4 w-4 text-yellow-500" /> {story.metrics}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">{story.brandType}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100">{story.platform}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100">{story.industry}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {filteredStories.length === 0 && (
          <div className="text-center text-gray-500 py-12">No stories found for selected filters.</div>
        )}
      </section>

      {/* Modal */}
      {modalStory && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-purple-600" onClick={() => setModalStory(null)} aria-label="Close">
              <X size={22} />
            </button>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={modalStory.creatorAvatar} alt="creator" className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100" />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{modalStory.creator}</div>
                  <div className="text-xs text-gray-500 truncate">{modalStory.platform} • {modalStory.industry}</div>
                </div>
                <img src={modalStory.brandLogo} alt="brand" className="w-10 h-10 rounded object-cover ml-auto ring-2 ring-purple-50" />
              </div>
              <div className="rounded-xl overflow-hidden bg-gray-50">
                <img src={modalStory.images?.[0] || "/uploads/images/guide1.jpg"} alt="story" className="w-full h-56 object-cover" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">{modalStory.headline}</h3>
              <p className="mt-2 text-gray-700">{modalStory.summary}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-purple-700 font-semibold">
                <Star className="h-5 w-5 text-yellow-500" /> {modalStory.metrics}
              </div>
              {modalStory.video && (
                <div className="mt-3 rounded-xl overflow-hidden bg-black/5">
                  <video src={modalStory.video} controls className="w-full" />
                </div>
              )}
              <blockquote className="mt-3 italic text-purple-700">“{modalStory.quote}”</blockquote>
              <div className="mt-3 text-xs text-gray-500">Brand Type: {modalStory.brandType}</div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/10 via-fuchsia-600/10 to-indigo-600/10" />
        <div className="container mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Start Your Success Story</h2>
          <p className="mt-2 text-gray-600">Ready to achieve real results? Join and connect with top creators and brands.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-md hover:brightness-110">
            <PlayCircle className="h-5 w-5" /> Get Started
          </button>
        </div>
      </section>

      {/* Quotes and Logos */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quotes.map((q, idx) => (
            <div key={idx} className="rounded-xl bg-white p-6 shadow text-center text-purple-700 font-semibold italic">
              “{q.text}”
              <div className="text-xs text-gray-500 mt-2">— {q.author}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 justify-center items-center">
          {logos.map((logo, idx) => (
            <img key={idx} src={logo} alt="logo" className="h-10 object-contain" />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Frequently Asked Questions</h2>
        <FAQAccordion data={faqData} />
      </section>

      <Footer />
    </div>
  );
}