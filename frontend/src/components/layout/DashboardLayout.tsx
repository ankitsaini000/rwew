"use client";

import {
  Home,
  Search,
  MessageSquare,
  Heart,
  User,
  Settings,
  LogOut,
  Menu,
  Star,
  LayoutDashboard,
  Briefcase,
  Edit2,
  Megaphone,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NotificationDropdown from "../NotificationDropdown";
import { useMessageStore } from '../../store/messageStore';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '../../context/NotificationContext';
// import { checkUserRole } from '@/services/api';

import { Footer } from "./Footer";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const { logout, user, isAuthenticated, checkUserRole } = useAuth();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const { unreadCount: unreadMessages, setUnreadCount } = useMessageStore();
  const { unreadCount: unreadNotifications, fetchNotifications } = useNotifications();
  const socket = useSocket();

  // Redirect to login if not authenticated on dashboard pages
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      // Get current path
      const path = window.location.pathname;
      
      // Check if we're on a protected route
      const isProtectedRoute = 
        path.includes('/dashboard') || 
        path.includes('/creator-dashboard') || 
        path.includes('/brand-dashboard') ||
        path.includes('/profile') ||
        path.includes('/settings') ||
        path.includes('/messages');
      
      // Only redirect if we're on a protected route and not already on login/register
      if (isProtectedRoute && 
          !path.includes('/login') && 
          !path.includes('/register')) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  // Check user account type directly from backend
  useEffect(() => {
    const determineUserRole = async () => {
      setIsRoleLoading(true);
      try {
        if (!isAuthenticated) {
          console.log('User not authenticated, cannot determine role');
          setIsCreator(false);
          setIsBrand(false);
          setIsRoleLoading(false);
          return;
        }
        
        console.log('Checking user role directly from backend...');
        const role = await checkUserRole();
        console.log('Role determined from backend:', role);
        
        if (role === 'creator') {
          console.log('Setting role as creator');
          setIsCreator(true);
          setIsBrand(false);
        } else if (role === 'brand') {
          console.log('Setting role as brand');
          setIsBrand(true);
          setIsCreator(false);
        } else {
          console.log('No specific role found or role is client/user');
          setIsCreator(false);
          setIsBrand(false);
        }
      } catch (error) {
        console.error('Error determining user role:', error);
        // Fall back to localStorage as a last resort
        checkLocalStorageRoles();
      } finally {
        setIsRoleLoading(false);
      }
    };
    
    const checkLocalStorageRoles = () => {
      if (typeof window !== 'undefined') {
        try {
          // First check for explicit role indicators
          const userRole = localStorage.getItem('userRole');
          const isCreatorRole = userRole === 'creator';
          const isBrandRole = userRole === 'brand';
          
          // Log the initial role check
          console.log('Initial role check:', { userRole, isCreatorRole, isBrandRole });
          
          // Then check additional creator indicators
          const hasCreatorProfile = localStorage.getItem('creator_profile_exists') === 'true';
          const justPublished = localStorage.getItem('just_published') === 'true';
          const creatorUsername = localStorage.getItem('username');
          
          // And brand indicators
          const brandIndicator = localStorage.getItem('is_brand') === 'true';
          const brandAccountType = localStorage.getItem('account_type') === 'brand';
          const brandName = localStorage.getItem('brandName');
          
          // Check stored user data as a final fallback
          let userDataRole = null;
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              userDataRole = parsedUser.role;
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
          
          // Determine account types with clear precedence
          // Priority: explicit role > specific indicators > user data
          
          // Is this a brand?
          const brandStatus = isBrandRole || brandIndicator || brandAccountType || userDataRole === 'brand';
          setIsBrand(brandStatus);
          
          // Is this a creator? (and not a brand)
          const creatorStatus = !brandStatus && (
            isCreatorRole || 
            hasCreatorProfile || 
            justPublished || 
            (creatorUsername && creatorUsername.length > 0) ||
            userDataRole === 'creator'
          );
          setIsCreator(creatorStatus);
          
          // Extensive logging for debugging
          console.log('Account status determination:', { 
            // Creator indicators
            hasCreatorProfile,
            justPublished,
            creatorUsername,
            isCreatorRole,
            // Brand indicators
            brandIndicator,
            brandAccountType, 
            brandName,
            isBrandRole,
            // User data
            userDataRole,
            // Final determination
            isBrand: brandStatus,
            isCreator: creatorStatus 
          });
        } catch (error) {
          console.error('Error checking account type:', error);
        }
      }
    };
    
    // Only run this when authenticated status changes
    determineUserRole();
  }, [isAuthenticated, checkUserRole]);

  // Get user data from localStorage or API for profile display
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        try {
          setIsUserDataLoading(true);
          
          // Check if user is logged in from auth context
          if (!isAuthenticated || !user) {
            console.log('User not authenticated, showing guest info');
            setUserName("Guest");
            setUserEmail("guest@gmail.com");
            setIsUserDataLoading(false);
            return;
          }
          
          // We have authenticated user from context
          console.log('User authenticated, loading profile data', user);
          
          // Set data from user context
          if (user.fullName) {
            setUserName(user.fullName);
          } else if (user.email) {
            setUserName(user.email.split('@')[0]);
          }
          
          if (user.email) {
            setUserEmail(user.email);
          }
          
          // Try to fetch more complete user data if needed
          if (!user.fullName) {
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/users/profile`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  if (userData.fullName) {
                    setUserName(userData.fullName);
                    localStorage.setItem('fullName', userData.fullName);
                  }
                  if (userData.email) {
                    setUserEmail(userData.email);
                    localStorage.setItem('email', userData.email);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsUserDataLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user, isAuthenticated]);

  useEffect(() => {
    async function fetchUnreadCount() {
      console.log('fetchUnreadCount called');
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';
      try {
        const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const conversations = await res.json();
          const convos = Array.isArray(conversations) ? conversations : conversations.data || [];
          const totalUnread = convos.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
          console.log('Unread count updated:', totalUnread);
        }
      } catch (e) {
        setUnreadCount(0);
        console.log('Error fetching unread count:', e);
      }
    }
    fetchUnreadCount();
    if (!socket) {
      console.log('Socket not available');
      return;
    }
    console.log('Setting up socket listeners for new_message, message_read, and newNotification');
    socket.on('new_message', fetchUnreadCount);
    socket.on('message_read', fetchUnreadCount);
    socket.on('newNotification', fetchNotifications);
    // Fallback polling every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => {
      socket.off('new_message', fetchUnreadCount);
      socket.off('message_read', fetchUnreadCount);
      socket.off('newNotification', fetchNotifications);
      clearInterval(interval);
    };
  }, [setUnreadCount, socket, fetchNotifications]);

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    
    // Redirect to login page
    router.push("/login");
  };

  const getCreatorProfileUrl = () => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      
      if (username) {
        return `/creator/${username}`;
      }
    }
    
    // Fallback to dashboard
    return '/creator-dashboard';
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Find Creators", href: "/find-creators", icon: Search },
    { name: "Available Promotions", href: "/available-promotions", icon: Megaphone },
    { name: "Messages", href: "/messages", icon: MessageSquare, showBadge: true, badgeCount: unreadMessages },
    { name: "Notifications", href: "/notifications", icon: Bell, showBadge: true, badgeCount: unreadNotifications },
    { name: "Likes", href: "/liked-creators", icon: Heart },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Set sidebar default state based on screen size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      };
      handleResize(); // Set on mount
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar Overlay for Mobile/Tablet */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden transition-opacity duration-300"
          aria-label="Sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar - Desktop/Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Close button for mobile/tablet */}
        <button
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center py-6 mb-8 border-b border-gray-100">
            <Link href="/" className="flex items-center" onClick={() => setIsSidebarOpen(false)}>
              <span className="text-2xl font-semibold text-purple-600">Influencer</span>
              <span className="text-2xl font-semibold text-gray-900">Market</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <ul className="space-y-4 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg hover:bg-gray-100 group ${
                      pathname === item.href ? "text-purple-600" : "text-gray-900"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="ml-5 text-base relative">
                      {item.name}
                      {item.showBadge && item.badgeCount > 0 && (
                        <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
            {isRoleLoading ? (
              <li className="pt-2">
                <div className="h-12 bg-gray-200 rounded animate-pulse mt-4"></div>
              </li>
            ) : (
              <>
                <li className="pt-2">
                  {/* Show appropriate dashboard link based on account type */}
                  {isBrand ? (
                    <Link
                      href="/brand-dashboard"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="ml-5 text-base">Brand Dashboard</span>
                    </Link>
                  ) : isCreator ? (
                    <Link
                      href="/creator-dashboard"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="ml-5 text-base">Creator Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href="/become-creator"
                      className="flex items-center p-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 group mt-4"
                    >
                      <Star className="w-5 h-5" />
                      <span className="ml-5 text-base">Become a Creator</span>
                    </Link>
                  )}
                </li>
              </>
            )}
          </ul>
          
          {/* User Profile at bottom */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {isAuthenticated && user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User avatar"
                    className="object-cover w-full h-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full`}></span>
              </div>
              <div className="flex-1 min-w-0">
                {isUserDataLoading ? (
                  <>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {isAuthenticated ? userName : "Guest"}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {isAuthenticated ? userEmail : "guest@gmail.com"}
                    </p>
                  </>
                )}
              </div>
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Sign in"
                >
                  <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">→</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:hidden">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Mobile notification bell */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </div>

        {/* Desktop Header with Notifications */}
        <div className="hidden lg:flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          
          {/* Desktop notification bell and user actions */}
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome back, {userName}
              </span>
            </div>
          </div>
        </div>

        {/* Content Wrapper - includes main content and footer */}
        <div className="flex flex-col flex-1">
          {/* Page Content */}
          <main className="flex-grow p-0">
            {children}
          </main>
          
          {/* Footer - not under sidebar in desktop view */}
          <div className="lg:ml-0">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};
