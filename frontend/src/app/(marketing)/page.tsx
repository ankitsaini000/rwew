// This is a server component that renders the client component
import { lazy } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component
const MarketingPage = dynamic(
  () => import('./page.client'),
  { 
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-64 bg-gray-50 animate-pulse rounded-lg mt-8" />
      </div>
    )
  }
);

// This ensures the page is not statically optimized
export const dynamicParams = true;

export default function Page() {
  return <MarketingPage />;
}