"use client";

import { useRef, useState } from "react";
import { demoProcessImages } from "../../lib/demoImages";

export const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-br from-white via-purple-50 to-indigo-50">
      {/* Decorative accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-10 h-72 w-72 md:h-96 md:w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-14 h-72 w-72 md:h-96 md:w-96 rounded-full bg-fuchsia-200/40 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 md:mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/70 px-3 py-1 text-xs font-semibold text-purple-700">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Product Demo
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              See How It Works
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Watch how our platform connects creators with brands and streamlines every step
            </p>
          </div>

          {/* Video Player */}
          <div className="group relative rounded-3xl p-[2px] bg-gradient-to-tr from-purple-200/60 via-fuchsia-200/60 to-indigo-200/60 shadow-lg">
            <div className="relative aspect-video overflow-hidden rounded-[calc(theme(borderRadius.3xl)-2px)] bg-black">
              <video
                ref={videoRef}
                poster={demoProcessImages.brand[2]}
                className="w-full h-full object-cover"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Vignette */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2 text-[11px]">
                <span className="px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/10">
                  2:14
                </span>
                <span className="px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/10">
                  HD
                </span>
              </div>

              {/* Play Button */}
              {!isPlaying && (
                <button
                  type="button"
                  aria-label="Play demo video"
                  onClick={() => videoRef.current?.play()}
                  className="absolute inset-0 m-auto h-20 w-20 grid place-items-center rounded-full bg-white/90 text-purple-700 shadow-lg transition-transform group-hover:scale-105"
                >
                  <span className="absolute h-20 w-20 rounded-full bg-purple-400/30 animate-ping" />
                  <span className="absolute h-24 w-24 rounded-full bg-purple-400/20 animate-ping delay-200" />
                  <svg className="relative z-10 h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}

              {/* Bottom info overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-black/35 text-white backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                  Quick 2-min walkthrough
                </div>
                <div className="hidden md:inline-flex items-center gap-2 rounded-lg bg-white/90 text-gray-800 px-3 py-1.5 text-xs font-medium">
                  No signup required
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm md:text-base">Learn how to create successful campaigns with top influencers</p>
          </div>
        </div>
      </div>
    </section>
  );
};
