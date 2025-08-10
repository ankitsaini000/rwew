"use client";

import {
  BarChart3,
  Rocket,
  Shield,
  Users,
  Zap,
  DollarSign,
  Award,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedCreators, getFilteredCreators } from "../../services/api";
import CreatorCard, { CreatorCardProps } from "../creator/CreatorCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const influencerFeatures = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Maximize Earnings",
    description:
      "Connect with premium brands and earn competitive rates for your promotional content.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description:
      "Track your performance and growth with detailed analytics and insights.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Receive payments securely and on time, every time.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Build Your Reputation",
    description:
      "Showcase your work and build a stellar portfolio that attracts top brands.",
  },
];

const brandFeatures = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Find Perfect Matches",
    description:
      "Discover influencers that align perfectly with your brand values and target audience.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Campaign Management",
    description:
      "Easily manage multiple campaigns and track their performance in real-time.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Reach",
    description:
      "Connect with influencers worldwide to expand your brand's global presence.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "ROI Optimization",
    description:
      "Maximize your return on investment with data-driven influencer partnerships.",
  },
];

export const Features = ({ selectedCategory }: { selectedCategory: string }) => {
  const [activeTab, setActiveTab] = useState<"influencer" | "brand">(
    "influencer"
  );

  const [creators, setCreators] = useState<CreatorCardProps[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      setCreatorsLoading(true);
      setCreatorsError(null);
      try {
        let data;
        let normalizedCategory = selectedCategory ? selectedCategory.trim() : "";
        if (normalizedCategory) {
          const res = await getFilteredCreators({ category: normalizedCategory, limit: 4 });
          data = res.creators;
        } else {
          data = await getPublishedCreators();
        }
        console.log("[Features] Selected Category:", normalizedCategory, "Fetched Creators:", data);
        // Shuffle creators array for randomness
        function shuffleArray(array: any[]) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
        const shuffled = Array.isArray(data) ? shuffleArray([...data]) : [];
        const mapped = shuffled.slice(0, 4).map((creator: any) => {
          let socialProfiles = creator.socialMedia?.socialProfiles || {};
          return {
            id: creator.id || creator._id || creator.username,
            username: creator.username || creator.personalInfo?.username || '',
            fullName: creator.name || creator.fullName || creator.personalInfo?.fullName || creator.personalInfo?.name || creator.username || '',
            avatar: creator.avatar || creator.personalInfo?.profileImage,
            category: creator.category || creator.professionalInfo?.category,
            categories: Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
              ? creator.professionalInfo.categories
              : (creator.category ? [creator.category] : (Array.isArray(creator.categories) ? creator.categories : [])),
            level: creator.level || creator.professionalInfo?.title,
            description: creator.bio || creator.description || creator.personalInfo?.bio || creator.descriptionFaq?.briefDescription,
            rating: (creator.metrics?.ratings?.average ?? creator.rating ?? 0),
            reviewCount: (Array.isArray(creator.reviews) ? creator.reviews.length :
                          (typeof creator.metrics?.ratings?.count === 'number' ? creator.metrics.ratings.count :
                          (typeof creator.reviewCount === 'number' ? creator.reviewCount : 0))),
            startingPrice: (typeof creator.startingPrice === 'number' ? creator.startingPrice :
                            (typeof creator.startingPrice === 'string' && creator.startingPrice.trim() ? creator.startingPrice :
                              (typeof creator.pricing?.standard?.price === 'number' ? creator.pricing.standard.price :
                                (typeof creator.pricing?.basic?.price === 'number' ? creator.pricing.basic.price : undefined)))),
            isLiked: false,
            title: creator.title || creator.professionalInfo?.title,
            completedProjects: creator.completedProjects,
            socialMedia: {
              instagram: socialProfiles.instagram?.url ||  socialProfiles.instagram,
              twitter: socialProfiles.twitter?.url || socialProfiles.twitter,

              linkedin: socialProfiles.linkedin?.url || socialProfiles.linkedin,

              youtube: socialProfiles.youtube?.url || socialProfiles.youtube,

              facebook: socialProfiles.facebook?.url || socialProfiles.facebook,
              // tiktok: socialProfiles.tiktok?.url || '',
            },
          };
        });
        setCreators(mapped);
      } catch (err) {
        setCreatorsError("Failed to load creators");
      } finally {
        setCreatorsLoading(false);
      }
    };
    fetchCreators();
  }, [selectedCategory]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Creators Slider */}
        <div className="mb-12">
          <div className="relative min-h-[260px] flex items-center">
            {/* Custom Slider Buttons - always rendered */}
            <button
              className="creators-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition-all disabled:opacity-50 pointer-events-auto"
              aria-label="Previous creators"
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              className="creators-next absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-purple-50 transition-all disabled:opacity-50 pointer-events-auto"
              aria-label="Next creators"
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            {/* Swiper and creators logic */}
            {creatorsLoading ? (
              <div className="text-center text-gray-500 w-full">Loading creators...</div>
            ) : creatorsError ? (
              <div className="text-center text-red-500 w-full">{creatorsError}</div>
            ) : creators.length === 0 ? (
              <div className="text-center text-gray-400 w-full border border-gray-200 bg-gray-50 rounded-xl py-12 my-8">
                No creators found for this category.
              </div>
            ) : creators.length === 1 ? (
              <div className="flex justify-center items-center py-8">
                <div className="max-w-xs w-full">
                  <CreatorCard {...creators[0]} />
                </div>
              </div>
            ) : (
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: '.creators-prev', nextEl: '.creators-next' }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  900: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
                className="creators-slider"
              >
                {creators.map((creator) => (
                  <SwiperSlide key={creator.id}>
                    <CreatorCard {...creator} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Tools for Everyone
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Specialized features designed for both influencers and brands to
            create successful partnerships
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-8 mb-12">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
              <button
                onClick={() => setActiveTab("influencer")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "influencer"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                For Influencers
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "brand"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                For Brands
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(activeTab === "influencer"
            ? influencerFeatures
            : brandFeatures
          ).map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-purple-100 transition-colors group hover:shadow-md"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <div className="text-purple-600">{feature.icon}</div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
