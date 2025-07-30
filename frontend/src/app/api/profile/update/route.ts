import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    // Extract token from the request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get profile data from request body
    const profileData = await req.json();
    
    // Call the backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    // Determine which API endpoint to use based on role
    const role = profileData.role || (profileData.personalInfo ? 'creator' : 'brand');
    let updateEndpoint = '';
    
    if (role === 'creator') {
      updateEndpoint = `${apiUrl}/creators`;
    } else if (role === 'brand') {
      updateEndpoint = `${apiUrl}/brands`;
    } else {
      return NextResponse.json(
        { message: 'Invalid profile type' },
        { status: 400 }
      );
    }
    
    const response = await fetch(updateEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: 'Failed to update profile',
          error: errorData.message || response.statusText,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 