"use client";

import { useEffect, useState, Suspense } from "react";
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

function RegisterForm() {
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
    window.location.href = 'https://rwew.onrender.com/api/auth/facebook';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-120 h-120 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="glass-morphism max-w-md w-full space-y-6 p-5 sm:p-6 md:p-8 animate-fadeIn relative z-10 mx-4 sm:mx-auto">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            {userType === "creator"
              ? "Join as an Influencer"
              : userType === "brand"
              ? "Register as a Brand"
              : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            {userType === "creator"
              ? "Showcase your talent and connect with brands"
              : userType === "brand"
              ? "Find the perfect influencers for your campaigns"
              : "Choose your account type below"}
          </p>

          {!userType && (
            <div className="mt-6 sm:mt-8 flex flex-col space-y-4 animate-fadeInUp">
              <button
                onClick={() => setUserType("creator")}
                className="group relative flex w-full justify-center rounded-lg py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Join as Influencer
              </button>
              <button
                onClick={() => setUserType("brand")}
                className="glass-button group relative flex w-full justify-center rounded-lg py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium text-purple-600 hover:text-purple-700 border-2 border-purple-200 hover:border-purple-300 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Register as Brand
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="group relative w-full flex items-center justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Continue with Facebook
              </button>
            </div>
          )}
        </div>

        {userType && (
          <>
            {error && (
              <div className="bg-red-50 backdrop-blur-sm bg-opacity-70 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm animate-fadeIn">
                {error}
              </div>
            )}
            <form className="mt-6 space-y-5 animate-fadeIn" onSubmit={handleSubmit}>
              <div className="rounded-lg shadow-sm space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="glass-input appearance-none relative block w-full px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="glass-input appearance-none relative block w-full px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {/* Conditionally render username field for brands */}
                {userType === "brand" && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="glass-input appearance-none relative block w-full px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="Username (for brand profile)"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="glass-input appearance-none relative block w-full px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="glass-input appearance-none relative block w-full px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
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
                  className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : 'Create account'}
                </button>
              </div>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs sm:text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="group relative w-full flex items-center justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-[#4267B2] hover:bg-[#3b5998] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4267B2] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Continue with Facebook
                </button>
              </div>

              <div className="text-center">
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
