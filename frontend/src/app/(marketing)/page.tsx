// This is a server component that renders the client component
import dynamicImport from 'next/dynamic';

// Dynamically import the client component with no SSR
const MarketingPage = dynamicImport(
  () => import('./page.client').then((mod) => mod.default),
  { 
    ssr: false, // Disable server-side rendering for this component
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-64 bg-gray-50 animate-pulse rounded-lg mt-8" />
      </div>
    )
  }
);

// This ensures the page is not statically optimized
export const dynamic = 'force-dynamic';

export default function Page() {
  return <MarketingPage />;
}