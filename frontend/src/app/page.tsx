"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Categories } from "@/components/sections/Categories";
import { TopInfluencers } from "@/components/sections/TopInfluencers";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { VideoSection } from "@/components/sections/VideoSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { Footer } from "@/components/layout/Footer";
import MobileQuickActions from "@/components/sections/MobileQuickActions";
import MobilePromo from "@/components/sections/MobilePromo";
// import MobileTrust from "@/components/sections/MobileTrust";

export default function HomePageSections() {
  const [selectedCategory, setSelectedCategory] = useState("");
  return (
    <>
      <Header />
      <Hero selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <MobileQuickActions />
      <MobilePromo />
      {/* <MobileTrust /> */}
      <TopInfluencers />
      <Categories />
      <Features selectedCategory={selectedCategory} />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <VideoSection />
      <BlogSection />
      <Footer />
    </>
  );
}
