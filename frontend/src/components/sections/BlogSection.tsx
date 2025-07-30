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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-gray-600">
            Stay updated with the latest trends and insights
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.title}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600 font-medium">
                    {post.category}
                  </span>
                  <button className="text-gray-600 hover:text-purple-600 text-sm font-medium">
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
