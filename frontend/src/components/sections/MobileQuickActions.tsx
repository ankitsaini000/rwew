"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories } from "../../services/api";

type Category = { name?: string; title?: string };

const emojiMap: Record<string, string> = {
  "Fashion & Beauty": "👚",
  "Health & Fitness": "💪",
  Lifestyle: "😊",
  Travel: "✈️",
  "Food & Beverage": "🍔",
  "Technology & Gadgets": "💻",
  Gaming: "🎮",
  Education: "📚",
  "Finance & Business": "💼",
  Entertainment: "🎬",
  "Parenting & Family": "👨‍👩‍👧‍👦",
  Automobile: "🚗",
  "Art & Creativity": "🎨",
  "Home & Gardening": "🏡",
  "Pets & Animals": "🐾",
  "Motivation & Spirituality": "🧘",
  Books: "📖",
  "Books & Literature": "📚",
  "Events & Festivals": "🎉",
  "Environment & Social Causes": "🌱",
  Others: "🔗",
};

const getEmojiFor = (label: string): string => emojiMap[label] || "❓";

export default function MobileQuickActions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e: any) {
        setError("Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="md:hidden px-3 py-4">
      <div className="grid grid-cols-4 gap-2">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white py-3">
                <div className="rounded-full bg-gray-100 p-2 w-9 h-9 animate-pulse" />
                <span className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))
          : error
          ? (
              <div className="col-span-4 text-center text-sm text-red-500">{error}</div>
            )
          : (categories.slice(0, 8).map((cat) => {
              const label = (cat.name || cat.title || "").toString();
              const href = `/categories/${encodeURIComponent(label)}`;
              return (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-3 active:scale-[0.98] transition"
                >
                  <div className="rounded-full bg-gray-50 p-2 w-9 h-9 grid place-items-center">
                    <span className="text-xl leading-none">{getEmojiFor(label)}</span>
                  </div>
                  <span className="text-[11px] text-gray-700 text-center line-clamp-1">{label}</span>
                </Link>
              );
            }))}
      </div>
    </section>
  );
}
