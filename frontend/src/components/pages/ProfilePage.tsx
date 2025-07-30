import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import ModernCreatorProfile from "@/components/pages/profiles/ModernCreatorProfile";
import ModernBrandProfile from "@/components/pages/profiles/ModernBrandProfile";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Define the API base URL from environment variables or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const ProfilePage = () => {
  const { user, checkUserRole } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoleAndProfile = async () => {
      try {
        setLoading(true);
        
        // Get user role from auth context
        const role = await checkUserRole();
        setUserRole(role);
        console.log("User role detected:", role);

        // For brands, we don't need to fetch profile data, they can start with an empty form
        if (role === "brand") {
          console.log("Brand role detected, skipping profile data fetch");
          setLoading(false);
          return;
        }

        // Fetch profile data based on role (for creators)
        if (role) {
          try {
            // Get auth token
            const token = localStorage.getItem("token");
            if (!token) {
              console.error("No authentication token found");
              setError("Authentication required. Please log in again.");
              setLoading(false);
              return;
            }
            
            console.log("Fetching profile data for role:", role);
            
            // First try the direct endpoint using the external API
            // Note: Using the backend API_BASE_URL instead of relative paths
            let data = null;
            let fetchSuccess = false;
            
            try {
              // Define API endpoint based on role
              const endpoint = role === "creator" 
                ? `${API_BASE_URL}/creators/profile-data`
                : `${API_BASE_URL}/brands/profile-data`;
              
              console.log("Attempting to fetch from:", endpoint);
              
              const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                }
              });
              
              console.log("External API response status:", response.status);
              
              if (response.ok) {
                const responseData = await response.json();
                console.log("✅ Profile data successfully fetched from external API:", responseData);
                data = responseData;
                fetchSuccess = true;
              } else {
                console.log("External API request failed, status:", response.status);
              }
            } catch (externalApiError) {
              console.error("Error fetching from external API:", externalApiError);
            }
            
            // If external API failed, try the Next.js API route
            if (!fetchSuccess) {
              console.log("Trying Next.js API route as fallback...");
              
              const fallbackEndpoint = "/api/profile/current";
              const fallbackResponse = await fetch(fallbackEndpoint, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                }
              });
              
              console.log("Next.js API response status:", fallbackResponse.status);
              
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                console.log("✅ Successfully fetched profile data from Next.js API:", fallbackData);
                data = fallbackData;
                fetchSuccess = true;
              } else {
                console.log("Next.js API request failed, status:", fallbackResponse.status);
              }
            }
            
            // If both attempts fail, try to get from localStorage as last resort
            if (!fetchSuccess) {
              console.log("Trying localStorage as last resort...");
              const storedData = localStorage.getItem(`${role}_profile_data`);
              
              if (storedData) {
                try {
                  const parsedData = JSON.parse(storedData);
                  console.log("✅ Retrieved profile data from localStorage:", parsedData);
                  data = { data: parsedData };
                  fetchSuccess = true;
                } catch (parseError) {
                  console.error("Error parsing stored data:", parseError);
                }
              }
            }
            
            // If all attempts failed
            if (!fetchSuccess) {
              throw new Error("Failed to fetch profile data from all available sources");
            }
            
            // Process and store the successful data
            if (data && data.data) {
              setProfileData(data.data);
              
              // Store in localStorage for future use
              try {
                localStorage.setItem(`${role}_profile_data`, JSON.stringify(data.data));
              } catch (storageError) {
                console.warn("Could not store profile data in localStorage:", storageError);
              }
              
              if (role === "creator") {
                console.log("✅ Creator profile data processed successfully");
              } else {
                console.log("✅ Brand profile data processed successfully");
              }
            } else {
              console.warn("Received data is missing the expected structure:", data);
              setError("Profile data has an unexpected format");
            }
          } catch (profileError: any) {
            console.error("Error fetching profile:", profileError);
            setError(`Failed to load profile data: ${profileError.message}`);
          }
        }
      } catch (err: any) {
        console.error("Error determining user role:", err);
        setError(`Failed to determine user role: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndProfile();
  }, [checkUserRole]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* For brand users, we always show the profile component regardless of profileData */}
      {userRole === "brand" ? (
        <ModernBrandProfile profileData={profileData} />
      ) : profileData ? (
        // For creators, we require profile data
        userRole === "creator" ? (
          <ModernCreatorProfile profileData={profileData} />
        ) : (
          // Handle case where user role is neither creator nor brand
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Profile Setup Required</h2>
              <p className="text-gray-600">Please set up your profile as either a creator or brand to continue.</p>
            </div>
          </div>
        )
      ) : (
        // If no profile data, show error message
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Profile Not Available</h2>
            <p className="text-gray-600">{error || "Unable to load profile data. Please try again later."}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
