"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, ChevronUp, Lightbulb, Users, MessageCircle, ThumbsUp, Star, CheckCircle } from "lucide-react";

const tips = [
  {
    icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
    title: "Set Clear Expectations",
    description: "Discuss deliverables, timelines, and goals upfront to avoid misunderstandings and ensure a smooth collaboration."
  },
  {
    icon: <Users className="w-8 h-8 text-purple-600" />,
    title: "Know Your Partner",
    description: "Research your collaborator’s background, audience, and style to ensure a good fit for your brand or project."
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
    title: "Communicate Openly",
    description: "Maintain regular, honest communication throughout the partnership to build trust and address issues early."
  },
  {
    icon: <ThumbsUp className="w-8 h-8 text-purple-600" />,
    title: "Respect Creative Freedom",
    description: "Allow creators to express their unique voice and creativity for authentic, engaging results."
  },
  {
    icon: <Star className="w-8 h-8 text-purple-600" />,
    title: "Give Constructive Feedback",
    description: "Share feedback that is specific, actionable, and positive to help your partner improve and feel valued."
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
    title: "Celebrate Success Together",
    description: "Acknowledge achievements and share results to strengthen your relationship and inspire future collaborations."
  },
];

const featuredTip = {
  icon: <Lightbulb className="w-10 h-10 text-yellow-400" />,
  title: "Tip of the Day: Be Transparent",
  description: "Transparency about expectations, compensation, and creative process leads to more successful and enjoyable collaborations for everyone involved."
};

const faqData = [
  { question: "How do I find the right collaborator?", answer: "Look for partners whose values, audience, and style align with your goals. Use our platform’s filters and recommendations to discover great matches." },
  { question: "What should I include in a collaboration agreement?", answer: "Outline deliverables, deadlines, compensation, content rights, and communication preferences to ensure clarity for both parties." },
  { question: "How do I handle disagreements?", answer: "Address issues early with open, respectful communication. If needed, use our platform’s support team for mediation." },
];

function FAQAccordion({ data }: { data: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="border rounded-lg bg-white">
          <button
            className="w-full flex justify-between items-center p-4 text-left text-purple-700 font-medium focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <span>{item.question}</span>
            {openIndex === idx ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openIndex === idx && (
            <div className="p-4 pt-0 text-gray-700">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CollaborationTipsPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-purple-700 via-purple-300 to-white text-white py-16 px-4 flex flex-col items-center relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Collaboration Tips</h1>
        <p className="max-w-2xl text-center text-lg md:text-xl mb-8">Unlock the secrets to successful brand-creator partnerships with our expert tips and best practices.</p>
        <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/uploads/images/guide1.jpg)' }} />
      </section>
      {/* Featured Tip */}
      <section className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center bg-yellow-50 rounded-lg shadow mb-8">
        <div className="flex items-center gap-4 mb-2">{featuredTip.icon}<span className="text-xl font-bold text-yellow-700">{featuredTip.title}</span></div>
        <div className="text-yellow-800 text-center">{featuredTip.description}</div>
      </section>
      {/* Tips Grid */}
      <section className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
              <div className="mb-3">{tip.icon}</div>
              <div className="font-bold text-purple-700 text-lg mb-2">{tip.title}</div>
              <div className="text-gray-700">{tip.description}</div>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Banner */}
      <section className="w-full bg-purple-600 py-10 px-4 flex flex-col items-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to Collaborate?</h2>
        <p className="mb-4">Join our platform and start building successful partnerships today.</p>
        <button className="px-8 py-3 rounded-lg bg-white text-purple-700 font-semibold hover:bg-purple-100 transition">Get Started</button>
      </section>
      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto w-full px-4 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-purple-800">Frequently Asked Questions</h2>
        <FAQAccordion data={faqData} />
      </section>
      <Footer />
    </div>
  );
} 