import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

/**
 * A component to safely display profile images from various sources
 * including Facebook and other external providers
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text 
 * @param {number} props.size - Image size in pixels (used for both width and height)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.fallbackSrc - Fallback image URL if the main image fails
 */
const ProfileImage = ({ 
  src, 
  alt = 'Profile Image', 
  size = 40, 
  className = '',
  fallbackSrc = '/images/default-avatar.png'
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isError, setIsError] = React.useState(false);

  // Update image source when prop changes
  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
      setIsError(false);
    }
  }, [src]);

  // Handle image load error
  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Check if this is a Facebook image
  const isFacebookImage = imgSrc && (
    imgSrc.includes('platform-lookaside.fbsbx.com') || 
    imgSrc.includes('graph.facebook.com')
  );

  // For external images that may have CORS issues, use a more permissive loading strategy
  const loadingStrategy = isFacebookImage ? 'eager' : 'lazy';

  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={alt}
          width={size}
          height={size}
          loading={loadingStrategy}
          quality={80}
          className="object-cover rounded-full"
          onError={handleError}
          unoptimized={isFacebookImage} // Skip optimization for Facebook images
        />
      ) : (
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full"
        >
          <span className="text-gray-500 text-xs">{alt.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

ProfileImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string
};

export default ProfileImage; 