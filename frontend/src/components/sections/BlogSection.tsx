"use client";

import { demoProcessImages } from "../../lib/demoImages";

const blogPosts = [
  {
    title: "How to Grow Your Social Media Presence",
    excerpt:
      "Learn the top strategies used by successful influencers to grow their following.",
    image: demoProcessImages.influencer[1],
    date: "Mar 15, 2024",
    readTime: "5 min read",
    category: "Social Media",
  },
  {
    title: "Creating Engaging Content That Converts",
    excerpt:
      "Discover the secrets to creating content that drives engagement and conversions.",
    image: demoProcessImages.influencer[2],
    date: "Mar 12, 2024",
    readTime: "7 min read",
    category: "Content Creation",
  },
  {
    title: "Maximizing Brand Collaborations",
    excerpt:
      "Tips and tricks for successful partnerships between creators and brands.",
    image: demoProcessImages.brand[3],
    date: "Mar 10, 2024",
    readTime: "6 min read",
    category: "Business",
  },
];

export const BlogSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-br from-white via-gray-50 to-purple-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/70 px-3 py-1 text-xs font-semibold text-purple-700">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Insights
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Latest Blog Posts
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends and insights
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.title}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-gray-100/70 shadow-sm hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-[calc(theme(borderRadius.2xl)-1px)]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 text-[11px] px-2.5 py-1 rounded-full bg-white/90 text-gray-800 border border-white/70">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="rounded-b-[calc(theme(borderRadius.2xl)-1px)] bg-white p-5 md:p-6">
                <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600 mb-2.5 md:mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                  {post.title}
                </h3>

                <p className="mt-2 text-gray-600 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-700">
                    {post.category}
                  </span>
                  <a
                    href="#"
                    aria-label={`Read more about ${post.title}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-700"
                  >
                    Read more
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
