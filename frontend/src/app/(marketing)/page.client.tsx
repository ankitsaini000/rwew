'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use client-side features
const Hero = dynamic(
  () => import('@/components/sections/Hero').then(mod => mod.Hero),
  { loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" /> }
);

const Features = dynamic(
  () => import('@/components/sections/Features').then(mod => mod.Features),
  { loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" /> }
);

// Static imports for components that don't need special handling
import { Categories } from '@/components/sections/Categories';
import { TopInfluencers } from '@/components/sections/TopInfluencers';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import { VideoSection } from '@/components/sections/VideoSection';
import { BlogSection } from '@/components/sections/BlogSection';

export default function MarketingPage() {
  return (
    <main>
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
        <Hero selectedCategory="" setSelectedCategory={(cat: string) => {}} />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg" />}>
        <Features selectedCategory="" />
      </Suspense>
      
      <Categories />
      <TopInfluencers />
      <Stats />
      <Testimonials />
      <VideoSection />
      <BlogSection />
    </main>
  );
}