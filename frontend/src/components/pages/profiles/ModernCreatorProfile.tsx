import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import ProfileHeader from "./ProfileHeader";
import SocialMediaLinks from "@/components/ui/social-media-links";
import { CreatorProfile } from "@/types/profiles";
import ContentGrid from "@/components/content/ContentGrid";
import { Edit2, Eye, Star, MessageCircle, Briefcase, Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ModernCreatorProfileProps {
  profileData: any;
}

export default function ModernCreatorProfile({
  profileData
}: ModernCreatorProfileProps) {
  console.log("ModernCreatorProfile received data:", profileData);
  
  // Extract profile data from the API response with fallbacks
  const profile = profileData || {};
  const isCurrentUser = true; // Assuming current user by default
  
  // Format location string from object if needed
  const formatLocation = (loc: any): string => {
    if (!loc) return "";
    
    // If location is already a string, return it
    if (typeof loc === 'string') return loc;
    
    // If location is an object, format it
    if (typeof loc === 'object') {
      const parts = [];
      if (loc.city) parts.push(loc.city);
      if (loc.state) parts.push(loc.state);
      if (loc.country) parts.push(loc.country);
      
      return parts.join(", ");
    }
    
    // Fallback
    return "";
  };

  // Extract name with proper fallbacks for various data structures
  const extractName = () => {
    if (profile.personalInfo?.fullName) return profile.personalInfo.fullName;
    if (profile.fullName) return profile.fullName;
    
    // Try to combine first and last name if available
    const firstName = profile.personalInfo?.firstName || profile.firstName || "";
    const lastName = profile.personalInfo?.lastName || profile.lastName || "";
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    // Final fallbacks
    return profile.name || profile.displayName || "Creator";
  };
  
  // Extract social media links
  const extractSocialLinks = () => {
    const links = [];
    
    // Try to get social media from different possible locations
    const socialMedia = profile.socialMedia || profile.personalInfo?.socialMedia || {};
    
    // Log for debugging
    console.log("Social media data:", socialMedia);
    
    // Add links if they exist
    if (socialMedia?.instagram) links.push({ type: 'instagram', url: socialMedia.instagram });
    if (socialMedia?.facebook) links.push({ type: 'facebook', url: socialMedia.facebook });
    if (socialMedia?.twitter) links.push({ type: 'twitter', url: socialMedia.twitter });
    if (socialMedia?.linkedin) links.push({ type: 'linkedin', url: socialMedia.linkedin });
    if (socialMedia?.youtube) links.push({ type: 'youtube', url: socialMedia.youtube });
    
    return links;
  };
  
  // Map expected fields with fallbacks
  const {
    id = "",
    username = profile.personalInfo?.username || profile.userId?.username || "",
    bio = profile.description || profile.bio || profile.personalInfo?.bio || "",
    briefDescription = profile.briefDescription || profile.personalInfo?.briefDescription || profile.shortBio || "",
    // Handle location which could be a string or an object
    website = profile.personalInfo?.website || profile.website || "",
    isVerified = profile.personalInfo?.isVerified || profile.isVerified || false,
    profileImage = profile.personalInfo?.profileImage || profile.profileImage || "",
    coverImage = profile.personalInfo?.coverImage || profile.coverImage || "",
  } = profile;

  // Get name using the extraction function
  const name = extractName();
  
  // Format location separately to handle object or string
  const locationRaw = profile.personalInfo?.location || profile.location || "";
  const locationFormatted = formatLocation(locationRaw);
  
  // Get social media links
  const socialLinks = extractSocialLinks();
  
  // Debug log to see what data is available
  console.log("ModernCreatorProfile metrics:", profile.metrics);
  console.log("ModernCreatorProfile completedProjects:", profile.completedProjects);
  console.log("ModernCreatorProfile ratings:", profile.ratings);

  // Extract metrics with robust fallbacks
  const metrics = {
    profileViews: profile.metrics?.profileViews || profile.profileViews || 0,
    projects: profile.metrics?.projectsCompleted ?? profile.metrics?.completedProjects ?? profile.metrics?.projects ?? profile.completedProjects ?? profile.projects?.length ?? 0,
    rating: profile.metrics?.ratings?.average ?? profile.metrics?.rating ?? profile.ratings?.average ?? profile.rating ?? 0,
    ratingCount: profile.metrics?.ratings?.count ?? profile.metrics?.ratingCount ?? profile.ratings?.count ?? profile.ratingCount ?? 0
  };
  
  // Create stats array for display
  const stats = [
    { label: "Projects", value: metrics.projects },
    { label: "Rating", value: metrics.rating?.toFixed(1) || "0.0" },
    { label: "Profile Views", value: metrics.profileViews }
  ];

  // Extract reviews from profile data if available
  const reviews = profile.reviews || [];

  // Place this at the top of the component, after extracting 'profile':
  const portfolio = profile.portfolio || [];

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Data</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Reduced height for the header */}
      <div className="h-48 sm:h-56 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
        {coverImage && (
          <img 
            src={coverImage} 
            alt={`${name || 'Profile'} cover`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28 md:w-32 md:h-32">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={name || 'Creator'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white opacity-60">
                          {name && typeof name === 'string' ? name.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {name || 'Creator'}
                    </h1>
                    
                    <div className="flex items-center mt-1 text-gray-500">
                      {username && (
                        <span className="mr-2">@{username}</span>
                      )}
                      {isVerified && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Verified</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3">
                      {locationFormatted && (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{locationFormatted}</span>
                        </div>
                      )}
                      
                      {website && (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <a 
                            href={website.startsWith('http') ? website : `https://${website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-purple-600 transition-colors flex items-center"
                          >
                            {website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Media Icons */}
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    {socialLinks.map((link, index) => {
                      // Determine icon and colors based on social media type
                      let Icon = Globe;
                      let bgColor = "bg-gray-100 hover:bg-gray-200";
                      let textColor = "text-gray-600";
                      
                      switch (link.type.toLowerCase()) {
                        case 'instagram':
                          Icon = Instagram;
                          bgColor = "bg-pink-100 hover:bg-pink-200";
                          textColor = "text-pink-600";
                          break;
                        case 'facebook':
                          Icon = Facebook;
                          bgColor = "bg-blue-100 hover:bg-blue-200";
                          textColor = "text-blue-600";
                          break;
                        case 'twitter':
                          Icon = Twitter;
                          bgColor = "bg-sky-100 hover:bg-sky-200";
                          textColor = "text-sky-600";
                          break;
                        case 'linkedin':
                          Icon = Linkedin;
                          bgColor = "bg-blue-100 hover:bg-blue-200";
                          textColor = "text-blue-800";
                          break;
                        case 'youtube':
                          Icon = Youtube;
                          bgColor = "bg-red-100 hover:bg-red-200";
                          textColor = "text-red-600";
                          break;
                      }
                      
                      return (
                        <a 
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${bgColor} ${textColor} p-2 rounded-full transition-colors shadow-sm`}
                          title={link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex mt-5 space-x-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Brief Description - Added directly to header */}
                {briefDescription && (
                  <div className="mt-4 text-gray-600 text-sm">
                    <p className="line-clamp-2">{briefDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href={`/creator/${username || 'me'}`}>
            <button className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition duration-200 flex items-center justify-center gap-2 shadow-sm text-sm font-medium">
              <Eye className="w-4 h-4" />
              View Public Profile
            </button>
          </Link>
          
          <Link href="/creator-profile-edit">
            <button className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2 shadow-sm text-sm font-medium">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl shadow-sm mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          {/* About Tab */}
          <TabsContent value="about" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">About {name}</h3>
              
              {/* Description Section */}
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-800 mb-2">Description</h4>
                {bio ? (
                  <div className="prose max-w-none text-gray-600">
                    <p className="whitespace-pre-line">{typeof bio === 'string' ? bio : 'No description available'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    {isCurrentUser 
                      ? "You haven't added a description yet. Edit your profile to add one!"
                      : `${name} hasn't added a description yet.`}
                  </p>
                )}
              </div>
              
              {/* Profile Metrics Display */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-base font-medium text-gray-800 mb-4">Profile Stats</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600">Profile Views</p>
                      <p className="text-xl font-bold text-purple-900">{metrics.profileViews.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-600">Average Rating</p>
                      <p className="text-xl font-bold text-amber-900">
                        {metrics.rating.toFixed(1)} <span className="text-sm font-normal">({metrics.ratingCount} reviews)</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Completed Projects</p>
                      <p className="text-xl font-bold text-blue-900">{metrics.projects}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Projects</h3>
              {/* In the Projects tab, just display all portfolio items from profile.portfolio */}
              {portfolio.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.map((project: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-48 bg-gray-100">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                            <Briefcase className="h-12 w-12 text-purple-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-1">{project.title || `Project ${index + 1}`}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {typeof project.description === 'string' ? project.description : "No description provided"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {project.category || "Project"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {project.projectDate || project.date || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No projects found. Add your first project to showcase your work!</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-0">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">Reviews</h3>
                <div className="ml-auto flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-lg font-semibold">{metrics.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({metrics.ratingCount})</span>
                </div>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any, index: number) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                          {review.name ? review.name[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-medium">{review.name || `Reviewer ${index + 1}`}</p>
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-3 w-3 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {typeof review.comment === 'string' ? review.comment : "No comment provided."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet. Complete projects to receive reviews from clients!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 