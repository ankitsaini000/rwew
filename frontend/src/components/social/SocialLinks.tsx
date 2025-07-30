import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

interface SocialLinksProps {
  links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  links = {}, 
  className = ''
}) => {
  const defaultLinks = {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com'
  };

  const socialLinks = { ...defaultLinks, ...links };

  return (
    <div className={`flex gap-3 ${className}`}>
      {socialLinks.facebook && (
        <a 
          href={socialLinks.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transform hover:scale-110 transition-all duration-200"
          aria-label="Facebook"
        >
          <FaFacebook size={18} />
        </a>
      )}
      
      {socialLinks.twitter && (
        <a 
          href={socialLinks.twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transform hover:scale-110 transition-all duration-200"
          aria-label="Twitter"
        >
          <FaTwitter size={18} />
        </a>
      )}
      
      {socialLinks.instagram && (
        <a 
          href={socialLinks.instagram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 transform hover:scale-110 transition-all duration-200"
          aria-label="Instagram"
        >
          <FaInstagram size={18} />
        </a>
      )}
      
      {socialLinks.linkedin && (
        <a 
          href={socialLinks.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transform hover:scale-110 transition-all duration-200"
          aria-label="LinkedIn"
        >
          <FaLinkedin size={18} />
        </a>
      )}
      
      {socialLinks.youtube && (
        <a 
          href={socialLinks.youtube} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transform hover:scale-110 transition-all duration-200"
          aria-label="YouTube"
        >
          <FaYoutube size={18} />
        </a>
      )}
    </div>
  );
};

export default SocialLinks; 