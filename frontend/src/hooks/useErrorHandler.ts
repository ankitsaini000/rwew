import { useState, useEffect, useCallback } from 'react';

interface ErrorHandlerOptions {
  suppressToasts?: boolean;
  showPopup?: boolean;
  popupTitle?: string;
  popupMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [hasShownError, setHasShownError] = useState(false);

  // Check if we've already shown an error in this session
  useEffect(() => {
    const errorShown = sessionStorage.getItem('creator-dashboard-error-shown');
    if (errorShown === 'true') {
      setHasShownError(true);
    }
  }, []);

  const handleError = useCallback((error: any, customTitle?: string, customMessage?: string) => {
    // Don't show errors if we've already shown one in this session
    if (hasShownError) {
      return;
    }

    // Determine if this is a resource not found error
    const isResourceNotFound = error?.response?.status === 404 || 
                              error?.message?.includes('Resource not found') ||
                              error?.config?.url?.includes('brand-experience-reviews') ||
                              error?.config?.url?.includes('reviews/order');

    // Only handle resource not found errors for the popup
    if (isResourceNotFound && options.showPopup !== false) {
      const title = customTitle || 'Connection Issue';
      const message = customMessage || 
        "Some resources couldn't be loaded. This won't affect your main dashboard functionality.";
      
      setErrorTitle(title);
      setErrorMessage(message);
      setShowErrorPopup(true);
      setHasShownError(true);
      
      // Mark that we've shown an error in this session
      sessionStorage.setItem('creator-dashboard-error-shown', 'true');
      
      // Log the error for debugging (but don't show to user)
      console.log('Handled resource not found error:', {
        url: error?.config?.url,
        status: error?.response?.status,
        message: error?.message
      });
    }
  }, [hasShownError, options.showPopup]);

  const closeErrorPopup = useCallback(() => {
    setShowErrorPopup(false);
  }, []);

  const resetErrorState = useCallback(() => {
    setHasShownError(false);
    sessionStorage.removeItem('creator-dashboard-error-shown');
  }, []);

  return {
    showErrorPopup,
    errorMessage,
    errorTitle,
    hasShownError,
    handleError,
    closeErrorPopup,
    resetErrorState
  };
}; 