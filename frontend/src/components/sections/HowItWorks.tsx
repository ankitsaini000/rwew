"use client";

import { useState } from "react";
import { ChevronRight, Award, Users } from "lucide-react";
import { demoProcessImages } from "../../lib/demoImages";

export const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<"influencer" | "brand">(
    "influencer"
  );

  const influencerSteps = [
    {
      title: "Create Your Profile",
      description:
        "Sign up and build a compelling profile showcasing your work, audience demographics, and engagement metrics.",
      image: demoProcessImages.influencer[0],
    },
    {
      title: "Get Discovered",
      description:
        "Brands will find you through our search system or you can apply to open campaign opportunities.",
      image: demoProcessImages.influencer[1],
    },
    {
      title: "Collaborate on Campaigns",
      description:
        "Accept proposals from brands, negotiate terms, and agree on deliverables.",
      image: demoProcessImages.influencer[2],
    },
    {
      title: "Get Paid Securely",
      description:
        "Complete your content deliverables and receive payment through our secure platform.",
      image: demoProcessImages.influencer[3],
    },
  ];

  const brandSteps = [
    {
      title: "Define Your Campaign",
      description:
        "Create detailed campaign briefs with your goals, target audience, and budget.",
      image: demoProcessImages.brand[0],
    },
    {
      title: "Find Perfect Matches",
      description:
        "Search for influencers based on niche, audience demographics, engagement rates, and more.",
      image: demoProcessImages.brand[1],
    },
    {
      title: "Manage Collaborations",
      description:
        "Send proposals, negotiate terms, and track all your campaign collaborations in one place.",
      image: demoProcessImages.brand[2],
    },
    {
      title: "Measure Results",
      description:
        "Track campaign performance with detailed analytics and ROI metrics.",
      image: demoProcessImages.brand[3],
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">How it works</h2>
          <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            A simple, step-by-step flow for influencers and brands to start and succeed.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setActiveTab("influencer")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "influencer" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-pressed={activeTab === "influencer"}
              >
                For Influencers
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "brand" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-pressed={activeTab === "brand"}
              >
                For Brands
              </button>
            </div>
          </div>
        </div>

        {/* Vertical timeline */}
        <div className="relative">
          <div className="absolute left-[20px] md:left-[24px] top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200" />

          <div className="space-y-6 md:space-y-8">
            {(activeTab === "influencer" ? influencerSteps : brandSteps).map((step, index, arr) => (
              <div key={index} className="relative grid grid-cols-[40px_1fr] md:grid-cols-[48px_1fr] gap-3 md:gap-5">
                {/* Marker */}
                <div className="relative flex items-start justify-center">
                  <div className="z-10 grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-full bg-white text-gray-900 text-sm font-semibold shadow ring-1 ring-gray-200">
                    {index + 1}
                  </div>
                </div>

                {/* Card */}
                <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-gray-100/80 shadow-sm hover:shadow-md transition-all">
                  <div className="relative rounded-2xl bg-white p-4 md:p-5">
                    <div className="md:flex md:items-center md:gap-5">
                      <img src={step.image} alt={step.title} className="w-full md:w-56 h-32 md:h-36 object-cover rounded-xl mb-3 md:mb-0" />
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">{step.title}</h3>
                        <p className="mt-1.5 text-sm md:text-base text-gray-600 leading-relaxed">{step.description}</p>

                        {index === (activeTab === "influencer" ? influencerSteps.length - 1 : brandSteps.length - 1) && (
                          <div className="pt-3">
                            <a
                              href={activeTab === "influencer" ? "/register?type=creator" : "/register?type=brand"}
                              className="inline-flex items-center rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-black/90 transition"
                            >
                              {activeTab === "influencer" ? "Get started" : "Launch your campaign"}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
