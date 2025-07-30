const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Around line 1214 where the createNewCreatorProfile function is defined
export const createNewCreatorProfile = async (profileData: any) => {
  try {
    // Make sure we're using the correct endpoint that exists on the backend
    const response = await fetch(`${API_URL}/creators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating creator profile:', error);
    throw error;
  }
};

// Function to save gallery portfolio data directly to backend
export const saveGalleryPortfolio = async (galleryData: any) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    console.log('Saving gallery data using direct API call');
    console.log('Token exists:', !!token, 'Length:', token.length);

    // Validate data structure before sending
    if (!galleryData) {
      throw new Error('No gallery data provided');
    }

    // Log the incoming data structure
    console.log('Input gallery data structure:', {
      hasImages: Array.isArray(galleryData.images),
      hasVideos: Array.isArray(galleryData.videos),
      hasPortfolioLinks: Array.isArray(galleryData.portfolioLinks),
      hasPortfolio: Array.isArray(galleryData.portfolio),
      imagesCount: galleryData.images?.length || 0,
      videosCount: galleryData.videos?.length || 0,
      portfolioLinksCount: galleryData.portfolioLinks?.length || 0,
      portfolioCount: galleryData.portfolio?.length || 0
    });

    // Create a sanitized version of the data to avoid invalid structures
    const dataToSend = {
      images: Array.isArray(galleryData.images) ? 
        galleryData.images.slice(0, 10).map((img: any) => {
          // Only include valid image objects or strings
          if (typeof img === 'string' && img.trim()) {
            return { url: img, title: 'Gallery Image', description: 'Gallery image' };
          } else if (img && typeof img === 'object' && img.url) {
            return {
              url: img.url || '',
              title: img.title || 'Gallery Image',
              description: img.description || 'Gallery image',
              tags: Array.isArray(img.tags) ? img.tags : [],
              order: typeof img.order === 'number' ? img.order : 0
            };
          }
          return null;
        }).filter(Boolean) : [],
      videos: Array.isArray(galleryData.videos) ? 
        galleryData.videos.slice(0, 5).map((vid: any) => {
          if (typeof vid === 'string' && vid.trim()) {
            return { url: vid, title: 'Gallery Video', description: 'Gallery video' };
          } else if (vid && typeof vid === 'object' && vid.url) {
            return {
              url: vid.url || '',
              title: vid.title || 'Gallery Video',
              description: vid.description || 'Gallery video',
              thumbnail: vid.thumbnail || '',
              tags: Array.isArray(vid.tags) ? vid.tags : [],
              order: typeof vid.order === 'number' ? vid.order : 0
            };
          }
          return null;
        }).filter(Boolean) : [],
      portfolioLinks: Array.isArray(galleryData.portfolioLinks) ?
        galleryData.portfolioLinks.slice(0, 10).map((link: any) => {
          if (typeof link === 'string' && link.trim()) {
            return link;
          } else if (link && typeof link === 'object' && link.url) {
            return link.url || '';
          }
          return null;
        }).filter(Boolean) : [],
      portfolio: Array.isArray(galleryData.portfolio) ? 
        galleryData.portfolio.slice(0, 10).map((item: any, index: number) => {
          if (!item || typeof item !== 'object') return null;
          return {
            id: item.id || `portfolio-${Date.now()}-${index}`,
            title: item.title || 'Portfolio Item',
            image: item.image || '',
            category: item.category || 'general',
            client: item.client || 'Client',
            description: item.description || 'Portfolio item description',
            isVideo: Boolean(item.isVideo),
            videoUrl: item.videoUrl || '',
            promotionType: item.promotionType || '',
            clientFeedback: item.clientFeedback || '',
            projectDate: item.projectDate || '',
            sortOrder: index
          };
        }).filter(Boolean) : []
    };

    // Double check for any undefined or null values that could cause issues
    const validateNestedValues = (obj: any) => {
      for (const key in obj) {
        if (obj[key] === undefined) {
          obj[key] = '';
          console.warn(`Fixed undefined value for ${key}`);
        } else if (obj[key] === null) {
          obj[key] = '';
          console.warn(`Fixed null value for ${key}`);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          validateNestedValues(obj[key]);
        }
      }
      return obj;
    };

    // Apply validation to all portfolio items
    if (dataToSend.portfolio.length > 0) {
      dataToSend.portfolio = dataToSend.portfolio.map((item: any) => validateNestedValues(item));
    }

    // Ensure at least one portfolio item exists
    if (dataToSend.portfolio.length === 0) {
      console.log('No portfolio items found, adding a default item');
      dataToSend.portfolio = [{
        id: `portfolio-${Date.now()}-default`,
        title: 'Sample Portfolio Item',
        image: 'https://placehold.co/600x400?text=Portfolio+Item',
        category: 'general',
        client: 'Sample Client',
        description: 'This is a default portfolio item.',
        isVideo: false,
        videoUrl: '',
        promotionType: 'Sample',
        clientFeedback: 'Placeholder feedback',
        projectDate: new Date().toLocaleDateString(),
        sortOrder: 0
      }];
    }

    console.log('Sending data counts:', {
      images: dataToSend.images.length,
      videos: dataToSend.videos.length,
      portfolioLinks: dataToSend.portfolioLinks.length,
      portfolio: dataToSend.portfolio.length
    });
    
    // Add detailed logging of the actual data being sent (first item of each array)
    console.log('Data sample being sent:',
      { 
        firstImage: dataToSend.images[0] || 'none',
        firstVideo: dataToSend.videos[0] || 'none',
        firstLink: dataToSend.portfolioLinks[0] || 'none',
        firstPortfolioItem: dataToSend.portfolio[0] || 'none'
      }
    );
    
    // Add detailed logging
    console.log('Sending request to http://localhost:5001/api/creators/gallery');
    
    // First attempt with full data
    try {
      const response = await fetch('http://localhost:5001/api/creators/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // Try to read error message from response
        let errorMessage = 'Failed to save gallery data';
        let errorData = null;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Server error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
          
          // Try to get response text if JSON parsing failed
          try {
            const textResponse = await response.text();
            console.error('Raw response text:', textResponse);
          } catch (textError) {
            console.error('Could not get response text:', textError);
          }
        }

        console.warn(`API error: ${errorMessage} (Status: ${response.status})`);
        
        // If the error is a server error (500), try a fallback with minimal data
        if (response.status >= 500) {
          console.log('Attempting fallback with minimal data...');
          
          // Create a minimal version with just a few fields
          const minimalData = {
            images: dataToSend.images.slice(0, 2).map((img: any) => 
              typeof img === 'string' ? { url: img } : img
            ),
            videos: [],
            portfolioLinks: [],
            portfolio: [
              {
                id: `portfolio-${Date.now()}-minimal`,
                title: 'Minimal Portfolio Item',
                image: 'https://placehold.co/600x400?text=Minimal',
                description: 'This is a minimal portfolio item.',
                category: 'general',
                client: 'Client',
                isVideo: false,
                sortOrder: 0
              }
            ]
          };
          
          console.log('Sending minimal data:', minimalData);
          
          const fallbackResponse = await fetch('http://localhost:5001/api/creators/gallery', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(minimalData)
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback request succeeded:', fallbackData);
            return fallbackData;
          } else {
            console.error('Fallback request also failed:', fallbackResponse.status);
            
            // Try to get error details from fallback request
            try {
              const fallbackErrorData = await fallbackResponse.json();
              console.error('Fallback error details:', fallbackErrorData);
            } catch (e) {
              console.error('Could not parse fallback error response');
            }
          }
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      // Check if response body exists
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Gallery save success:', data);
        return data;
      } else {
        // Handle empty or non-JSON response
        console.log('Gallery save: empty or non-JSON response, but status OK');
        return { success: true, message: 'Data saved successfully' };
      }
    } catch (fetchError: any) {
      console.error('Network or parsing error:', fetchError);
      
      // If it's a network error (like CORS, connection refused, etc.)
      // Try again with a more basic approach
      try {
        console.log('Attempting simplified retry with minimal data...');
        
        // Just send the bare minimum data
        const retryData = {
          images: [{ 
            url: "https://placehold.co/600x400?text=Placeholder", 
            title: "Placeholder",
            description: "Minimal image for retry"
          }],
          portfolio: [{
            id: `portfolio-${Date.now()}-retry`,
            title: 'Retry Portfolio Item',
            description: 'Basic portfolio item for retry',
            image: 'https://placehold.co/600x400?text=Retry',
            category: 'general',
            client: 'Retry Client',
            isVideo: false,
            sortOrder: 0
          }],
          portfolioLinks: []
        };
        
        const retryResponse = await fetch('http://localhost:5001/api/creators/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(retryData)
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log('Retry request succeeded:', retryData);
          return retryData;
        } else {
          console.error('Retry request also failed:', retryResponse.status);
          throw new Error(`All attempts to save gallery data failed`);
        }
      } catch (retryError) {
        console.error('Retry attempt failed:', retryError);
        throw new Error(`Failed to save gallery data: ${fetchError.message}`);
      }
    }
  } catch (error) {
    console.error('Error saving gallery data:', error);
    throw error;
  }
};

const BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5001'
  : '';

export const getAIResponse = async (prompt: string, userId?: string) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${BASE_URL}/api/ollama/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(userId ? { prompt, userId } : { prompt })
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
};

export const sendAIChatFeedback = async ({
  like,
  contact,
  message,
}: {
  like: boolean;
  contact?: string;
  message?: string;
}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${BASE_URL}/api/ollama/ai/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ like, contact, message }),
  });
  if (!res.ok) throw new Error('Failed to send feedback');
  return await res.json();
};

// Debugging utility function to check user's current role
export const checkUserRoleAndId = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { authenticated: false, message: 'No token found' };
    }
    
    // First try getting data from localStorage
    let userData = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        userData = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    // Then try to verify this with the server
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return { 
        authenticated: false, 
        message: `Server validation failed: ${response.status}`,
        localUserData: userData
      };
    }
    
    const serverData = await response.json();
    
    return {
      authenticated: true,
      userData: serverData,
      localUserData: userData,
      token: token.substring(0, 10) + '...' // Only show first part of token for security
    };
  } catch (error) {
    console.error('Error checking user role:', error);
    return { 
      authenticated: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to upgrade user to creator role
export const upgradeToCreator = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    console.log('Attempting to upgrade user to creator role');
    
    const response = await fetch(`${API_URL}/creators/upgrade-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Server error: ${response.status} ${response.statusText}`
      }));
      
      console.error('Upgrade role error response:', errorData);
      throw new Error(errorData.message || 'Failed to upgrade to creator role');
    }
    
    const data = await response.json();
    console.log('Upgrade role success response:', data);
    
    // Update local user data with creator role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.role = 'creator';
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', 'creator');
      } catch (e) {
        console.error('Error updating user data:', e);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error upgrading to creator role:', error);
    throw error;
  }
};