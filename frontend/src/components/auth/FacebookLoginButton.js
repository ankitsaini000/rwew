import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';

/**
 * A reusable Facebook login button component
 * 
 * @param {string} type - The registration type ('brand' or 'creator')
 * @param {string} className - Additional CSS classes
 * @param {string} label - Button label text
 */
const FacebookLoginButton = ({ type = 'generic', className = '', label = 'Continue with Facebook' }) => {
  // Base URL for backend API
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  
  // Generate the correct endpoint based on the registration type
  const getFacebookAuthUrl = () => {
    switch (type) {
      case 'brand':
        return `${apiBaseUrl}/api/auth/facebook/brand`;
      case 'creator':
        return `${apiBaseUrl}/api/auth/facebook/creator`;
      default:
        return `${apiBaseUrl}/api/auth/facebook`;
    }
  };

  const handleClick = () => {
    // Redirect to the Facebook authentication endpoint
    window.location.href = getFacebookAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 w-full py-2 px-4 bg-facebook text-white rounded-md hover:bg-facebook-dark transition-colors ${className}`}
    >
      <FontAwesomeIcon icon={faFacebookF} />
      <span>{label}</span>
    </button>
  );
};

FacebookLoginButton.propTypes = {
  type: PropTypes.oneOf(['generic', 'brand', 'creator']),
  className: PropTypes.string,
  label: PropTypes.string
};

export default FacebookLoginButton; 