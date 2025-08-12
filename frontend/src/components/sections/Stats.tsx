"use client";

import { stats } from "../../lib/data";
import { Users, Building2, HeadsetIcon } from "lucide-react";

export const Stats = () => {
  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="hidden md:block absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
        <div className="hidden md:block absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12 animate-fadeInUp">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2 md:mb-4">
            Trusted by Creators & Brands
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Join thousands of successful collaborations happening on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-white/60 bg-white/60 backdrop-blur-sm animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mx-auto mb-2 md:mb-3 h-8 w-8 md:h-10 md:w-10 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
                {stat.label.includes("Influencers") && <Users className="h-4.5 w-4.5 md:h-5 md:w-5" />}
                {stat.label.includes("Brands") && <Building2 className="h-4.5 w-4.5 md:h-5 md:w-5" />}
                {stat.label.includes("Support") && <HeadsetIcon className="h-4.5 w-4.5 md:h-5 md:w-5" />}
              </div>
              <p className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {stat.value}
              </p>
              <p className="mt-1.5 md:mt-2 text-gray-600 text-xs md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
