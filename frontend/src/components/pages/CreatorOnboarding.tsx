'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { Play } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CreatorOnboarding = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Check authentication and creator role
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'creator') {
        console.log('User is not a creator, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-3xl font-bold mb-6">
              Ready to start selling on our platform?
            </h1>
            <h2 className="text-xl font-semibold mb-8">
              Here's the breakdown:
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Learn what makes a successful profile
                  </h3>
                  <p className="text-gray-600">
                    Discover the do's and don'ts to ensure you're always on the
                    right track.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Create your creator profile
                  </h3>
                  <p className="text-gray-600">
                    Add your profile picture, description, and professional
                    information.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Publish your services</h3>
                  <p className="text-gray-600">
                    Create services of what you're offering and start selling
                    instantly.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/creator-profile-tips")}
              className="mt-8 bg-[#1dbf73] text-white px-8 py-3 rounded-md font-medium hover:bg-[#19a463] transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Right Column - Video Preview */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1736264334806-b50e5ec94be1"
              alt="Creator Preview"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Play className="w-6 h-6 text-purple-600 ml-1" />
              </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500" />
                  <div>
                    <div className="font-medium">Creator Name</div>
                    <div className="text-sm opacity-75">Category</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-yellow-400">
                      {star}
                    </span>
                  ))}
                  <span className="text-sm ml-1">(10 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
