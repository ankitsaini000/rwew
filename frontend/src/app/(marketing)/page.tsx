'use server';

import { Suspense } from 'react';
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Categories } from '@/components/sections/Categories'
import { TopInfluencers } from '@/components/sections/TopInfluencers'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { VideoSection } from '@/components/sections/VideoSection'
import { BlogSection } from '@/components/sections/BlogSection'

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
        <Hero selectedCategory="" setSelectedCategory={() => {}} />
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