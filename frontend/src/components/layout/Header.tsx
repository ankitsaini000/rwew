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

  const handleLikedCreatorsClick = () => {
    router.push('/liked-creators');
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
      <button
        onClick={onSettings}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Settings
      </button>
      <button
        onClick={handleLikedCreatorsClick}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Liked Creators
      </button>
      <button
        onClick={onLogout}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        Log out
      </button>
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
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    if (categoriesDropdownOpen) {
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

    return () => {
      document.removeEventListener(
        "show-auth-modal",
        handleShowAuthModal as EventListener
      );
    };
  }, []);

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

  const renderAuthSection = () => {
    if (user) {
      return (
        <div className="hidden md:flex items-center space-x-4" ref={menuRef}>
          <NotificationDropdown />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg"
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
      );
    }
    // Default auth buttons for other pages
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link
          href="/login"
          className="px-4 py-2 text-gray-600 hover:text-purple-600"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Register
        </Link>
      </div>
    );
  };

  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-purple-600">Logo</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div
            className="relative group"
            ref={categoriesRef}
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
              onClick={() => setCategoriesDropdownOpen(true)}
              type="button"
            >
              <span>Categories</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {categoriesDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 border z-50"
              >
                {categoriesLoading && (
                  <div className="px-4 py-2 text-gray-500 text-sm">Loading...</div>
                )}
                {categoriesError && (
                  <div className="px-4 py-2 text-red-500 text-sm">{categoriesError}</div>
                )}
                {!categoriesLoading && !categoriesError && categories.length === 0 && (
                  <div className="px-4 py-2 text-gray-500 text-sm">No categories found</div>
                )}
                {!categoriesLoading && !categoriesError && categories.map((cat: any) => (
                  <button
                    key={cat._id || cat.name}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      // TODO: navigate or filter by category
                      console.log("Category clicked:", cat.name);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="#" className="text-gray-600 hover:text-purple-600">
            Contact us
          </Link>
          {!user && (
            <button
              onClick={handleBecomingCreator}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {isBecomingCreatorPage ? "Hire an Influencer" : "Become a Creator"}
            </button>
          )}
        </div>

        {/* Auth Buttons - Dynamic rendering */}
        {renderAuthSection()}

        {/* Mobile Menu Button */}
        <div className="flex items-center sm:hidden ml-4">
          <button
            onClick={handleMobileMenuToggle}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/category/social-media"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Social Media
            </Link>
            <Link
              href="/category/content"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Content Creation
            </Link>
            <Link
              href="/category/marketing"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Marketing
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Contact
            </Link>
            {user && (
              <Link
                href="/profile-creation/basic-info"
                className="block px-3 py-2 text-base font-medium text-purple-600 hover:bg-purple-50"
              >
                Create Profile
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <NotificationDropdown />
                </div>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign up
                </Link>
              </div>
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

