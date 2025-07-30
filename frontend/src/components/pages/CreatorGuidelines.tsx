'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { AlertCircle } from "lucide-react";

export const CreatorGuidelines = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use router.push() for navigation
  // Example: router.push('/path')
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Content */}
          <div>
            <h1 className="text-3xl font-bold mb-6">
              Now, let's talk about the things you want to steer clear of.
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your success on our platform is important to us. Avoid the
              following to keep in line with our community standards:
            </p>

            <div className="space-y-8">
              {/* Guideline 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Providing misleading information
                  </h3>
                  <p className="text-gray-600">
                    Never provide any misleading or inaccurate information about
                    your identity or qualifications.
                  </p>
                </div>
              </div>

              {/* Guideline 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Opening duplicate accounts
                  </h3>
                  <p className="text-gray-600">
                    Remember, you can always create more services within your
                    account. Multiple accounts are not allowed.
                  </p>
                </div>
              </div>

              {/* Guideline 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Soliciting other community members
                  </h3>
                  <p className="text-gray-600">
                    Do not solicit other community members for work outside of
                    our platform.
                  </p>
                </div>
              </div>

              {/* Guideline 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    External communications
                  </h3>
                  <p className="text-gray-600">
                    Requesting to take communication and payment outside of our
                    platform is not allowed.
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
                onClick={() => router.push("/creator-setup/personal-info")}
                className="px-8 py-3 bg-[#1dbf73] text-white rounded-md font-medium hover:bg-[#19a463] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc"
              alt="Creator workspace"
              className="w-full h-[500px] object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
