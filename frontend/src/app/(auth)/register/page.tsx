"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaFacebook } from "react-icons/fa";

// Define type for user registration data
interface UserRegistrationData {
  name: string;
  email: string;
  username?: string; // Make username optional for general use
  password: string;
  role?: string;
}

// Remove mock function and use real API
// const mockRegisterUser = async (userData: UserRegistrationData) => {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   
//   // Return mock successful response
//   return {
//     token: "mock-jwt-token",
//     user: {
//       id: "mock-user-id",
//       name: userData.name,
//       email: userData.email,
//       role: userData.role
//     }
//   };
// };

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "", // Add username to state
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();

  useEffect(() => {
    const type = searchParams?.get("type") as "creator" | "brand" | null;
    setUserType(type);
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'creator') {
        router.push('/creator-dashboard');
      } else if (userRole === 'brand') {
        router.push('/brand-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!userType) {
      setError("Please select whether you're joining as an Influencer or a Brand");
      return;
    }

    // Validate username only if userType is brand
    if (userType === "brand" && !formData.username) {
      setError("Username is required for brand registration");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Submitting registration data:", {
        fullName: formData.fullName,
        email: formData.email,
        username: userType === "brand" ? formData.username : undefined, // Conditionally pass username
        password: formData.password,
        role: userType
      });
      
      // Use the auth context signup function with the correct parameters
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        username: userType === "brand" ? formData.username : undefined, // Conditionally pass username
        password: formData.password,
        role: userType
      });
      
      // The role and related settings will be set by the signup function in AuthContext
      // The auth context will update isAuthenticated, which will trigger the redirect useEffect
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/facebook';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {userType === "creator"
              ? "Join as an Influencer"
              : userType === "brand"
              ? "Register as a Brand"
              : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {userType === "creator"
              ? "Showcase your talent and connect with brands"
              : userType === "brand"
              ? "Find the perfect influencers for your campaigns"
              : "Choose your account type below"}
          </p>

          {!userType && (
            <div className="mt-6 flex flex-col space-y-4">
              <button
                onClick={() => setUserType("creator")}
                className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none"
              >
                Join as Influencer
              </button>
              <button
                onClick={() => setUserType("brand")}
                className="group relative flex w-full justify-center rounded-md border-2 border-purple-600 py-3 px-4 text-sm font-medium text-purple-600 hover:bg-purple-50 focus:outline-none"
              >
                Register as Brand
              </button>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="group relative w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none"
              >
                <FaFacebook className="h-5 w-5 mr-2" />
                Continue with Facebook
              </button>
            </div>
          )}
        </div>

        {userType && (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {/* Conditionally render username field for brands */}
                {userType === "brand" && (
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Username (for brand profile)"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="group relative w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2]"
                >
                  <FaFacebook className="h-5 w-5 mr-2" />
                  Continue with Facebook
                </button>
              </div>

              <div className="text-center">
                <p className="mt-2 text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
