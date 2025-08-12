"use client";

import { demoInfluencerImages } from "../../lib/demoImages";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
    <section className="relative overflow-hidden py-16 md:py-20 bg-gradient-to-br from-purple-50 to-white">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-10 h-56 w-56 md:h-80 md:w-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-12 -left-10 h-56 w-56 md:h-80 md:w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/70 px-3 py-1 text-xs font-semibold text-purple-700">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            What Creators Say
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Real stories from creators who grew faster with better brand matches and tools
          </p>
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <Swiper
            modules={[Pagination]}
            spaceBetween={12}
            slidesPerView={1}
            pagination={{ clickable: true }}
            className="testimonials-mobile-swiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={`${testimonial.author}-m-${index}`}>
                <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-gray-100/70 shadow-sm hover:shadow-md transition-all">
                  <div className="relative rounded-2xl bg-white p-6 h-full">
                    <div className="absolute -top-3 left-6 grid h-10 w-10 place-items-center rounded-full bg-purple-100 text-purple-600 shadow-sm">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.456-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-3">{testimonial.content}</p>
                    <div className="mt-6 flex items-center gap-4">
                      <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.author}-d-${index}`}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 border border-gray-100/70 shadow-sm hover:shadow-md transition-all animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative rounded-2xl bg-white p-6 md:p-7 h-full transition-transform group-hover:-translate-y-0.5">
                <div className="absolute -top-3 left-6 grid h-10 w-10 place-items-center rounded-full bg-purple-100 text-purple-600 shadow-sm">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mt-3">
                  {testimonial.content}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
