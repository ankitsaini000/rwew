import React from 'react';
import { SocialLink } from '../../../types/profiles';
import { 
  FaTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaTiktok, 
  FaLinkedin,
  FaGlobe
} from 'react-icons/fa';

interface SocialMediaLinksProps {
  links: Record<string, SocialLink>;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  twitter: <FaTwitter />,
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  linkedin: <FaLinkedin />,
  website: <FaGlobe />
};

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ links, className = '' }) => {
  if (!links || Object.keys(links).length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {Object.entries(links).map(([platform, link]) => (
        <a 
          key={platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-primary-500 transition-colors duration-200"
          title={`${platform}: ${link.handle || ''}`}
        >
          {iconMap[platform.toLowerCase()] || <FaGlobe />}
        </a>
      ))}
    </div>
  );
};

export default SocialMediaLinks; 