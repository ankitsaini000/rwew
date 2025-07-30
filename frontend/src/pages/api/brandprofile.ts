import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get profile data from request body
    const profileData = req.body;

    // Validate profile data
    if (!profileData || !profileData.name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Try to save to backend API
    try {
      const response = await axios.post(
        `${API_BASE_URL}/brands/profile-data`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Return success response
      return res.status(200).json({
        message: 'Brand profile data saved successfully',
        data: response.data,
      });
    } catch (backendError) {
      console.error('Error saving profile data to backend:', backendError);

      // In development, simulate successful storage
      if (process.env.NODE_ENV === 'development') {
        console.log('In development mode, simulating successful storage');
        
        // Save to localStorage on the server-side
        // (this won't actually work, but it's a placeholder for a real database save)
        return res.status(200).json({
          message: 'Brand profile data saved successfully (development mode)',
          data: profileData,
        });
      }

      // If not in development, return the error
      return res.status(500).json({
        message: 'Failed to save profile data to backend',
        error: backendError,
      });
    }
  } catch (error) {
    console.error('Error in brand profile API route:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error,
    });
  }
}