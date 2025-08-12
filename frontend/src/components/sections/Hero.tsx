"use client";

import { ArrowRight, Search, ShieldCheck, Star } from "lucide-react";
import { Input } from "../ui/input";
import { stats } from "../../lib/data";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategories, getFilteredCreators } from "../../services/api";

export const Hero = ({ selectedCategory, setSelectedCategory }: { selectedCategory: string; setSelectedCategory: (cat: string) => void }) => {
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const cats = await getCategories();
        setCategoryOptions(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const inputBlurTimeoutRef = useRef<number | null>(null);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [liveResultsLoading, setLiveResultsLoading] = useState(false);
  const [liveResultsError, setLiveResultsError] = useState<string | null>(null);

  const normalizedOptions: string[] = useMemo(() => {
    const names = categoryOptions
      .map((c: any) => String(c?.name || c?.title || "").trim())
      .filter(Boolean);
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const unique: string[] = [];
    names.forEach((n) => {
      const lower = n.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(n);
      }
    });
    return unique;
  }, [categoryOptions]);

  const suggestions: string[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return normalizedOptions.slice(0, 8);
    return normalizedOptions.filter((n) => n.toLowerCase().includes(q)).slice(0, 8);
  }, [normalizedOptions, searchQuery]);

  const handleSelectSuggestion = (label: string) => {
    setSelectedCategory(label);
    setSearchQuery(label);
    setIsSuggestionsOpen(false);
  };

  // Fetch live creator results with debounce
  useEffect(() => {
    const controller = new AbortController();
    const query = searchQuery.trim();
    if (query.length < 2 && !selectedCategory) {
      setLiveResults([]);
      return () => controller.abort();
    }
    setLiveResultsLoading(true);
    setLiveResultsError(null);
    const timer = window.setTimeout(async () => {
      try {
        const { creators } = await getFilteredCreators({
          search: query,
          category: selectedCategory || undefined,
          page: 1,
          limit: 6,
        });
        setLiveResults(Array.isArray(creators) ? creators : []);
      } catch (err: any) {
        setLiveResultsError("Failed to load results");
        setLiveResults([]);
      } finally {
        setLiveResultsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50 to-white pt-24 md:pt-28 pb-6 md:pb-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(168,85,247,0.18),transparent),radial-gradient(900px_500px_at_-10%_110%,rgba(236,72,153,0.18),transparent)]" />

      <div className="mx-auto max-w-7xl px-4">
        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-purple-700 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
            Smart Matching 2.0 is live
            <ArrowRight className="h-3.5 w-3.5" />
          </div>

          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900">
            The
            <span className="mx-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
              fastest way
            </span>
            to connect Creators & Brands
          </h1>

          <p className="mt-2 text-base md:text-lg text-gray-600">
            Find verified influencers, launch collaborations, and measure results in one place.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?type=creator"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-lg shadow-purple-600/20 transition hover:shadow-xl hover:brightness-110"
            >
              I'm a Creator
            </Link>
            <Link
              href="/register?type=brand"
              className="inline-flex items-center justify-center rounded-xl border border-purple-200 bg-white/80 px-6 py-3 text-purple-700 backdrop-blur transition hover:bg-white"
            >
              I’m a Brand
            </Link>
          </div>

          {/* Search + Chips */}
          <div className="relative z-10 mx-auto mt-4 max-w-2xl rounded-2xl border border-purple-100/70 bg-white/70 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search influencers, niches, platforms..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onBlur={() => {
                    // Delay closing so click on suggestion registers
                    inputBlurTimeoutRef.current = window.setTimeout(() => setIsSuggestionsOpen(false), 120);
                  }}
                  className="w-full pl-10 py-3.5 rounded-xl border-none bg-white/70 focus:ring-2 focus:ring-purple-600"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {isSuggestionsOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-[999] mt-2 max-h-[60vh] overflow-auto rounded-xl border border-purple-100/70 bg-white/95 p-1 shadow-2xl backdrop-blur"
                    onMouseDown={(e) => {
                      // Prevent input blur from closing before click
                      if (inputBlurTimeoutRef.current) window.clearTimeout(inputBlurTimeoutRef.current);
                      e.preventDefault();
                    }}
                  >
                    {categoriesLoading && (
                      <div className="px-3 py-2 text-xs text-gray-500">Loading…</div>
                    )}
                    {categoriesError && (
                      <div className="px-3 py-2 text-xs text-red-600">{categoriesError}</div>
                    )}
                    {!categoriesLoading && !categoriesError && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500">No matches</div>
                    )}
                    {!categoriesLoading && !categoriesError && suggestions.map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleSelectSuggestion(label)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-purple-50"
                      >
                        <span>{label}</span>
                        {selectedCategory === label && (
                          <span className="text-[10px] text-purple-600">selected</span>
                        )}
                      </button>
                    ))}

                    <div className="my-1 h-px bg-purple-100" />

                    <div className="px-3 py-1 text-[11px] font-medium text-gray-500">Creators</div>
                    {liveResultsLoading && (
                      <div className="px-3 py-2 text-xs text-gray-500">Searching…</div>
                    )}
                    {liveResultsError && (
                      <div className="px-3 py-2 text-xs text-red-600">{liveResultsError}</div>
                    )}
                    {!liveResultsLoading && !liveResultsError && liveResults.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500">No creators found</div>
                    )}
                    {!liveResultsLoading && !liveResultsError && liveResults.map((creator: any) => {
                      const usernameSlug = String(creator.username || '').replace(/^@/, '');
                      return (
                        <Link
                          key={creator.id || usernameSlug}
                          href={`/creator/${usernameSlug}`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-purple-50"
                          onClick={() => setIsSuggestionsOpen(false)}
                        >
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">{creator.name}</div>
                            <div className="truncate text-[11px] text-gray-500">{creator.username} • {creator.category}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              <button className="hidden sm:inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-medium text-white shadow-md transition hover:shadow-lg">
                Search
              </button>
            </div>
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto">
              {categoriesLoading && (
                <span className="text-xs text-gray-500 px-2 py-1">Loading categories…</span>
              )}
              {categoriesError && (
                <span className="text-xs text-red-600 px-2 py-1">{categoriesError}</span>
              )}
              {!categoriesLoading && !categoriesError && categoryOptions.slice(0, 16).map((category) => {
                const label = category.name || category.title;
                const active = selectedCategory === label;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedCategory(active ? "" : label)}
                    className={
                      `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                          : "border-purple-200 bg-white/70 text-gray-700 hover:bg-white"
                      }`
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Inline live creator results below search */}
            {(searchQuery.trim().length >= 2 || selectedCategory) && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-gray-800">Top creators</h3>
                  <Link
                    href={`/find-creators?search=${encodeURIComponent(searchQuery)}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700"
                  >
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {liveResultsLoading && (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-xl bg-white/70" />
                    ))
                  )}
                  {!liveResultsLoading && liveResults.map((creator: any) => {
                    const usernameSlug = String(creator.username || '').replace(/^@/, '');
                    return (
                      <Link
                        key={creator.id || usernameSlug}
                        href={`/creator/${usernameSlug}`}
                        className="group flex items-center gap-3 rounded-xl border border-purple-100/70 bg-white/80 p-2 shadow-sm backdrop-blur hover:bg-white"
                      >
                        <img src={creator.avatar} alt={creator.name} className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">{creator.name}</div>
                          <div className="truncate text-[11px] text-gray-500">{creator.username} • {creator.category}</div>
                        </div>
                      </Link>
                    );
                  })}
                  {!liveResultsLoading && !liveResults.length && (
                    <div className="col-span-2 sm:col-span-3 rounded-xl border border-dashed border-purple-200 p-4 text-center text-xs text-gray-500">
                      No creators found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 border border-purple-100/70 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-purple-600" /> Verified creators
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 border border-purple-100/70 backdrop-blur">
              <Star className="h-4 w-4 text-pink-600" /> 4.9/5 average rating
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 border border-purple-100/70 backdrop-blur">
              Trusted by 5k+ brands
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-3 md:mt-6 grid max-w-4xl grid-cols-3 gap-3 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/70 p-3 md:p-4 text-center shadow-sm border border-purple-100/70 backdrop-blur">
              <p className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">{stat.value}</p>
              <p className="text-[11px] md:text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Removed extra divider to reduce whitespace below hero */}
      </div>
    </section>
  );
};
