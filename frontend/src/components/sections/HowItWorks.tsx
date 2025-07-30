"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy for influencers and brands to connect,
            collaborate, and create successful partnerships
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-8">
            <div className="bg-white p-1 rounded-xl inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab("influencer")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-400
                  ${activeTab === "influencer"
                    ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow"
                    : "text-gray-500 hover:text-purple-600"}
                `}
              >
                For Influencers
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-400
                  ${activeTab === "brand"
                    ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow"
                    : "text-gray-500 hover:text-purple-600"}
                `}
              >
                For Brands
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-16 lg:space-y-24 relative">
          {(activeTab === "influencer" ? influencerSteps : brandSteps).map(
            (step, index, arr) => (
              <div
                key={index}
                className={`flex flex-col relative z-10 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-8 lg:gap-16`}
              >
                {/* Timeline connector (desktop only) */}
                {index < arr.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 ${index % 2 === 0 ? "right-0" : "left-0"} w-1/2 h-1 z-0`}> 
                    <div className="h-1 w-full bg-gradient-to-r from-purple-200 to-purple-400 opacity-60 rounded-full"></div>
                  </div>
                )}
                <div className="lg:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg transition-transform duration-300 hover:scale-110 border-4 border-white">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {index ===
                    (activeTab === "influencer"
                      ? influencerSteps.length - 1
                      : brandSteps.length - 1) && (
                    <div className="pt-4">
                      <a
                        href={
                          activeTab === "influencer"
                            ? "/register?type=creator"
                            : "/register?type=brand"
                        }
                        className="inline-flex items-center bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-purple-800 transition text-lg"
                      >
                        {activeTab === "influencer"
                          ? "Join as Influencer"
                          : "Register as Brand"}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="lg:w-1/2 flex justify-center">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-purple-100 hover:shadow-2xl transition-transform duration-300 hover:scale-105">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-64 w-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
