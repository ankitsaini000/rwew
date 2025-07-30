import { useState, useEffect } from "react";
import { Camera, MapPin, Link2, Edit2, X, Plus, BadgeCheck, Mail, Phone, Globe, Award, Briefcase, Building, ExternalLink, Users, BarChart4, Calendar, MessageSquare, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface SocialLink {
  platform: string;
  url: string;
}

interface BrandProfileProps {
  profileData: any;
}

const BrandProfileComponent = ({ profileData }: BrandProfileProps) => {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Brand Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            Please complete your brand profile setup.
          </p>
          <a
            href="/brand-onboarding"
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

  // Format social media links
  const socialLinks: SocialLink[] = [];
  if (editedProfile.socialMedia) {
    const { instagram, facebook, twitter, linkedin, youtube, tiktok } = editedProfile.socialMedia;
    if (instagram) socialLinks.push({ platform: "instagram", url: instagram });
    if (facebook) socialLinks.push({ platform: "facebook", url: facebook });
    if (twitter) socialLinks.push({ platform: "twitter", url: twitter });
    if (linkedin) socialLinks.push({ platform: "linkedin", url: linkedin });
    if (youtube) socialLinks.push({ platform: "youtube", url: youtube });
    if (tiktok) socialLinks.push({ platform: "tiktok", url: tiktok });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={editedProfile.coverImage || "https://via.placeholder.com/1920x1080?text=Cover+Image"}
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
        
        {editedProfile.isVerified && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            <span className="font-medium">Verified Brand</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-sm -mt-20 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              {/* Brand Logo */}
              <div className="relative">
                <img
                  src={editedProfile.profileImage || "https://via.placeholder.com/200x200?text=Logo"}
                  alt={editedProfile.name || "Brand"}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover bg-white border border-gray-100 shadow-sm"
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Brand Name"
                        className="text-2xl font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2 w-full"
                      />
                    ) : (
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        {editedProfile.name}
                        {editedProfile.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                      </h1>
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
                          : "bg-blue-600 hover:bg-blue-700 text-white"
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
                  {editedProfile.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.location?.city || ""}
                          onChange={(e) => 
                            handleInputChange("location", {
                              ...editedProfile.location,
                              city: e.target.value
                            })
                          }
                          placeholder="City"
                          className="bg-gray-50 rounded-lg px-3 py-1"
                        />
                      ) : (
                        <span>
                          {editedProfile.location?.city}{editedProfile.location?.country ? `, ${editedProfile.location.country}` : ""}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {editedProfile.industry && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.industry || ""}
                          onChange={(e) => handleInputChange("industry", e.target.value)}
                          placeholder="Industry"
                          className="bg-gray-50 rounded-lg px-3 py-1"
                        />
                      ) : (
                        <span>{editedProfile.industry}</span>
                      )}
                    </div>
                  )}
                  
                  {editedProfile.establishedYear && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProfile.establishedYear || ""}
                          onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                          placeholder="Established Year"
                          className="bg-gray-50 rounded-lg px-3 py-1 w-24"
                        />
                      ) : (
                        <span>Est. {editedProfile.establishedYear}</span>
                      )}
                    </div>
                  )}
                  
                  {editedProfile.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.website || ""}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="Website URL"
                          className="bg-gray-50 rounded-lg px-3 py-1"
                        />
                      ) : (
                        <a 
                          href={editedProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {editedProfile.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Creators</p>
                      <p className="font-semibold">{editedProfile.metrics?.totalCreators || "0"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <BarChart4 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Campaigns</p>
                      <p className="font-semibold">{editedProfile.metrics?.totalCampaigns || "0"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-semibold">{editedProfile.metrics?.averageRating || "0"}/5</p>
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

          {/* Main Content */}
          <div className="border-t border-gray-100">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
              {/* About Section */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About {editedProfile.name}</h2>
                {isEditing ? (
                  <textarea
                    value={editedProfile.about || ""}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full min-h-[150px] bg-gray-50 rounded-lg px-4 py-3 text-gray-700"
                    placeholder="Tell creators about your brand..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">
                    {editedProfile.about || "No description available."}
                  </p>
                )}

                {/* Brand Values */}
                {editedProfile.brandValues && editedProfile.brandValues.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Brand Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.brandValues.map((value: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaigns & Opportunities */}
                {(editedProfile.campaigns?.length > 0 || editedProfile.opportunities?.length > 0) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Opportunities</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {(editedProfile.campaigns || []).slice(0, 2).map((campaign: any, idx: number) => (
                        <div key={`campaign-${idx}`} className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold mb-1">{campaign.title || "Campaign"}</h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {campaign.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600">
                              {campaign.budget ? `Budget: $${campaign.budget}` : "Contact for details"}
                            </span>
                            <a href={`/campaigns/${campaign._id}`} className="text-sm font-medium text-gray-600 hover:text-blue-600">
                              View details →
                            </a>
                          </div>
                        </div>
                      ))}
                      
                      {(editedProfile.opportunities || []).slice(0, 2).map((opportunity: any, idx: number) => (
                        <div key={`opp-${idx}`} className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                          <h4 className="font-semibold mb-1">{opportunity.title || "Opportunity"}</h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {opportunity.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600">
                              {opportunity.compensation ? opportunity.compensation : "Contact for details"}
                            </span>
                            <a href={`/opportunities/${opportunity._id}`} className="text-sm font-medium text-gray-600 hover:text-blue-600">
                              Apply now →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {(editedProfile.campaigns?.length > 2 || editedProfile.opportunities?.length > 2) && (
                      <div className="mt-4 text-center">
                        <a
                          href="/opportunities"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View All Opportunities
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact & Social Information */}
              <div>
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {editedProfile.contactInfo?.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{editedProfile.contactInfo.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {editedProfile.contactInfo?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{editedProfile.contactInfo.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {editedProfile.contactInfo?.contactPerson && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p className="font-medium">{editedProfile.contactInfo.contactPerson}</p>
                        </div>
                      </div>
                    )}
                    
                    {editedProfile.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a
                            href={editedProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {editedProfile.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Social Media Links */}
                {socialLinks.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
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
                          default: Icon = ExternalLink;
                        }
                        
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="font-medium capitalize">{link.platform}</div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandProfileComponent; 