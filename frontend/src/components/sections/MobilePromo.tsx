"use client";

import Link from "next/link";

export default function MobilePromo() {
  return (
    <section className="md:hidden px-3">
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white p-5">
        <h3 className="text-lg font-semibold">Creators you'll love, results you'll trust</h3>
        <p className="text-sm text-white/90 mt-1">Discover verified influencers, manage campaigns securely, and grow with real impact.</p>
        <div className="mt-3">
          <Link href="/find-creators" className="inline-block px-4 py-2 bg-white text-purple-700 text-sm font-medium rounded-lg active:scale-[0.98]" aria-label="Browse creators">
            Browse creators
          </Link>
        </div>
      </div>
    </section>
  );
}


