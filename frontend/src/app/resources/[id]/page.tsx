"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const resourceCategories = [
  "Guides",
  "Templates",
  "Case Studies",
  "Videos",
  "Webinars",
];

const allResources = [
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
];

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id;

  // Find the resource by id (string/number)
  const resource = useMemo(() =>
    allResources.find(r => String(r.id) === String(resourceId)),
    [resourceId]
  );

  // Related articles (same category, not current)
  const related = useMemo(() =>
    resource ? allResources.filter(r => r.category === resource.category && r.id !== resource.id) : [],
    [resource]
  );

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-2xl text-gray-500 mb-4">Resource not found.</div>
          <button onClick={() => router.push('/resources')} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Back to Resources</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 py-8 gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="mb-8">
            <button onClick={() => router.push('/resources')} className="text-purple-600 hover:underline text-sm mb-4">← Back to Resources</button>
          </div>
          <div className="font-bold text-lg mb-4">Categories</div>
          <ul className="space-y-2">
            {resourceCategories.map(cat => (
              <li key={cat}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${cat === resource.category ? 'bg-purple-100 text-purple-700' : 'hover:bg-purple-50 text-gray-700'}`}
                  onClick={() => {
                    if (cat !== resource.category) {
                      const firstResource = allResources.find(r => r.category === cat);
                      if (firstResource) {
                        router.push(`/resources/${firstResource.id}`);
                      }
                    }
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Main Content */}
        <main className="flex-1 max-w-2xl mx-auto">
          <div className="mb-4 md:hidden">
            <button onClick={() => router.push('/resources')} className="text-purple-600 hover:underline text-sm">← Back to Resources</button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-purple-800">{resource.title}</h1>
          {resource.featured && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded mb-2 align-middle ml-2">POPULAR</span>}
          <div className="text-gray-700 mb-6">{resource.description}</div>
          {/* Placeholder for full content */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-gray-500 italic">[Full resource content goes here]</div>
          </div>
          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-8">
              <div className="font-semibold text-lg mb-2 text-purple-700">Related Articles</div>
              <ul className="space-y-2">
                {related.map(r => (
                  <li key={r.id}>
                    <button
                      className="text-purple-700 hover:underline text-left"
                      onClick={() => router.push(`/resources/${r.id}`)}
                    >
                      {r.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
} 