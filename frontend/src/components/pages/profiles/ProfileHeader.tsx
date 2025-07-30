import { BadgeCheck, Edit2, ExternalLink, Globe, MapPin } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  type: "creator" | "brand";
  name: string;
  username?: string;
  tagline?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  profileImageUrl?: string;
  coverImageUrl?: string;
  editLink: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export default function ProfileHeader({
  type,
  name = "",
  username,
  tagline,
  location,
  website,
  isVerified = false,
  profileImageUrl,
  coverImageUrl,
  editLink,
  stats = [],
}: ProfileHeaderProps) {
  const isCreator = type === "creator";
  const primaryColor = isCreator ? "purple" : "blue";
  const gradientFrom = isCreator ? "from-purple-600" : "from-blue-600";
  const gradientTo = isCreator ? "to-indigo-600" : "to-cyan-600";
  const buttonBg = isCreator ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";
  
  const getFirstChar = (str?: string) => {
    if (!str) return isCreator ? 'C' : 'B';
    return str.charAt(0);
  };
  
  return (
    <>
      {/* Cover Image */}
      <div className={`h-64 sm:h-80 bg-gradient-to-r ${gradientFrom} ${gradientTo} relative`}>
        {coverImageUrl && (
          <img 
            src={coverImageUrl} 
            alt={`${name || 'Profile'} cover`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm -mt-16 mb-8 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0">
                  <div className={`w-full h-full ${isCreator ? 'rounded-full' : 'rounded-lg'} bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center border-4 border-white shadow-md overflow-hidden`}>
                    {profileImageUrl ? (
                      <img 
                        src={profileImageUrl} 
                        alt={name || (isCreator ? 'Creator' : 'Brand')} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${isCreator ? 'rounded-full' : 'rounded-lg'} bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white opacity-60">
                          {getFirstChar(name)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 flex flex-col md:flex-row">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {name || (isCreator ? 'Creator' : 'Brand')}
                  </h1>
                  
                  <div className="flex items-center justify-center md:justify-start mt-1 text-gray-500">
                    {isCreator && username && (
                      <span className="mr-2">@{username}</span>
                    )}
                    {isVerified && (
                      <BadgeCheck className={`w-4 h-4 text-${primaryColor}-500`} />
                    )}
                    {isCreator === false && isVerified && (
                      <span className="ml-1">Verified Brand</span>
                    )}
                  </div>
                  
                  {tagline && (
                    <p className="text-gray-600 mt-1">{tagline}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                    {location && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{location}</span>
                      </div>
                    )}
                    
                    {website && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a 
                          href={website.startsWith('http') ? website : `https://${website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`hover:text-${primaryColor}-600 transition-colors flex items-center`}
                        >
                          {website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 text-center md:text-right">
                  <Link href={editLink}>
                    <button className={`px-4 py-2 ${buttonBg} text-white rounded-lg transition duration-200 inline-flex items-center gap-2`}>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-8 border-t pt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 