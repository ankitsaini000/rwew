'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MessageCircle, Mail, Phone, FileText, HelpCircle, ChevronRight, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const supportCategories = [
  {
    icon: <HelpCircle className="h-6 w-6 text-purple-600" />,
    title: "General Help",
    description: "Answers to common questions about our platform",
    link: "/help-center"
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    link: "#live-chat"
  },
  {
    icon: <Mail className="h-6 w-6 text-green-600" />,
    title: "Email Support",
    description: "Send us an email and we'll respond within 24 hours",
    link: "/contact-us"
  },
  {
    icon: <Phone className="h-6 w-6 text-amber-600" />,
    title: "Phone Support",
    description: "Call us directly for urgent matters",
    link: "tel:+15551234567"
  },
];

const commonIssues = [
  "Account setup and verification",
  "Payment processing issues",
  "Creator collaboration problems",
  "Platform navigation help",
  "Content guidelines and policies",
  "Promotion and campaign setup"
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLiveChat, setShowLiveChat] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search the knowledge base
    console.log('Searching for:', searchQuery);
  };

  const toggleLiveChat = () => {
    setShowLiveChat(!showLiveChat);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How Can We Help You?</h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">
            Get the support you need to make the most of our platform.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-full shadow-md overflow-hidden p-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="flex-1 px-4 py-3 focus:outline-none text-gray-700"
              />
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 mr-1"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full px-4 py-12 flex-1">
        {/* Support Options */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Choose How You Want to Get Help</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <Link 
                href={category.link} 
                key={index}
                id={category.link.startsWith('#') ? category.link.substring(1) : undefined}
                onClick={category.link === '#live-chat' ? toggleLiveChat : undefined}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="mt-4 text-purple-600 font-medium flex items-center">
                  Get Started <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Common Issues */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Common Issues</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonIssues.map((issue, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{issue}</h3>
                <p className="text-gray-600 text-sm mb-4">Find quick solutions to common {issue.toLowerCase()} problems.</p>
                <Link href="/help-center" className="text-purple-600 font-medium flex items-center">
                  View Solutions <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </section>
        
        {/* Help Center Promo */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Explore Our Help Center</h2>
              <p className="text-gray-600 mb-4 max-w-xl">
                Browse through our comprehensive knowledge base with step-by-step guides, tutorials, and FAQs to help you navigate our platform.
              </p>
              <Link 
                href="/help-center" 
                className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Visit Help Center <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex-shrink-0 w-full md:w-1/3 max-w-xs">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="bg-purple-100 rounded-lg p-6 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Live Support Chat</h3>
            <button 
              onClick={toggleLiveChat}
              className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-4 h-80 bg-gray-50 overflow-y-auto">
            <div className="bg-purple-100 rounded-lg p-3 mb-4 max-w-[80%]">
              <p className="text-purple-800 text-sm">Hello! How can I help you today?</p>
              <p className="text-xs text-purple-600 mt-1">Support Agent • Just now</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="ml-2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}