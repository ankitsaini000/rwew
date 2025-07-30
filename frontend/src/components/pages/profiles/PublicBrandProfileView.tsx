import { MapPin, Globe, BadgeCheck, Users, BarChart4, Award, Star, DollarSign, Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink, Phone, CreditCard } from "lucide-react";
import React from "react";

interface SocialLink {
  platform: string;
  url: string;
}

interface PublicBrandProfileViewProps {
  profileData: any;
}

const PublicBrandProfileView = ({ profileData }: PublicBrandProfileViewProps) => {
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Brand Profile Not Found</h2>
          <p className="text-gray-600 mb-6">This brand profile does not exist or is not public.</p>
        </div>
      </div>
    );
  }

  // Social links
  const socialLinks: SocialLink[] = [];
  if (profileData.socialMedia) {
    const { instagram, facebook, twitter, linkedin, youtube, tiktok } = profileData.socialMedia;
    if (instagram) socialLinks.push({ platform: "instagram", url: instagram });
    if (facebook) socialLinks.push({ platform: "facebook", url: facebook });
    if (twitter) socialLinks.push({ platform: "twitter", url: twitter });
    if (linkedin) socialLinks.push({ platform: "linkedin", url: linkedin });
    if (youtube) socialLinks.push({ platform: "youtube", url: youtube });
    if (tiktok) socialLinks.push({ platform: "tiktok", url: tiktok });
  }

  // Social icon color classes
  const socialIconClasses: Record<string, string> = {
    instagram: "bg-gradient-to-br from-pink-500 to-yellow-500 text-white",
    facebook: "bg-gradient-to-br from-blue-600 to-blue-400 text-white",
    twitter: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
    linkedin: "bg-gradient-to-br from-blue-700 to-blue-400 text-white",
    youtube: "bg-gradient-to-br from-red-500 to-yellow-500 text-white",
    tiktok: "bg-gradient-to-br from-black to-gray-700 text-white",
  };

  // Skeleton loader for loading state (simulate loading for demo)
  // const isLoading = false; // Set to true to see skeleton

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Cover Section with glassmorphism and gradient overlay */}
      <div className="relative h-64 md:h-80 lg:h-96 rounded-b-3xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
        {profileData.coverImage ? (
          <img
            src={profileData.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-indigo-800/60 backdrop-blur-md" />
        {profileData.isVerified && (
          <div className="absolute top-6 right-8 bg-white/30 backdrop-blur-md text-blue-900 px-5 py-2 rounded-full flex items-center gap-2 border border-white/40 shadow-lg z-10">
            <BadgeCheck className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Verified Brand</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl -mt-24 mb-8 p-10 relative z-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-10">
            {/* Brand Logo with Glow */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0 -mt-24">
              <div className="rounded-2xl p-1.5 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 shadow-xl">
                <img
                  src={profileData.profileImage || "https://via.placeholder.com/200x200?text=Logo"}
                  alt={profileData.name || "Brand"}
                  className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
            {/* Main Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-3">
                {profileData.name}
                {profileData.isVerified && <BadgeCheck className="w-7 h-7 text-blue-500" />}
              </h1>
              {/* Verification Badges (Phone & Payment) */}
              {profileData.verificationStatus && (
                <div className="flex gap-2 mt-2 justify-center md:justify-start">
                  {/* Phone Verification */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${profileData.verificationStatus.phone?.status === 'verified' ? 'bg-green-100 text-green-700' : profileData.verificationStatus.phone?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <Phone className="w-4 h-4" />
                    {profileData.verificationStatus.phone?.status ? profileData.verificationStatus.phone.status.charAt(0).toUpperCase() + profileData.verificationStatus.phone.status.slice(1) : 'Pending'}
                  </span>
                  {/* Payment Verification */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${(profileData.verificationStatus.payment?.upi?.status === 'verified' || profileData.verificationStatus.payment?.card?.status === 'verified') ? 'bg-green-100 text-green-700' : ((profileData.verificationStatus.payment?.upi?.status === 'rejected' && profileData.verificationStatus.payment?.card?.status === 'rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>
                    <CreditCard className="w-4 h-4" />
                    {(profileData.verificationStatus.payment?.upi?.status === 'verified' || profileData.verificationStatus.payment?.card?.status === 'verified') ? 'Verified' : ((profileData.verificationStatus.payment?.upi?.status === 'rejected' && profileData.verificationStatus.payment?.card?.status === 'rejected') ? 'Rejected' : 'Pending')}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-lg text-gray-500 justify-center md:justify-start font-medium">
                {profileData.username && (
                  <span>@{profileData.username}</span>
                )}
                {profileData.industry && (
                  <span>{profileData.industry}</span>
                )}
                {profileData.location && (profileData.location.city || profileData.location.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-5 h-5" />
                    {profileData.location.city && `${profileData.location.city}, `}
                    {profileData.location.country}
                  </span>
                )}
                {profileData.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-5 h-5" />
                    {profileData.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                )}
              </div>
              {/* Social Media Links as Icon Buttons */}
              {socialLinks.length > 0 && (
                <div className="flex gap-3 mt-5 justify-center md:justify-start">
                  {socialLinks.map((link, idx) => {
                    let Icon;
                    switch (link.platform) {
                      case "instagram": Icon = Instagram; break;
                      case "facebook": Icon = Facebook; break;
                      case "twitter": Icon = Twitter; break;
                      case "linkedin": Icon = Linkedin; break;
                      case "youtube": Icon = Youtube; break;
                      default: Icon = ExternalLink;
                    }
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        className={`p-3 rounded-full shadow-lg hover:scale-110 transition ${socialIconClasses[link.platform] || "bg-gray-200 text-gray-700"}`}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 mb-10">
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition">
              <DollarSign className="w-7 h-7 text-green-500 mb-2" />
              <span className="text-2xl font-bold text-gray-900">
                ${profileData.metrics?.totalSpend?.toLocaleString() || '0'}
              </span>
              <span className="text-sm text-gray-500 mt-1">Total Spend</span>
            </div>
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-yellow-100 hover:shadow-xl transition">
              <Star className="w-7 h-7 text-yellow-500 mb-2" />
              <span className="text-2xl font-bold text-gray-900">
                {profileData.metrics?.averageRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-500 mt-1">Rating</span>
            </div>
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-purple-100 hover:shadow-xl transition">
              <BarChart4 className="w-7 h-7 text-purple-500 mb-2" />
              <span className="text-2xl font-bold text-gray-900">
                {profileData.metrics?.totalCampaigns || '0'}
              </span>
              <span className="text-sm text-gray-500 mt-1">Campaigns</span>
            </div>
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition">
              <Users className="w-7 h-7 text-blue-500 mb-2" />
              <span className="text-2xl font-bold text-gray-900">
                {profileData.metrics?.followersCount?.toLocaleString() || '0'}
              </span>
              <span className="text-sm text-gray-500 mt-1">Followers</span>
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-gray-100 pt-10 mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line text-lg">
              {profileData.about || "No description available."}
            </p>
          </div>

          {/* Brand Values */}
          {profileData.brandValues && profileData.brandValues.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Brand Values</h3>
              <div className="flex flex-wrap gap-3">
                {profileData.brandValues.map((value: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-base font-semibold shadow">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBrandProfileView; 