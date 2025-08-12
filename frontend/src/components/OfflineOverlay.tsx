"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WifiOff, RotateCcw, Home } from "lucide-react";

export default function OfflineOverlay() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-md rounded-3xl border border-purple-200/60 bg-white/90 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600">
          <WifiOff className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">You’re offline</h2>
        <p className="mt-2 text-sm text-gray-600">Please check your internet connection and try again.</p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-white shadow-lg shadow-purple-600/20 transition hover:shadow-xl hover:brightness-110"
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white/80 px-5 py-2.5 text-purple-700 backdrop-blur transition hover:bg-white"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}


