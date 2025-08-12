"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { getCategories } from "../../services/api";
import { useRouter } from "next/navigation";

const categoryEmojis: Record<string, string> = {
  "Fashion & Beauty": "👚",
  "Health & Fitness": "💪",
  "Lifestyle": "😊",
  "Travel": "✈️",
  "Food & Beverage": "🍔",
  "Technology & Gadgets": "💻",
  "Gaming": "🎮",
  "Education": "📚",
  "Finance & Business": "💼",
  "Entertainment": "🎬",
  "Parenting & Family": "👨‍👩‍👧‍👦",
  "Automobile": "🚗",
  "Art & Creativity": "🎨",
  "Home & Gardening": "🏡",
  "Pets & Animals": "🐾",
  "Motivation & Spirituality": "🧘",
  "Books": "📖",
  "Books & Literature": "📚",
  "Events & Festivals": "🎉",
  "Environment & Social Causes": "🌱",
  "Others": "🔗",
  // Add more as needed
};

const categoryBgColors: Record<string, string> = {
  "Fashion & Beauty": "bg-pink-50",
  "Travel": "bg-blue-50",
  "Fitness & Health": "bg-green-50",
  "Gaming": "bg-pink-100",
  "Food & Cooking": "bg-yellow-50",
  "Technology": "bg-gray-100",
  "Arts & Crafts": "bg-indigo-50",
  "Finance": "bg-emerald-50",
  "Education": "bg-blue-50",
  "Music": "bg-pink-50",
  "Lifestyle": "bg-orange-50",
  "Business": "bg-gray-50",
  "Art": "bg-indigo-50",
  "Photography": "bg-purple-50",
  "Film": "bg-gray-50",
  "Shopping": "bg-pink-50",
  "Personal": "bg-gray-50",
  "Events": "bg-yellow-50",
  "Social": "bg-blue-50",
  "Global": "bg-green-50",
  "Inspiration": "bg-yellow-50",
  "Nature": "bg-green-50",
  // Add more as needed
};

export const Categories = () => {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/categories/${encodeURIComponent(category)}`);
  };

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const updateScrollButtons = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollCategories = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.min(320, el.clientWidth * 0.8);
    const next = direction === "left" ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: next, behavior: "smooth" });
    // update buttons after scroll animation
    window.setTimeout(updateScrollButtons, 300);
  };

  React.useEffect(() => {
    updateScrollButtons();
  }, [categories.length]);

  // Keyboard navigation for accessibility
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollCategories("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollCategories("right");
      }
    };
    const node = containerRef.current;
    if (node) node.addEventListener("keydown", onKey);
    return () => {
      if (node) node.removeEventListener("keydown", onKey);
    };
  }, []);

  // Curated gradient palette for cards (ensure Tailwind sees these classes)
  const gradientPalette: string[] = [
    "from-purple-500/10 to-pink-500/10",
    "from-blue-500/10 to-cyan-500/10",
    "from-emerald-500/10 to-lime-500/10",
    "from-amber-500/10 to-orange-500/10",
    "from-indigo-500/10 to-violet-500/10",
    "from-rose-500/10 to-fuchsia-500/10",
  ];

  return (
    <section className="relative overflow-hidden py-8 md:py-16">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_-10%_40%,rgba(168,85,247,0.08),transparent),radial-gradient(700px_360px_at_110%_70%,rgba(236,72,153,0.08),transparent)]" />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header with arrows on the right side */}
        <div className="mb-6 md:mb-10" ref={headerRef}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900">Explore categories</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCategories("left")}
                aria-label="Scroll left"
                disabled={!canScrollLeft}
                className={`rounded-full border p-2 transition ${canScrollLeft ? "bg-white/80 hover:bg-white shadow" : "bg-white/50 opacity-60"}`}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </button>
              <button
                onClick={() => scrollCategories("right")}
                aria-label="Scroll right"
                disabled={!canScrollRight}
                className={`rounded-full border p-2 transition ${canScrollRight ? "bg-white/80 hover:bg-white shadow" : "bg-white/50 opacity-60"}`}
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Jump into a niche to discover matching creators instantly.</p>
        </div>

        {/* Slider */}
        <div className="relative">
          {loading ? (
            <div className="flex gap-3 md:gap-5 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-[100px] w-[120px] md:h-[140px] md:w-[180px] animate-pulse rounded-2xl bg-white/70 shadow-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-purple-200/60 bg-white/70 p-6 text-center text-gray-500">No categories found.</div>
          ) : (
            <div
              ref={containerRef}
              onScroll={updateScrollButtons}
              id="categories-container"
              className="hide-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-1 py-2 md:gap-5 md:px-2 focus:outline-none"
              role="list"
              aria-label="Categories"
              tabIndex={0}
            >
              {categories.map((category, idx) => {
                const label = category.name || category.title || `Category ${idx + 1}`;
                const gradient = gradientPalette[idx % gradientPalette.length];
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleCategoryClick(label)}
                    aria-label={`Open ${label} category`}
                    className="group relative inline-flex h-[110px] w-[120px] flex-shrink-0 snap-start flex-col items-start justify-between rounded-2xl border border-purple-100/60 bg-white/70 p-3 text-left shadow-sm backdrop-blur transition will-change-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 md:h-[160px] md:w-[210px]"
                  >
                    {/* gradient glow */}
                    <span className={`pointer-events-none absolute -z-10 inset-0 rounded-2xl bg-gradient-to-br ${gradient}`} />
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100/70 bg-white/80 text-lg md:h-10 md:w-10 md:text-2xl shadow-sm transition-transform group-hover:scale-110">
                      {categoryEmojis[label] || "❓"}
                    </span>
                    <span className="line-clamp-2 w-full text-xs font-semibold text-gray-900 md:text-base">{label}</span>
                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-transparent transition group-hover:ring-2 group-hover:ring-purple-300/60" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Edge fades removed to avoid white borders on sides */}

          {/* Mobile overlay controls removed (arrows now in header) */}
        </div>
      </div>
    </section>
  );
};
