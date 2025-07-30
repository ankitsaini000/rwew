"use client";

import { demoInfluencerImages } from "../../lib/demoImages";

const testimonials = [
  {
    content:
      "Working with this platform has transformed my career as a creator. The opportunities and connections are invaluable.",
    author: "Sarah Johnson",
    role: "Fashion Influencer",
    avatar: demoInfluencerImages[0],
  },
  {
    content:
      "The platform's tools and analytics have helped me grow my audience significantly. Highly recommended!",
    author: "Michael Chen",
    role: "Tech Reviewer",
    avatar: demoInfluencerImages[4],
  },
  {
    content:
      "The support team is amazing, and the brand collaborations have been perfect matches for my content.",
    author: "Emma Wilson",
    role: "Lifestyle Creator",
    avatar: demoInfluencerImages[2],
  },
];

export const Testimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Creators Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our community of successful creators who have grown their
            influence through our platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="absolute -top-4 left-8">
                <svg
                  className="h-8 w-8 text-purple-500 opacity-50"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>

              <p className="text-gray-600 mb-6 mt-4">{testimonial.content}</p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
