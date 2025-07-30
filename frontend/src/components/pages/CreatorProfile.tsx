"use client";

import {
  Star,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  MapPin,
  Globe,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  Smile,
  Send,
  Image as ImageIcon,
  Eye,
  Play,
  X,
  Paperclip,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Phone,
  Mail,
  Copy,
  Award,
  Shield,
  Sparkles,
  TrendingUp,
  Youtube,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "../layout/Footer";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "../layout/DashboardLayout";

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  rating: number;
  date: string;
  comment: string;
}

interface PastWork {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  date: string;
  views: string;
}

const generateRandomFollowers = () => {
  // Random followers between 100K to 25M
  const getRandomCount = () => {
    const count = Math.floor(Math.random() * 25000000) + 100000;
    return count >= 1000000
      ? (count / 1000000).toFixed(1) + "M"
      : (count / 1000).toFixed(1) + "K";
  };

  return {
    instagram: getRandomCount(),
    facebook: getRandomCount(),
    twitter: getRandomCount(),
    youtube: getRandomCount(),
    linkedin: getRandomCount(),
  };
};

const pastWorks: PastWork[] = [
  {
    id: 1,
    title: "Brand Campaign Video",
    category: "Marketing",
    thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f272c490",
    date: "2 weeks ago",
    views: "1.2M",
  },
  {
    id: 2,
    title: "Product Launch Promo",
    category: "Promotion",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    date: "1 month ago",
    views: "856K",
  },
  {
    id: 3,
    title: "Social Media Content",
    category: "Content",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b6ba687e04",
    date: "3 weeks ago",
    views: "2.1M",
  },
  {
    id: 4,
    title: "App Showcase Video",
    category: "App Promo",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    date: "1 week ago",
    views: "945K",
  },
  {
    id: 5,
    title: "YouTube Channel Intro",
    category: "YouTube",
    thumbnail: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
    date: "5 days ago",
    views: "1.5M",
  },
  {
    id: 6,
    title: "Corporate Presentation",
    category: "Business",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    date: "2 days ago",
    views: "678K",
  },
];

