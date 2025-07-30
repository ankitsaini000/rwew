"use client";

import { demoProcessImages } from "../../lib/demoImages";

export const VideoSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See How It Works
            </h2>
            <p className="text-gray-600">
              Watch how our platform connects creators with brands
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img
              src={demoProcessImages.brand[2]}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all cursor-pointer group">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white bg-opacity-90 group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Optional: Video Description */}
          <div className="mt-6 text-center text-gray-600">
            <p>Learn how to create successful campaigns with top influencers</p>
          </div>
        </div>
      </div>
    </section>
  );
};
