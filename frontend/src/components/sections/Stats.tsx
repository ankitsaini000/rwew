"use client";

import { stats } from "../../lib/data";

export const Stats = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Creators & Brands
          </h2>
          <p className="text-gray-600">
            Join thousands of successful collaborations happening on our
            platform
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {stat.value}
              </p>
              <p className="mt-2 text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
