'use client';

import { useState } from 'react';
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Categories } from '@/components/sections/Categories'
import { TopInfluencers } from '@/components/sections/TopInfluencers'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { VideoSection } from '@/components/sections/VideoSection'
import { BlogSection } from '@/components/sections/BlogSection'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <main>
      <Hero selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <Features selectedCategory={selectedCategory} />
      <Categories />
      <TopInfluencers />
      <Stats />
      <Testimonials />
      <VideoSection />
      <BlogSection />
    </main>
  )
} 