import { useState, useEffect } from "react";
import { Camera, MapPin, Link2, Edit2, X, Plus, BadgeCheck, Mail, Phone, Calendar, Globe, Award, BookOpen, Clock, MessageSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink, Star, Users } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface SocialLink {
  platform: string;
  url: string;
  handle?: string;
  followers?: number;
}

interface CreatorProfileProps {
  profileData: any;
}

const CreatorProfileComponent = ({ profileData }: CreatorProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize edited profile data when profile data changes
  useEffect(() => {
    if (profileData) {
      setEditedProfile(profileData);
    }
  }, [profileData]);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            Please complete your creator profile setup.
          </p>
          <a
            href="/creator-dashboard"
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Set Up Profile
          </a>
        </div>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      handleSaveProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const data = await response.json();
      setEditedProfile(data.data);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profileImage" | "coverImage"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile((prev: any) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | object
  ) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    section: string,
    field: string,
    value: string | number | boolean | object
  ) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Extract creator profile data
  const {
    personalInfo = {},
    professionalInfo = {},
    descriptionFaq = {},
    socialMedia = {},
    galleryPortfolio = {},
    metrics = {},
    status,
  } = editedProfile || profileData || {};

  // Format social media links
  const socialLinks: SocialLink[] = [];
  if (socialMedia.socialProfiles) {
    const profiles = socialMedia.socialProfiles;
    if (profiles.instagram?.url) socialLinks.push({ platform: "instagram", url: profiles.instagram.url, handle: profiles.instagram.handle, followers: profiles.instagram.followers });
    if (profiles.twitter?.url) socialLinks.push({ platform: "twitter", url: profiles.twitter.url, handle: profiles.twitter.handle, followers: profiles.twitter.followers });
    if (profiles.facebook?.url) socialLinks.push({ platform: "facebook", url: profiles.facebook.url, handle: profiles.facebook.handle, followers: profiles.facebook.followers });
    if (profiles.linkedin?.url) socialLinks.push({ platform: "linkedin", url: profiles.linkedin.url, handle: profiles.linkedin.handle, followers: profiles.linkedin.connections });
    if (profiles.youtube?.url) socialLinks.push({ platform: "youtube", url: profiles.youtube.url, handle: profiles.youtube.handle, followers: profiles.youtube.subscribers });
    if (profiles.tiktok?.url) socialLinks.push({ platform: "tiktok", url: profiles.tiktok.url, handle: profiles.tiktok.handle, followers: profiles.tiktok.followers });
    if (profiles.website?.url) socialLinks.push({ platform: "website", url: profiles.website.url });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={editedProfile?.coverImage || "https://via.placeholder.com/1920x1080?text=Cover+Image"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <label className="absolute bottom-4 right-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "coverImage")}
            />
            <Camera className="w-5 h-5" />
          </label>
        )}
        
        {status === 'published' && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            <span className="font-medium">Published</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm -mt-20 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={personalInfo.profileImage || "https://via.placeholder.com/200x200?text=Profile"}
                  alt={personalInfo.firstName || "Creator"}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-white shadow-md"
                />
                {isEditing && (
                  <label className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "profileImage")}
                    />
                    <Camera className="w-4 h-4" />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={personalInfo.firstName || ""}
                        onChange={(e) => handleNestedInputChange("personalInfo", "firstName", e.target.value)}
                        placeholder="First Name"
                        className="text-2xl font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2 w-full"
                      />
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {personalInfo.firstName || ""} {personalInfo.lastName || ""}
                      </h1>
                    )}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={personalInfo.username || ""}
                        onChange={(e) => handleNestedInputChange("personalInfo", "username", e.target.value)}
                        placeholder="Username"
                        className="text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2 w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">@{personalInfo.username || ""}</span>
                        {personalInfo.isEmailVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-auto">
                    <button
                      onClick={handleEditToggle}
                      disabled={saving}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isEditing
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      {saving ? (
                        <>
                          <LoadingSpinner size="small" /> Saving...
                        </>
                      ) : isEditing ? (
                        "Save Changes"
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </button>
                    
                    {isEditing && (
                      <button
                        onClick={() => {
                          setEditedProfile(profileData);
                          setIsEditing(false);
                        }}
                        className="mt-2 w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {personalInfo.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={personalInfo.location?.city || ""}
                          onChange={(e) => 
                            handleNestedInputChange("personalInfo", "location", {
                              ...personalInfo.location,
                              city: e.target.value
                            })
                          }
                          placeholder="City"
                          className="bg-gray-50 rounded-lg px-3 py-1"
                        />
                      ) : (
                        <span>
                          {personalInfo.location?.city}{personalInfo.location?.country ? `, ${personalInfo.location.country}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {professionalInfo.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Link2 className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={professionalInfo.category || ""}
                          onChange={(e) => handleNestedInputChange("professionalInfo", "category", e.target.value)}
                          placeholder="Category"
                          className="bg-gray-50 rounded-lg px-3 py-1"
                        />
                      ) : (
                        <span>{professionalInfo.category}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-semibold">{metrics.ratings?.average || "0"} ({metrics.ratings?.count || "0"})</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Projects</p>
                      <p className="font-semibold">{metrics.projectsCompleted || "0"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Repeat Rate</p>
                      <p className="font-semibold">{metrics.repeatClientRate || "0"}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="mx-6 md:mx-8 mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
              {saveError}
            </div>
          )}
          
          {saveSuccess && (
            <div className="mx-6 md:mx-8 mb-4 p-4 bg-green-100 border border-green-200 rounded-lg text-green-700">
              Profile updated successfully!
            </div>
          )}

          {/* Tabs */}
          <div className="border-t border-gray-100">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
              {/* About/Bio Section */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                {isEditing ? (
                  <textarea
                    value={descriptionFaq?.longDescription || personalInfo?.bio || ""}
                    onChange={(e) => handleNestedInputChange("descriptionFaq", "longDescription", e.target.value)}
                    className="w-full min-h-[150px] bg-gray-50 rounded-lg px-4 py-3 text-gray-700"
                    placeholder="Tell clients about yourself and your services..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">
                    {descriptionFaq?.longDescription || personalInfo?.bio || "No description available."}
                  </p>
                )}

                {/* Skills */}
                {professionalInfo.skills && professionalInfo.skills.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {professionalInfo.skills.map((skill: any, index: number) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {skill.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services/Packages */}
                {editedProfile?.pricing?.packages && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {editedProfile.pricing.packages.basic && (
                        <div className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold mb-1">{editedProfile.pricing.packages.basic.name || "Basic"}</h4>
                          <p className="text-xl font-bold text-purple-600 mb-2">
                            ${editedProfile.pricing.packages.basic.price || "0"}
                          </p>
                          <p className="text-gray-600 text-sm mb-3">
                            {editedProfile.pricing.packages.basic.description || "No description"}
                          </p>
                          {editedProfile.pricing.packages.basic.features && (
                            <ul className="text-sm text-gray-700">
                              {editedProfile.pricing.packages.basic.features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 mb-1">
                                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 text-xs">✓</span>
                                  </div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {editedProfile.pricing.packages.standard && (
                        <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold">{editedProfile.pricing.packages.standard.name || "Standard"}</h4>
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Popular</span>
                          </div>
                          <p className="text-xl font-bold text-purple-600 mb-2">
                            ${editedProfile.pricing.packages.standard.price || "0"}
                          </p>
                          <p className="text-gray-600 text-sm mb-3">
                            {editedProfile.pricing.packages.standard.description || "No description"}
                          </p>
                          {editedProfile.pricing.packages.standard.features && (
                            <ul className="text-sm text-gray-700">
                              {editedProfile.pricing.packages.standard.features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 mb-1">
                                  <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-purple-700 text-xs">✓</span>
                                  </div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Information */}
              <div>
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {personalInfo.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{personalInfo.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {personalInfo.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{personalInfo.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {professionalInfo.yearsExperience && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="font-medium">{professionalInfo.yearsExperience} years</p>
                        </div>
                      </div>
                    )}
                    
                    {editedProfile?.availability?.responseTime && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Response Time</p>
                          <p className="font-medium">{editedProfile.availability.responseTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Social Media Links */}
                {socialLinks.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                    <div className="space-y-3">
                      {socialLinks.map((link, index) => {
                        // Determine icon based on platform
                        let Icon;
                        switch (link.platform.toLowerCase()) {
                          case "instagram": Icon = Instagram; break;
                          case "facebook": Icon = Facebook; break;
                          case "twitter": Icon = Twitter; break;
                          case "linkedin": Icon = Linkedin; break;
                          case "youtube": Icon = Youtube; break;
                          case "website": Icon = Globe; break;
                          default: Icon = ExternalLink;
                        }
                        
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium capitalize">{link.platform}</p>
                              {link.handle && <p className="text-sm text-gray-500">{link.handle}</p>}
                            </div>
                            {link.followers && link.followers > 0 && (
                              <span className="ml-auto text-sm text-gray-500">
                                {link.followers > 1000
                                  ? `${(link.followers / 1000).toFixed(1)}K`
                                  : link.followers}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Portfolio Gallery */}
            {galleryPortfolio && (galleryPortfolio.images?.length > 0 || galleryPortfolio.videos?.length > 0) && (
              <div className="border-t border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryPortfolio.images?.map((image: any, idx: number) => (
                    <div key={`img-${idx}`} className="relative rounded-lg overflow-hidden aspect-square group">
                      <img
                        src={image.url}
                        alt={image.title || "Portfolio item"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <div className="p-3 text-white">
                          <h4 className="font-medium text-sm">{image.title || "Untitled"}</h4>
                          {image.description && <p className="text-xs text-gray-200">{image.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {galleryPortfolio.videos?.map((video: any, idx: number) => (
                    <div key={`vid-${idx}`} className="relative rounded-lg overflow-hidden aspect-video group">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1"></div>
                        </div>
                      </div>
                      <img
                        src={video.thumbnail || video.url}
                        alt={video.title || "Video thumbnail"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <div className="p-3 text-white">
                          <h4 className="font-medium text-sm">{video.title || "Untitled"}</h4>
                          {video.description && <p className="text-xs text-gray-200">{video.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfileComponent; 