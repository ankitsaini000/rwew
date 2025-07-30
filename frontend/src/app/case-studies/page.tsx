"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    brand: "Glow Cosmetics",
    brandLogo: "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
    creator: "@beautybyjane",
    creatorAvatar: "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
    platform: "Instagram",
    industry: "Fashion",
    brandType: "D2C",
    headline: "10x Sales Growth in 3 Months",
    summary: "A beauty brand partnered with a micro-influencer to launch a viral campaign, resulting in a 10x sales increase.",
    metrics: "+900% sales, 2M reach",
    testimonial: "Working with Jane was a game-changer for our brand!",
    images: ["https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg"],
    video: "",
    quote: "Jane's authenticity drove real results!",
    rating: 4.9,
  },
  {
    id: 2,
    brand: "FitFuel",
    brandLogo: "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
    creator: "@fitwithmike",
    creatorAvatar: "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
    platform: "YouTube",
    industry: "Fitness",
    brandType: "Startup",
    headline: "Brand Awareness Boosted by 500%",
    summary: "A fitness brand leveraged YouTube content to build trust and awareness, gaining 10k+ new followers.",
    metrics: "+500% brand mentions, 10k followers",
    testimonial: "Mike's videos brought our message to life.",
    images: ["https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg"],
    video: "",
    quote: "FitFuel is now a household name!",
    rating: 4.8,
  },
  // Add more case studies as needed
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
  "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
  "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
  "https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg",
];

const faqData = [
  { question: "How are case studies selected?", answer: "We feature real collaborations with measurable results and verified testimonials." },
  { question: "Can I submit my case study?", answer: "Yes! Reach out to our team to share your success story." },
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

export default function CaseStudiesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(null);
  const [modalStudy, setModalStudy] = useState<any | null>(null);

  // Filter case studies
  const filteredStudies = caseStudies
    .filter((s) =>
      (!selectedPlatform || s.platform === selectedPlatform) &&
      (!selectedIndustry || s.industry === selectedIndustry) &&
      (!selectedBrandType || s.brandType === selectedBrandType)
    );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-purple-700 via-purple-300 to-white text-white py-16 px-4 flex flex-col items-center relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Case Studies</h1>
        <p className="max-w-2xl text-center text-lg md:text-xl mb-8">See how real brands and creators achieved success on our platform.</p>
        <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: 'url(https://stat4.bollywoodhungama.in/wp-content/uploads/2024/09/Bhuvan_Bam_On_BB_Ki_Vines_Crossing_5_Billion_Views.jpg)' }} />
      </section>
      {/* Filter Bar */}
      <section className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-4 justify-center items-center bg-white rounded-lg shadow -mt-10 z-10 relative">
        <div>
          <label className="font-medium text-purple-700 mr-2">Brand Type:</label>
          <select className="rounded border px-2 py-1" value={selectedBrandType || ""} onChange={e => setSelectedBrandType(e.target.value || null)}>
            <option value="">All</option>
            {brandTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
        <div>
          <label className="font-medium text-purple-700 mr-2">Platform:</label>
          <select className="rounded border px-2 py-1" value={selectedPlatform || ""} onChange={e => setSelectedPlatform(e.target.value || null)}>
            <option value="">All</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="font-medium text-purple-700 mr-2">Industry:</label>
          <select className="rounded border px-2 py-1" value={selectedIndustry || ""} onChange={e => setSelectedIndustry(e.target.value || null)}>
            <option value="">All</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </section>
      {/* Case Studies Grid */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredStudies.map(study => (
            <button
              key={study.id}
              onClick={() => setModalStudy(study)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label={`View details for ${study.headline}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img src={study.creatorAvatar} alt="creator" className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
                <span className="font-semibold text-purple-700">{study.creator}</span>
                <img src={study.brandLogo} alt="brand" className="w-8 h-8 rounded object-contain ml-auto" />
              </div>
              <div className="font-bold text-purple-700 text-lg mb-1">{study.headline}</div>
              <div className="text-gray-700 mb-2">{study.summary}</div>
              <div className="text-xs text-purple-500 font-medium mb-1">{study.metrics}</div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>{study.platform}</span>
                <span>{study.industry}</span>
                <span>{study.brandType}</span>
              </div>
            </button>
          ))}
        </div>
        {filteredStudies.length === 0 && <div className="text-center text-gray-500 py-12">No case studies found for selected filters.</div>}
      </section>
      {/* Case Study Details Modal */}
      {modalStudy && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 relative flex flex-col items-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-purple-600" onClick={() => setModalStudy(null)} aria-label="Close"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-4">
              <img src={modalStudy.creatorAvatar} alt="creator" className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
              <span className="font-semibold text-purple-700">{modalStudy.creator}</span>
              <img src={modalStudy.brandLogo} alt="brand" className="w-10 h-10 rounded object-contain ml-auto" />
            </div>
            <img src={modalStudy.images?.[0] || ''} alt="study" className="w-full h-40 object-cover rounded mb-4" />
            <div className="font-bold text-purple-700 text-2xl mb-2 text-center">{modalStudy.headline}</div>
            <div className="text-gray-700 text-center mb-2">{modalStudy.summary}</div>
            <div className="text-xs text-purple-500 font-medium mb-1">{modalStudy.metrics}</div>
            <div className="mb-2 text-sm text-gray-600">{modalStudy.testimonial}</div>
            <div className="italic text-purple-700 mb-2">“{modalStudy.quote}”</div>
            {modalStudy.video && <video src={modalStudy.video} controls className="w-full rounded mb-2" />}
            <div className="text-xs text-gray-400">Platform: {modalStudy.platform} | Industry: {modalStudy.industry} | Brand Type: {modalStudy.brandType}</div>
          </div>
        </div>
      )}
      {/* CTA Banner */}
      <section className="w-full bg-purple-600 py-10 px-4 flex flex-col items-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Create Your Own Success?</h2>
        <p className="mb-4">Join our platform and start building your own case study today.</p>
        <button className="px-8 py-3 rounded-lg bg-white text-purple-700 font-semibold hover:bg-purple-100 transition">Get Started</button>
      </section>
      {/* Quote Wall / Logo Cloud */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12 flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 w-full">
          {quotes.map((q, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 text-center text-purple-700 font-semibold italic">“{q.text}”<div className="text-xs text-gray-500 mt-2">— {q.author}</div></div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 justify-center items-center">
          {logos.map((logo, idx) => (
            <img key={idx} src={logo} alt="logo" className="h-10 object-contain" />
          ))}
        </div>
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