export const CreatorProfile = () => {
  const params = useParams();
  const [socialStats, setSocialStats] = useState(generateRandomFollowers());
  const [selectedPackage, setSelectedPackage] = useState<
    "basic" | "standard" | "premium"
  >("basic");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const reviews: Review[] = [
    {
      id: "1",
      user: {
        name: "Alex K.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
        role: "Senior Analyst",
      },
      rating: 5,
      date: "Jan 20, 2024",
      comment:
        "Working with Sam.AI has been an incredible journey so far. The technology we're building is truly cutting-edge, and being a part of a team that's revolutionizing how people achieve their goals is immensely fulfilling.",
    },
    {
      id: "2",
      user: {
        name: "Emily R.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        role: "Front-End Engineer",
      },
      rating: 4,
      date: "Nov 13, 2023",
      comment:
        "Sam.AI is not just a workplace; it's a community of passionate individuals driven by a common goal of helping others succeed.",
    },
    {
      id: "3",
      user: {
        name: "Michael S.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        role: "Product Manager",
      },
      rating: 5,
      date: "Dec 15, 2023",
      comment:
        "The attention to detail and commitment to quality is exceptional. Every project is handled with utmost professionalism.",
    },
  ];

  const packages = {
    basic: {
      name: "BASIC PROMO",
      price: "₹868",
      description:
        "Basic Package Only Laptop-scenes Includes, Background Music,Logo, and 720HD Video",
      delivery: "14 Days Delivery",
      revisions: "1 Revision",
      features: [
        "Sponsored Content",
        "Targeted Reach",
        "Dynamic transitions",
        "Flexibility",
        "Loyalty Programs",
        "Creative Content",
      ],
    },
    standard: {
      name: "STANDARD PROMO",
      price: "₹1,499",
      description:
        "Advanced Package with Professional Features, Full HD Video, and Voice Over",
      delivery: "7 Days Delivery",
      revisions: "2 Revisions",
      features: [
        "Everything in Basic",
        "1080p Full HD Video",
        "Professional Voice Over",
        "Advanced Animations",
        "Priority Support",
        "Marketing Strategy",
      ],
    },
    premium: {
      name: "PREMIUM PROMO",
      price: "₹2,999",
      description:
        "Complete Package with Ultra HD Video, Custom Animations, and Source Files",
      delivery: "5 Days Delivery",
      revisions: "Unlimited Revisions",
      features: [
        "Everything in Standard",
        "4K Ultra HD Video",
        "Custom Animations",
        "Source Files Included",
        "Dedicated Manager",
        "Marketing Campaign",
      ],
    },
  };

  useEffect(() => {
    const fetchSocialStats = async () => {
      try {
        // Instead of API call, just use random values
        setSocialStats(generateRandomFollowers());
      } catch (error) {
        console.error("Error setting social stats:", error);
      }
    };

    fetchSocialStats();
  }, [params?.username]);

  const MessageModal = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Create form data
      const formData = {
        subject,
        message,
        file: selectedFile?.name,
      };

      // Log the message data
      console.log("Message Data:", formData);

      // Show success message
      setShowSuccess(true);

      // Reset form and close after delay
      setTimeout(() => {
        setShowSuccess(false);
        setMessage("");
        setSubject("");
        setSelectedFile(null);
        onClose();
      }, 2000);
    };

    const addEmoji = (emoji: any) => {
      setMessage((prev) => prev + emoji.native);
      setShowEmojiPicker(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setSelectedFile(e.target.files[0]);
      }
    };

    if (!isOpen) return null;

    if (showSuccess) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-gray-600">We'll notify you when they respond.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>

          <div className="p-6">
           

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter message subject"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Type your message here..."
                  required
                />
                
                {showEmojiPicker && (
                  <div className="absolute right-0 bottom-12">
                    <Picker data={data} onEmojiSelect={addEmoji} />
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file"
                  className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors"
                >
                  <Paperclip size={20} className="text-gray-600" />
                  <span className="text-sm">
                    {selectedFile ? selectedFile.name : "Add attachment"}
                  </span>
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const ShareModal = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!isOpen) return null;

    const shareUrl = window.location.href;
    const title = "Check out Bhuvan Bam's profile";

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };

    const socialLinks = [
      {
        icon: Facebook,
        color: "bg-blue-600",
        label: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`,
      },
      {
        icon: Twitter,
        color: "bg-sky-500",
        label: "Twitter",
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(title)}`,
      },
      {
        icon: Linkedin,
        color: "bg-blue-700",
        label: "LinkedIn",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`,
      },
      {
        icon: Instagram,
        color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
        label: "Instagram",
        url: `instagram://story-share?url=${encodeURIComponent(shareUrl)}`,
      },
      {
        icon: Phone,
        color: "bg-green-500",
        label: "WhatsApp",
        url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
          title + " " + shareUrl
        )}`,
      },
      {
        icon: Mail,
        color: "bg-red-500",
        label: "Email",
        url: `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(shareUrl)}`,
      },
    ];

    // Function to handle social media share
    const handleShare = (url: string) => {
      window.open(url, "_blank", "width=600,height=600");
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Share Profile
            </h2>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {socialLinks.map((social) => (
                <button
                  key={social.label}
                  onClick={() => handleShare(social.url)}
                  className={`${social.color} p-4 rounded-xl text-white hover:opacity-90 transition-all flex flex-col items-center gap-2`}
                >
                  <social.icon size={20} className="w-6 h-6" />
                  <span className="text-xs font-medium">{social.label}</span>
                </button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-gray-600 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <main className="p-6">
        {/* Hero Section with Glass Effect */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/20">
          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04"
              alt="Cover"
              className="w-full h-full object-cover"
            />

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 backdrop-blur-md bg-black/20">
              <div className="flex items-end justify-between max-w-7xl mx-auto">
                <div className="flex items-end gap-8">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                      alt=""
                      className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl object-cover"
                    />
                    <span className="absolute -top-3 -right-3 p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg">
                      <Award size={20} className="text-white" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-4xl font-bold text-white">
                        Bhuvan Bam
                      </h1>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-sm border border-purple-500/30 text-white flex items-center gap-2">
                          <Shield size={20} />
                          Level 2 Seller
                        </span>
                        <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-sm border border-blue-500/30 text-white flex items-center gap-2">
                          <Sparkles size={20} />
                          Top Rated
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 text-lg">
                      Entertainment / Comedy
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all hover:scale-105">
                    <Heart size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <Share2 size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:opacity-90 transition-all hover:scale-105 flex items-center gap-2 text-white font-medium"
                  >
                    <MessageSquare size={20} />
                    Contact Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Social Section */}
          <div className="px-8 py-6 bg-white/60 backdrop-blur-xl border-t border-white/20">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex gap-8">
                <div className="flex items-center gap-3 px-4 py-2 bg-yellow-50 rounded-xl">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-900 font-semibold">4.9</span>
                  <span className="text-gray-500">(902)</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-xl">
                  <TrendingUp size={20} className="text-purple-600" />
                  <span className="text-gray-900 font-semibold">Top 1%</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl">
                  <Clock size={20} className="text-blue-600" />
                  <span className="text-gray-900 font-semibold">
                    3 Orders in Queue
                  </span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-xl">
                  <Users size={20} className="text-green-600" />
                  <div>
                    <span className="text-gray-900 font-semibold">
                      {socialStats.instagram}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      avg/platform
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section - Compact Version */}
        <div className="mt-6 bg-white/30 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Social Media Presence
            </h2>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-gray-900 font-semibold">
                54.6M Total Followers
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            {[
              
              {
                icon: Facebook,
                name: "Facebook",
                followers: socialStats.facebook,
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
                color: "text-blue-600",
                link: "#",
              },
              
              {
                icon: Youtube,
                name: "YouTube",
                followers: socialStats.youtube,
                gradient: "from-red-500 to-red-600",
                bgGradient: "from-red-50 to-red-100",
                color: "text-red-500",
                label: "Subscribers",
                link: "#",
              },
              {
                icon: Linkedin,
                name: "LinkedIn",
                followers: socialStats.linkedin,
                gradient: "from-blue-600 to-blue-700",
                bgGradient: "from-blue-50 to-blue-100",
                color: "text-blue-700",
                label: "Connections",
                link: "#",
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.link}
                className="flex-1 group bg-white rounded-2xl p-4 hover:shadow-lg transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${social.bgGradient}`}
                  >
                    <social.icon
                      size={20}
                      className={`${social.color} group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {social.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-lg font-bold text-gray-900">
                        {social.followers}
                      </p>
                      <span className="text-xs text-gray-500">
                        {social.label || "Followers"}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${social.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* About Section */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At Airbluesoft Premium Digital Studio we create all kinds of
                creative videos, specializing in Creating Promos( Website, Apps,
                Fashion, Real Estate, Youtube, NFT) and all other promos and all
                instructional videos.
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">4.7</span>
                    <span className="text-gray-500">(578 Reviews)</span>
                  </div>
                  <select className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600">
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {review.user.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {review.user.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex gap-1 mb-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              className={`${
                                index < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto">
                  View All Reviews
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="mt-6 bg-white rounded-3xl p-6 border-2 border-gray-100">
            {/* Package Tabs */}
            <div className="flex border-b mb-6">
              {(["basic", "standard", "premium"] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`px-8 py-4 capitalize ${
                    selectedPackage === pkg
                      ? "text-purple-600 border-b-2 border-purple-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>

            {/* Package Content */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {packages[selectedPackage].name}
                </h3>
                <p className="text-xl font-semibold">
                  {packages[selectedPackage].price}
                </p>
              </div>

              {/* Package Description */}
              <p className="text-gray-600 mb-6">
                {packages[selectedPackage].description}
              </p>

              {/* Delivery Info */}
              <div className="flex items-center gap-6 mb-6 text-gray-600 border-y-2 border-gray-50 py-4">
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  {packages[selectedPackage].delivery}
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={20} />
                  {packages[selectedPackage].revisions}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {packages[selectedPackage].features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <CheckCircle size={20} className="text-purple-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    // Ensure we pass the string value of the selected package (basic, standard, premium)
                    const packageTypeValue = selectedPackage.toString();
                    window.location.href = `/checkout?packageType=${packageTypeValue}&creatorId=${params?.username || 'unknown'}`;
                    console.log("Navigating to checkout with package:", packageTypeValue);
                  }}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
                <button className="w-full px-6 py-3 text-purple-600 hover:text-purple-700 font-medium">
                  Compare Packages
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Past Works Section */}
        <div className="mt-6 bg-white rounded-3xl p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Past Works
              </h2>
              <p className="text-gray-500 mt-1">
                Recent projects and collaborations
              </p>
            </div>

            <div className="flex gap-3">
              <select className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
                <option value="all">All Categories</option>
                <option value="marketing">Marketing</option>
                <option value="promotion">Promotion</option>
                <option value="content">Content</option>
                <option value="youtube">YouTube</option>
              </select>

              <select className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="viewed">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-3 gap-6">
            {pastWorks.map((work) => (
              <div
                key={work.id}
                className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white mb-2 inline-block">
                      {work.category}
                    </span>
                    <h3 className="text-white font-medium mb-1">
                      {work.title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye size={16} className="text-white" />
                        {work.views}
                      </span>
                      <span>{work.date}</span>
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play size={20} className="text-purple-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-8 text-center">
            <button className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto">
              Load More Works
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </DashboardLayout>
  );
};
