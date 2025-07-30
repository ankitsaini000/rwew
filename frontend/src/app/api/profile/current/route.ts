import { NextRequest, NextResponse } from "next/server";

// This ensures the route is handled at runtime and not statically optimized
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Extract token from the request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Call the backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${apiUrl}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Ensure the response is not cached
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: 'Failed to fetch profile',
          error: errorData.message || response.statusText,
        },
        { status: response.status, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}