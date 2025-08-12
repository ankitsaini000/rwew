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
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/pagination";

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

// Visual accents for feature cards
const cardAccents = [
  {
    border: "from-purple-500/10 to-indigo-500/10",
    glow: "from-purple-400/30 to-indigo-400/30",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
  },
  {
    border: "from-blue-500/10 to-cyan-500/10",
    glow: "from-blue-400/30 to-cyan-400/30",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  {
    border: "from-amber-500/10 to-orange-500/10",
    glow: "from-amber-400/30 to-orange-400/30",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    border: "from-emerald-500/10 to-teal-500/10",
    glow: "from-emerald-400/30 to-teal-400/30",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
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
            // level: creator.level || creator.professionalInfo?.title,
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
          <div className="relative min-h-[320px] flex items-stretch">
            {/* Custom Slider Buttons - grouped bottom-right */}
            <div className="absolute -right-1 -top-10 md:-top-12 md:right-0 z-30 flex gap-1.5 pointer-events-none">
              <div
                className="creators-prev h-8 w-8 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-white/90 transition-colors disabled:opacity-50 pointer-events-auto grid place-items-center ring-1 ring-gray-100/60"
                aria-label="Previous creators"
                role="button"
                tabIndex={0}
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </div>
              <div
                className="creators-next h-8 w-8 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-white/90 transition-colors disabled:opacity-50 pointer-events-auto grid place-items-center ring-1 ring-gray-100/60"
                aria-label="Next creators"
                role="button"
                tabIndex={0}
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
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
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: '.creators-prev', nextEl: '.creators-next' }}
                autoplay={{ delay: 15000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  900: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
                className="creators-slider"
              >
                {creators.map((creator) => (
                  <SwiperSlide key={creator.id} className="h-auto">
                    <div className="h-full">
                    <CreatorCard {...creator} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
        {/* Trust indicators for Influencers and Brands */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50/60 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Trust & Safety
          </span>
          <h3 className="mt-3 text-2xl font-bold text-gray-900">
            Trusted by Influencers and Brands
          </h3>
          <p className="mt-1 text-sm text-gray-600">Security, transparency, and results you can rely on</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 -mt-4 mb-12">
          {/* Influencer Trust */}
          <div className="group relative rounded-2xl border border-purple-100/70 bg-gradient-to-tr from-purple-50 to-indigo-50 p-[1px] shadow-sm hover:shadow-md transition-all">
            <div className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 grid place-items-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Trusted by Influencers</p>
                  <p className="text-xs text-gray-500">Safe, transparent, and fair</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Secure escrow payouts, clear contracts, and verified brand campaigns ensure your work is protected.
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Escrow payments
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Verified campaigns
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Dispute protection
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Contract clarity
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={`inf-star-${i}`} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.967 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">4.9/5 from 5k+ creators</span>
              </div>
            </div>
          </div>

          {/* Brand Trust */}
          <div className="group relative rounded-2xl border border-indigo-100/70 bg-gradient-to-tr from-indigo-50 to-blue-50 p-[1px] shadow-sm hover:shadow-md transition-all">
            <div className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-indigo-600 grid place-items-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Trusted by Brands</p>
                  <p className="text-xs text-gray-500">Quality, safety, and results</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Work with verified creators, protect your budget with milestones, and measure ROI with confidence.
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Creator verification
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Escrow & milestones
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Contracted deliverables
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-green-50 text-green-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Performance tracking
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={`brand-star-${i}`} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.967 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">Trusted by 1k+ brands</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/60 px-3 py-1 text-xs font-semibold text-purple-700">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Features
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Powerful Tools for Everyone
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Specialized features designed for both influencers and brands to create successful partnerships
          </p>

          {/* Tabs */}
          <div className="flex justify-center mt-8 mb-8">
            <div className="relative inline-flex items-center gap-1 rounded-xl bg-gray-100/70 p-1">
              <button
                onClick={() => setActiveTab("influencer")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "influencer"
                    ? "bg-white shadow-sm text-purple-700 ring-1 ring-purple-100"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-pressed={activeTab === "influencer"}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-purple-50 text-purple-600"><Award className="h-3.5 w-3.5" /></span>
                For Influencers
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "brand"
                    ? "bg-white shadow-sm text-indigo-700 ring-1 ring-indigo-100"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-pressed={activeTab === "brand"}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"><Users className="h-3.5 w-3.5" /></span>
                For Brands
              </button>
            </div>
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden mb-10">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1.1}
            centeredSlides
            pagination={{ clickable: true }}
            autoplay={{ delay: 10000, disableOnInteraction: false }}
            className="features-mobile-swiper"
          >
            {(activeTab === "influencer" ? influencerFeatures : brandFeatures).map(
              (feature, index) => {
                const accent = cardAccents[index % cardAccents.length];
                return (
                  <SwiperSlide key={`m-${index}`} className="h-auto">
                    <div className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${accent.border} border border-gray-100/80 shadow-sm hover:shadow-md transition-all h-full`}>
                      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-50 bg-gradient-to-br ${accent.glow} pointer-events-none`} />
                      <div className="relative rounded-2xl bg-white p-6 h-full min-h-[240px] flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className={`h-12 w-12 ${accent.iconBg} ${accent.iconText} rounded-xl grid place-items-center`}>
                            <span className="[&_svg]:h-6 [&_svg]:w-6">{feature.icon}</span>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                            {activeTab === "influencer" ? "Influencer" : "Brand"}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="mt-auto" />
                      </div>
                    </div>
                  </SwiperSlide>
                );
              }
            )}
          </Swiper>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-stretch">
          {(activeTab === "influencer" ? influencerFeatures : brandFeatures).map(
            (feature, index) => {
              const accent = cardAccents[index % cardAccents.length];
              return (
            <div
              key={index}
                  className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${accent.border} border border-gray-100/80 shadow-sm hover:shadow-md transition-all h-full`}
                >
                  <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-50 bg-gradient-to-br ${accent.glow} pointer-events-none`} />
                  <div className="relative rounded-2xl bg-white p-6 h-full min-h-[240px] flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 ${accent.iconBg} ${accent.iconText} rounded-xl grid place-items-center group-hover:scale-105 transition-transform`}>
                        <span className="[&_svg]:h-6 [&_svg]:w-6">{feature.icon}</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                        {activeTab === "influencer" ? "Influencer" : "Brand"}
                      </span>
              </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-5 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 group-hover:text-purple-800 mt-auto">
                      Learn more
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
            </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};
