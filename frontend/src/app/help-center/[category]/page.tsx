"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const categories = [
  { id: "guides", name: "Guides" },
  { id: "templates", name: "Templates" },
  { id: "case-studies", name: "Case Studies" },
  { id: "videos", name: "Videos" },
  { id: "webinars", name: "Webinars" },
];

type RelatedArticle = { title: string; href: string };
type ResourceContent = {
  title: string;
  badge: string;
  description: string;
  content: string;
  relatedArticles?: RelatedArticle[];
};

type ResourceContentByCategory = {
  [key: string]: ResourceContent;
};

const resources: ResourceContentByCategory = {
  guides: {
    title: "Ultimate Guide to Influencer Marketing",
    badge: "POPULAR",
    description: "A comprehensive guide to launching successful influencer campaigns.",
    content: `<em>[Full resource content goes here]</em>`,
    relatedArticles: [
      { title: "How to Find the Right Influencer", href: "/help-center/guides/find-right-influencer" },
      { title: "Campaign Analytics 101", href: "/help-center/guides/campaign-analytics" }
    ]
  },
  templates: {
    title: "Brand Collaboration Template",
    badge: "POPULAR",
    description: "Downloadable template for brand-creator collaborations.",
    content: `<strong>Brand Collaboration Agreement</strong><br/><br/>This template helps you formalize your partnership with a brand or creator.<br/><br/><ul><li>Project Overview</li><li>Deliverables</li><li>Timeline</li><li>Payment Terms</li><li>Approval Process</li></ul><br/>Download the full template as a PDF or copy the sections above into your own document.`,
    relatedArticles: [
      { title: "Content Planning Worksheet", href: "/help-center/templates/content-planning-worksheet" }
    ]
  },
  "case-studies": {
    title: "Brand Success Story: Acme Co.",
    badge: "CASE STUDY",
    description: "How Acme Co. grew their audience by 300% using our platform.",
    content: `<em>[Full resource content goes here]</em>`,
    relatedArticles: [
      { title: "How Micro-Influencers Drive ROI", href: "/help-center/case-studies/micro-influencers-roi" }
    ]
  },
  videos: {
    title: "Influencer Marketing 101 (Video)",
    badge: "VIDEO",
    description: "Watch our quick explainer on influencer marketing basics.",
    content: `<video controls width='100%' class='rounded shadow'><source src='/videos/influencer-marketing-101.mp4' type='video/mp4' />Your browser does not support the video tag.</video>`
  },
  webinars: {
    title: "Live Q&A: Influencer Growth (Webinar)",
    badge: "WEBINAR",
    description: "Replay of our May Q&A session with top creators.",
    content: `<em>[Full resource content goes here]</em>`,
    relatedArticles: [
      { title: "Webinar Slides PDF", href: "/downloads/webinar-may-slides.pdf" }
    ]
  }
};

export default function HelpCenterCategoryPage() {
  const params = useParams();
  const router = useRouter();
  if (!params) return null;
  const categoryId = Array.isArray(params.category) ? params.category[0] : params.category;
  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const resource = resources[selectedCategory.id] || resources.guides;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex flex-1 pt-8 px-2 sm:px-4">
          {/* Sidebar */}
          <aside className="w-64 pr-8 hidden md:block">
            <h2 className="text-2xl font-bold mb-8 text-black">Categories</h2>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors text-base ${
                      cat.id === selectedCategory.id
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => router.push(`/help-center/${cat.id}`)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-start justify-start">
            <div className="w-full max-w-3xl">
              <Link href="/help-center" className="text-purple-600 text-base font-medium mb-8 inline-block hover:underline">
                &larr; Back to help center
              </Link>
              <h1 className="text-4xl font-bold text-purple-800 mb-2">{resource.title}</h1>
              <div className="mb-2">
                <span className="bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full text-sm">{resource.badge}</span>
              </div>
              <p className="text-lg text-gray-600 mb-6">{resource.description}</p>
              <div className="bg-white rounded-xl shadow p-8 min-h-[100px] text-gray-500 text-lg border border-gray-100 mb-8">
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              </div>
              {resource.relatedArticles && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-purple-700 mb-2">Related Articles</h2>
                  {resource.relatedArticles.map((article) => (
                    <Link key={article.href} href={article.href} className="text-purple-700 text-lg hover:underline block">
                      {article.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
} 