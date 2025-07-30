'use client';

import { useEffect } from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export const BecomeCreator = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      document.dispatchEvent(
        new CustomEvent("show-auth-modal", {
          detail: { view: "login" },
        })
      );
      router.push("/");
      return;
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const categories = [
    {
      title: "Fashion Creator",
      image:
        "https://images.unsplash.com/photo-1737452179413-827ba5c0986d?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Beauty  Creator",
      image:
        "https://images.unsplash.com/photo-1735814933921-ab6afbdf5d17?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Fitness Creator",
      image:
        "https://images.unsplash.com/photo-1736264334806-b50e5ec94be1?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Comedy Creator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
    {
      title: "Musician Creator",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    },
    {
      title: "Gaming Creator",
      image:
        "https://plus.unsplash.com/premium_photo-1737147325416-eee88ccb04f1?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Travel Creator",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    { title: "What's Your Skill?", image: "", isLast: true },
  ];

  const buyerStories = [
    {
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      quote: "People love our logo, and are fans forever.",
      author: "Jennifer Chen, CEO of Weiked",
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      quote: "Fiverr is an amazing resource for anyone in the startup space.",
      author: "Adam Mahmud, CEO of MadHood",
    },
    {
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      quote: "There is no way I could have produced anything without Fiverr.",
      author: "Christopher Sunami, Music Producer",
    },
  ];

  const faqItems = [
    { question: "What can I sell?", answer: "..." },
    { question: "How much money can I make?", answer: "..." },
    { question: "How much does it cost?", answer: "..." },
    { question: "How do I price my service?", answer: "..." },
    { question: "How much time will I need to invest?", answer: "..." },
    { question: "How do I get paid?", answer: "..." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl font-bold mb-4">Work Your Way</h1>
          <p className="text-xl mb-8">
            You bring the skill. We'll make earning easy.
          </p>
          <button
            onClick={() => router.push("/creator-dashboard")}
            className="bg-[#1dbf73] text-white px-8 py-3 rounded-md font-medium hover:bg-[#19a463] transition-colors"
          >
            Become a creator
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold">4 SEC</div>
            <p className="text-gray-600">A Gig is Bought Every</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">50M+</div>
            <p className="text-gray-600">Transactions</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">$5 - $10,000</div>
            <p className="text-gray-600">Price Range</p>
          </div>
        </div>
      </div>

      {/* Join Community Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Join our growing creators community
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="relative group cursor-pointer">
                {category.isLast ? (
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-red-500 text-4xl mb-2">❤️</div>
                    <div className="text-gray-900 font-medium">
                      {category.title}
                    </div>
                    <button
                      onClick={() => router.push("/creator-dashboard")}
                      className="mt-4 bg-[#1dbf73] text-white px-4 py-2 rounded-md text-sm"
                    >
                      Become a creator
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-end p-4 text-white opacity-100 group-hover:opacity-100 transition-opacity rounded-lg">
                      <div>
                        <div className="text-sm">I am</div>
                        <div className="font-medium">{category.title}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: "📝",
                title: "1. Create a Gig",
                description:
                  "Sign up for free, set up your Gig, and offer your work to our global audience.",
              },
              {
                icon: "💼",
                title: "2. Deliver great work",
                description:
                  "Get notified when you get an order and use our system to discuss details with customers.",
              },
              {
                icon: "💰",
                title: "3. Get paid",
                description:
                  "Get paid on time, every time. Payment is available for withdrawal as soon as it clears.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-medium mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buyer Stories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Buyer Stories
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {buyerStories.map((story, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <img
                  src={story.image}
                  alt={story.author}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <p className="text-gray-900 italic mb-4">"{story.quote}"</p>
                <p className="text-gray-600 text-sm">{story.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Q&A</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="border-b pb-4">
                <summary className="font-medium cursor-pointer">
                  {item.question}
                </summary>
                <p className="mt-2 text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Sign Up CTA */}
      <div className="py-16 bg-gray-50 text-center">
        <h2 className="text-xl mb-6">
          Sign up and create your first Gig today
        </h2>
        <button
          onClick={() => router.push("/creator-dashboard")}
          className="bg-[#1dbf73] text-white px-8 py-3 rounded-md font-medium hover:bg-[#19a463] transition-colors"
        >
          Get Started
        </button>
      </div>

      <Footer />
    </div>
  );
};
