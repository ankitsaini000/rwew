"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from "next/navigation";
import { initializeCreatorProfile } from '../services/api';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  username?: string;
  avatar?: string;
  role: string;
  facebookId?: string;
  loginMethod?: 'email' | 'facebook';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: {
    email: string;
    password: string;
    fullName: string;
    username?: string;
    role?: string;
  }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  checkUserRole: () => Promise<string | null>;
  handleFacebookToken: (token: string) => Promise<void>;
  updateAuthData: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing token on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data with token
  const fetchUserData = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        // If the token is invalid or expired, clear authentication state
        if (response.status === 401 || response.status === 403) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        throw new Error('Failed to authenticate');
      }

      // Check if the response is empty
      const text = await response.text();
      if (!text) {
        throw new Error('Server returned an empty response');
      }

      const userData = JSON.parse(text);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user role - ensure it's either creator or brand
      if (userData.role === 'creator') {
        localStorage.setItem('userRole', 'creator');
        if (userData.username) {
          localStorage.setItem('username', userData.username);
        }
      } else {
        // For any other role or if role is not specified, set as brand
        localStorage.setItem('userRole', 'brand');
        localStorage.setItem('is_brand', 'true');
        localStorage.setItem('account_type', 'brand');
      }
      
      setError(null);
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed');
      // Clear authentication state on any error
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any existing authentication state before attempting login
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use the API service instead of direct fetch
      const { login } = await import('@/services/api');
      const data = await login(identifier, password);
      
      // If we got here, login was successful
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Ensure authentication state is cleared on login failure
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Set a user-friendly error message
      if (err.message && err.message.includes('Failed to fetch') || 
          err.code === 'ERR_NETWORK' || 
          err.code === 'ERR_CONNECTION_REFUSED') {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError(err.message || 'Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: { email: string; password: string; fullName: string; username?: string; role?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API service instead of direct fetch
      const { register } = await import('@/services/api');
      const data = await register(userData);
      
      // If we got here, signup was successful
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set user role based on registration data
      const role = userData.role || 'brand'; // Default to brand if no role specified
      localStorage.setItem('userRole', role);
      
      // Set additional information based on role
      if (role === 'creator') {
        // Creator-specific settings
        console.log('Setting up creator account');
      } else {
        // Brand-specific settings
        localStorage.setItem('is_brand', 'true');
        localStorage.setItem('account_type', 'brand');
        console.log('Setting up brand account');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      // Set a user-friendly error message
      if (err.message && err.message.includes('Failed to fetch') || 
          err.code === 'ERR_NETWORK' || 
          err.code === 'ERR_CONNECTION_REFUSED') {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError(err.message || 'Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookToken = async (authToken: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set token
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      // Fetch user data with token
      await fetchUserData(authToken);
    } catch (err: any) {
      console.error('Facebook authentication error:', err);
      setError('Facebook authentication failed');
      localStorage.removeItem('token');
      setToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('is_brand');
    localStorage.removeItem('account_type');
    localStorage.removeItem('brandName');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  const refreshUserData = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.log('No token available for refreshing user data');
        return;
      }
      
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user data');
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Server returned an empty response');
      }

      const userData = JSON.parse(text);
      console.log('Refreshed user data:', userData);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Ensure user role is set to either creator or brand
      if (userData.role === 'creator') {
        localStorage.setItem('userRole', 'creator');
        if (userData.username) {
          localStorage.setItem('username', userData.username);
        }
      } else {
        // Default to brand for any other role
        localStorage.setItem('userRole', 'brand');
        localStorage.setItem('is_brand', 'true');
        localStorage.setItem('account_type', 'brand');
      }
      
      return userData;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (): Promise<string | null> => {
    try {
      // Try to get from current user state first
      if (user && user.role) {
        console.log('Getting role from current user state:', user.role);
        return user.role;
      }
      
      // Otherwise refresh from backend
      const refreshedData = await refreshUserData();
      if (refreshedData && refreshedData.role) {
        console.log('Getting role from refreshed user data:', refreshedData.role);
        return refreshedData.role;
      }
      
      return null;
    } catch (err) {
      console.error('Error checking user role:', err);
      return null;
    }
  };

  const updateAuthData = (data: Partial<User>) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        logout,
        signup,
        refreshUserData,
        checkUserRole,
        handleFacebookToken,
        updateAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
