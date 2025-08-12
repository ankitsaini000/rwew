"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WifiOff, Home, RotateCcw } from "lucide-react";

export default function NotFound() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-purple-50 to-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_90%_-10%,rgba(168,85,247,0.16),transparent),radial-gradient(700px_400px_at_-10%_110%,rgba(236,72,153,0.16),transparent)]" />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center">
        <div className="relative mb-8">
          <span className="absolute -inset-6 rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 blur-2xl" />
          <h1 className="relative text-7xl md:text-9xl font-extrabold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">404</span>
          </h1>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-white/70 px-4 py-2 text-sm text-gray-700 backdrop-blur">
          <WifiOff className={`h-4 w-4 ${isOnline ? "text-gray-500" : "text-red-500"}`} />
          {isOnline ? "Page not found" : "You’re offline • Check your network"}
        </div>

        <p className="max-w-2xl text-base text-gray-600">
          The page you’re looking for doesn’t exist or isn’t available right now. If you’re having
          connection issues, please check your network and try again.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-lg shadow-purple-600/20 transition hover:shadow-xl hover:brightness-110"
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white/80 px-6 py-3 text-purple-700 backdrop-blur transition hover:bg-white"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/find-creators" className="rounded-xl border border-purple-100/70 bg-white/80 p-4 text-left shadow-sm backdrop-blur hover:bg-white">
            <div className="text-sm font-semibold text-gray-900">Find creators</div>
            <div className="text-xs text-gray-600">Browse our marketplace by niche and platform.</div>
          </Link>
          <Link href="/how-it-works" className="rounded-xl border border-purple-100/70 bg-white/80 p-4 text-left shadow-sm backdrop-blur hover:bg-white">
            <div className="text-sm font-semibold text-gray-900">How it works</div>
            <div className="text-xs text-gray-600">Understand the process and get started fast.</div>
          </Link>
        </div>
      </div>
    </main>
  );
}


