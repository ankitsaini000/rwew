"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Search, MessageCircle, Phone, Mail, FileText, Users, Shield, CreditCard, Globe, Settings, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: "getting-started-1",
    question: "How do I create an account?",
    answer: "To create an account, click the 'Sign Up' button in the top right corner. You can register using your email address or connect with your social media accounts for a faster setup process.",
    category: "getting-started"
  },
  {
    id: "getting-started-2",
    question: "What's the difference between a creator and brand account?",
    answer: "Creators are influencers who want to collaborate with brands. Brands are businesses looking to partner with creators for marketing campaigns. Each account type has different features and capabilities.",
    category: "getting-started"
  },
  {
    id: "getting-started-3",
    question: "How do I complete my profile?",
    answer: "After signing up, go to your dashboard and click 'Complete Profile'. You'll need to add your bio, social media links, portfolio, and set your rates. A complete profile increases your chances of getting matched with brands.",
    category: "getting-started"
  },

  // Account & Security
  {
    id: "account-1",
    question: "How do I change my password?",
    answer: "Go to Settings > Account Security > Change Password. You'll need to enter your current password and then create a new one. Make sure to use a strong password with at least 8 characters.",
    category: "account-security"
  },
  {
    id: "account-2",
    question: "How do I enable two-factor authentication?",
    answer: "Navigate to Settings > Account Security > Two-Factor Authentication. You can enable it using an authenticator app or SMS. This adds an extra layer of security to your account.",
    category: "account-security"
  },
  {
    id: "account-3",
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account in Settings > Account Security > Delete Account. Please note that this action is irreversible and will permanently remove all your data.",
    category: "account-security"
  },

  // Payments & Billing
  {
    id: "payments-1",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our trusted payment partners.",
    category: "payments-billing"
  },
  {
    id: "payments-2",
    question: "How do I set my rates as a creator?",
    answer: "In your creator dashboard, go to 'Pricing' to set your rates. You can set different rates for different types of content (posts, stories, videos) and specify your minimum budget requirements.",
    category: "payments-billing"
  },
  {
    id: "payments-3",
    question: "When do I get paid?",
    answer: "Payments are typically processed within 7-10 business days after campaign completion and approval. You'll receive a notification when your payment is ready.",
    category: "payments-billing"
  },

  // Campaigns & Collaboration
  {
    id: "campaigns-1",
    question: "How do I find campaigns to apply for?",
    answer: "Browse available campaigns in the 'Find Campaigns' section. You can filter by category, budget, and requirements. Apply to campaigns that match your niche and audience.",
    category: "campaigns-collaboration"
  },
  {
    id: "campaigns-2",
    question: "What should I include in my campaign proposal?",
    answer: "Include your creative ideas, past work examples, audience demographics, and why you're the perfect fit for the campaign. Be specific about deliverables and timeline.",
    category: "campaigns-collaboration"
  },
  {
    id: "campaigns-3",
    question: "How do I track campaign performance?",
    answer: "Use the analytics dashboard in your creator account to track engagement, reach, and conversions. You can also generate reports to share with brands.",
    category: "campaigns-collaboration"
  },

  // Technical Support
  {
    id: "technical-1",
    question: "The website is loading slowly, what should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or using a different browser. If the issue persists, contact our support team with details about your device and browser.",
    category: "technical-support"
  },
  {
    id: "technical-2",
    question: "I can't upload my portfolio images",
    answer: "Make sure your images are in JPG, PNG, or GIF format and under 10MB each. If you're still having issues, try using a different browser or check your internet connection.",
    category: "technical-support"
  },
  {
    id: "technical-3",
    question: "How do I connect my social media accounts?",
    answer: "Go to Settings > Social Media Connections and click 'Connect' next to each platform. You'll be redirected to authorize the connection. Make sure your accounts are public.",
    category: "technical-support"
  }
];

const categories: Category[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: <Users className="w-6 h-6" />,
    description: "Learn how to create an account and get started",
    color: "bg-blue-500"
  },
  {
    id: "account-security",
    name: "Account & Security",
    icon: <Shield className="w-6 h-6" />,
    description: "Manage your account settings and security",
    color: "bg-green-500"
  },
  {
    id: "payments-billing",
    name: "Payments & Billing",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Everything about payments and billing",
    color: "bg-purple-500"
  },
  {
    id: "campaigns-collaboration",
    name: "Campaigns & Collaboration",
    icon: <Globe className="w-6 h-6" />,
    description: "How to work with brands and campaigns",
    color: "bg-orange-500"
  },
  {
    id: "technical-support",
    name: "Technical Support",
    icon: <Settings className="w-6 h-6" />,
    description: "Technical issues and troubleshooting",
    color: "bg-red-500"
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find answers to common questions, learn how to use our platform, and get the support you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, and guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/help-center/${category.id}`}
                className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } flex flex-col text-left`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white mr-3`}>
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="mb-8 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchQuery || selectedCategory ? 'Search Results' : 'Frequently Asked Questions'}
          </h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse our categories above.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedItems.has(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedItems.has(faq.id) && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions or issues.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Start Chat
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Send us an email and we'll respond within 24 hours</p>
              <a
                href="mailto:support@influencermarketplace.com"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm inline-block"
              >
                Send Email
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm mb-4">Browse our comprehensive guides and tutorials</p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                View Docs
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/how-it-works"
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-900">How It Works</span>
            </a>
            <a
              href="/creator-guidelines"
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-900">Creator Guidelines</span>
            </a>
            <a
              href="/collaboration-tips"
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-900">Collaboration Tips</span>
            </a>
            <a
              href="/success-stories"
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-900">Success Stories</span>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
} 