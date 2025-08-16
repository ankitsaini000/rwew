"use client";

import { Menu, ChevronDown, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AuthModal } from "../auth/AuthModal";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../NotificationDropdown";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { getCategories } from "../../services/api";

// Add this type for the dropdown menu
interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

// Add UserMenu component
const UserMenu = ({ isOpen, onClose, onLogout, onSettings }: UserMenuProps) => {
  const router = useRouter();
  
  if (!isOpen) return null;

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-200 z-50">
      <button onClick={() => go('/dashboard')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</button>
      <button onClick={() => go('/profile')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
      <button onClick={() => go('/liked-creators')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Liked Creators</button>
      <button onClick={onSettings} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
      <div className="my-1 h-px bg-gray-100" />
      <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</button>
    </div>
  );
};

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">(
    "login"
  );
  const { user, logout } = useAuth();
  const [isBecomingCreator, setIsBecomingCreator] = useState(false);

  const isBecomingCreatorPage = pathname === "/become-creator";

  // Add these states
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const categoriesRef = React.useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    setCategoriesLoading(true);
    getCategories()
      .then((data) => {
        setCategories(data);
        setCategoriesError(null);
      })
      .catch((err) => {
        setCategoriesError("Failed to load categories");
        setCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if the click is completely outside the categories section
      // AND not on any element inside the dropdown
      if (categoriesRef.current && 
          !categoriesRef.current.contains(event.target as Node) &&
          // Check if the click target is not inside the dropdown
          !(event.target as HTMLElement).closest('.animate-fadeInUp')) {
        setCategoriesDropdownOpen(false);
      }
    };
    
    // Only add the event listener when the dropdown is open
    if (categoriesDropdownOpen) {
      // Use mousedown instead of click to handle the event earlier
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoriesDropdownOpen]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/settings");
    setUserMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openAuthModal = (view: "login" | "register") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const handleShowAuthModal = (e: CustomEvent) => {
      setAuthModalView(e.detail.view);
      setIsAuthModalOpen(true);
    };

    document.addEventListener(
      "show-auth-modal",
      handleShowAuthModal as EventListener
    );

    // Close mobile menu when clicking outside
    const handleClickOutsideMobileMenu = (event: MouseEvent) => {
      // Check if mobile menu is open and the click is outside the menu and not on the menu toggle button
      if (isMobileMenuOpen && 
          !(event.target as HTMLElement).closest('.md\\:hidden') && 
          !(event.target as HTMLElement).closest('button[aria-label]')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMobileMenu);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideMobileMenu);
    }

    return () => {
      document.removeEventListener(
        "show-auth-modal",
        handleShowAuthModal as EventListener
      );
      document.removeEventListener("mousedown", handleClickOutsideMobileMenu);
    };
  }, [isMobileMenuOpen]);

  const handleBecomingCreator = () => {
    if (isBecomingCreatorPage) {
      if (!user) {
        openAuthModal("login");
      } else {
        router.push("/search");
      }
    } else {
      router.push("/become-creator");
    }
  };

  return (
    <header className="glass-effect sticky top-0 z-50 backdrop-blur-lg">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse-slow">Logo</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div
            className="relative group"
            ref={categoriesRef}
          >
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
              type="button"
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              aria-expanded={categoriesDropdownOpen}
            >
              <span>Categories</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-3 z-50 animate-fadeInUp"
              >
                {categoriesLoading && (
                  <div className="px-4 py-2 text-gray-500 text-sm flex items-center justify-center">
                    <span className="mr-2">Loading</span>
                    <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                {categoriesError && (
                  <div className="px-4 py-2 text-red-500 text-sm">{categoriesError}</div>
                )}
                {!categoriesLoading && !categoriesError && categories.length === 0 && (
                  <div className="px-4 py-2 text-gray-500 text-sm">No categories found</div>
                )}
                <div className="max-h-60 overflow-y-auto">
                  {!categoriesLoading && !categoriesError && categories.map((cat: any) => (
                    <button
                      key={cat._id || cat.name}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      onClick={() => {
                        // Navigate to category page
                        router.push(`/categories/${encodeURIComponent(cat.name)}`);
                        setCategoriesDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/support" className="text-gray-700 hover:text-purple-600 transition-colors">
            Contact us
          </Link>
          {!user && (
            <button
              onClick={handleBecomingCreator}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {isBecomingCreatorPage ? "Hire an Influencer" : "Become a Creator"}
            </button>
          )}
        </div>

        {/* Auth Buttons - Updated styling */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4" ref={menuRef}>
              <NotificationDropdown />
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {(user.fullName || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700">
                    {user.fullName || user.email.split("@")[0]}
                  </span>
                </button>
                <UserMenu
                  isOpen={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  onLogout={handleLogout}
                  onSettings={handleSettings}
                />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={handleMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-white/30 active:bg-white/40 transition-colors"
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/70 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-purple-600"
                type="button"
                aria-expanded={categoriesDropdownOpen}
              >
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesDropdownOpen && (
                <div className="bg-white/90 rounded-lg shadow-md border border-gray-100 py-2 mt-1 z-50 animate-fadeInUp">
                  {categoriesLoading && (
                    <div className="px-4 py-2 text-gray-500 text-sm flex items-center justify-center">
                      <span className="mr-2">Loading</span>
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                  {categoriesError && (
                    <div className="px-4 py-2 text-red-500 text-sm">{categoriesError}</div>
                  )}
                  {!categoriesLoading && !categoriesError && categories.length === 0 && (
                    <div className="px-4 py-2 text-gray-500 text-sm">No categories found</div>
                  )}
                  <div className="max-h-60 overflow-y-auto">
                    {!categoriesLoading && !categoriesError && categories.map((cat: any) => (
                      <button
                        key={cat._id || cat.name}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        onClick={() => {
                          router.push(`/categories/${encodeURIComponent(cat.name)}`);
                          setCategoriesDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/support" className="block text-gray-700 hover:text-purple-600">Contact us</Link>
            {!user && (
              <>
                <button
                  onClick={handleBecomingCreator}
                  className="block w-full text-left text-gray-700 hover:text-purple-600"
                >
                  {isBecomingCreatorPage ? 'Hire an Influencer' : 'Become a Creator'}
                </button>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    Register
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </header>
  );
};

