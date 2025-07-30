'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";

export const CreatorProfileTips = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use router.push() instead of navigate() for navigation
  // Example: router.push('/some-path')
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
              alt="Creator working"
              className="w-full h-[500px] object-cover rounded-xl"
            />
          </div>

          {/* Right Column - Content */}
          <div>
            <h1 className="text-3xl font-bold mb-6">
              What makes a successful creator profile?
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your first impression matters! Create a profile that will stand
              out from the crowd.
            </p>

            <div className="space-y-8">
              {/* Tip 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
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
                  <h3 className="font-semibold text-lg mb-2">
                    Take your time in creating your profile
                  </h3>
                  <p className="text-gray-600">
                    Make sure your profile is exactly as you want it to be. Take
                    time to craft a compelling bio and showcase your best work.
                  </p>
                </div>
              </div>

              {/* Tip 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Add credibility with professional networks
                  </h3>
                  <p className="text-gray-600">
                    Link to your relevant professional networks to build trust
                    and showcase your experience across platforms.
                  </p>
                </div>
              </div>

              {/* Tip 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
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
                  <h3 className="font-semibold text-lg mb-2">
                    Accurately describe your skills
                  </h3>
                  <p className="text-gray-600">
                    Be specific about your professional skills and expertise to
                    help potential clients find you and understand your value.
                  </p>
                </div>
              </div>

              {/* Tip 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Put a face to your name
                  </h3>
                  <p className="text-gray-600">
                    Upload a clear, professional profile picture that shows your
                    face to build trust with potential clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={() => router.push("/creator-guidelines")}
                className="px-8 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
