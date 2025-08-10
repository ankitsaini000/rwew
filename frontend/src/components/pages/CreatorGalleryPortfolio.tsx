'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Upload, X, Plus, FileVideo, HelpCircle, UserCheck, Info } from 'lucide-react';
import { Image as LucideImage } from 'lucide-react';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { toast } from 'react-hot-toast';
import { saveGalleryPortfolio } from '@/services/creatorApi';
import { upgradeToCreator, checkUserRoleAndId } from '@/api/api';
import axios from 'axios';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const CreatorGalleryPortfolio = () => {
  const router = useRouter();
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<Array<{ title: string; url: string }>>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<Array<{
    id: string;
    title: string;
    image: string;
    category: string;
    client?: string;
    description?: string;
    isVideo?: boolean;
    videoUrl?: string;
    promotionType?: string;
    projectDate?: string;
  }>>([]);
  
  const [newItem, setNewItem] = useState({
    title: '',
    image: '',
    category: 'photography',
    client: '',
    description: '',
    isVideo: false,
    videoUrl: '',
    promotionType: '',
  });
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'portfolio'
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add state to track editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Categories for portfolio items
  // const categories = [
  //   { id: 'photography', name: 'Photography' },
  //   { id: 'video', name: 'Video' },
  //   { id: 'design', name: 'Design' },
  //   { id: 'branding', name: 'Branding' },
  //   { id: 'social', name: 'Social Media' },
  //   { id: 'web', name: 'Web Development' }
  // ];

  const [categories, setCategories] = useState<Array<{ id: string; name: string; subcategories?: Array<{ name: string }> }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data.map((cat: any) => ({ id: cat._id, name: cat.name, subcategories: cat.subcategories })));
        } else {
          setCategories([]);
        }
      } catch (err: any) {
        setCategoriesError(err.message || 'Error fetching categories');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Fetch existing data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch existing profile data from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Profile doesn't exist yet, that's okay
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        console.log('Fetched profile data:', data); // Debug log

        if (data.success && data.data) {
          const profile = data.data;
          
          // Prefill portfolio items if they exist
          if (Array.isArray(profile.portfolio)) {
            setPortfolioItems(profile.portfolio);
          } else {
            setPortfolioItems([]);
          }
          // Prefill gallery images, videos, and links if they exist
          if (profile.galleryPortfolio) {
            const galleryData = profile.galleryPortfolio;
            if (galleryData.images && Array.isArray(galleryData.images)) {
              setGalleryImages(galleryData.images.map((img: any) => img.url || img));
            } else {
              setGalleryImages([]);
            }
            if (galleryData.videos && Array.isArray(galleryData.videos)) {
              setGalleryVideos(galleryData.videos.map((vid: any) => vid.url || vid));
            } else {
              setGalleryVideos([]);
            }
            if (galleryData.portfolioLinks && Array.isArray(galleryData.portfolioLinks)) {
              setPortfolioLinks(galleryData.portfolioLinks.map((link: any) => {
                if (typeof link === 'string') return { title: 'Portfolio Link', url: link };
                return { title: link.title || 'Portfolio Link', url: link.url || link };
              }));
            } else {
              setPortfolioLinks([]);
            }
          } else {
            setGalleryImages([]);
            setGalleryVideos([]);
            setPortfolioLinks([]);
          }
        }
      } catch (err) {
        // Optionally handle error
        setPortfolioItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []); // Empty dependency array means this runs once on mount
  
  // Add this helper function after your useState definitions
  const compressImage = async (base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a browser built-in Image to load the base64 string
        const img = new window.Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
        
        img.src = base64Image;
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Helper function to clear unnecessary storage
  const clearOldStorageData = () => {
    try {
      console.log('Attempting to clear storage to make room...');
      
      // Find all keys to clear except critical data
      const keysToPreserve = ['token', 'userRole', 'username', 'userData'];
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToPreserve.some(k => key.includes(k))) {
          keysToRemove.push(key);
        }
      }
      
      // Log what we're clearing
      console.log(`Clearing ${keysToRemove.length} items from localStorage`);
      
      // Remove items
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      
      return true;
    } catch (e) {
      console.error("Error clearing old storage data:", e);
      return false;
    }
  };
  
  // Replace the handleImageUpload function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    console.log(`Processing ${files.length} gallery files`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Limit number of files to process
    const maxFiles = 5;
    const filesToProcess = Array.from(files).slice(0, maxFiles);
    
    if (files.length > maxFiles) {
      toast.error(`Only the first ${maxFiles} files will be processed to save storage space.`);
    }

    try {
      // Process files in parallel
      const uploadPromises = filesToProcess.map(async (file) => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds the 5MB limit.`);
          errorCount++;
          return null;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a supported image type.`);
          errorCount++;
          return null;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || '');
        formData.append('folder', 'creator_gallery');

        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error('Failed to upload to Cloudinary');
          }

          const data = await response.json();
          console.log('Cloudinary upload response:', data);

          if (data.secure_url) {
            successCount++;
            return data.secure_url;
          } else {
            throw new Error('No image URL received from Cloudinary');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          errorCount++;
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter(url => url !== null) as string[];

      if (validUrls.length > 0) {
        setGalleryImages(prev => [...prev, ...validUrls]);
        toast.success(`Successfully uploaded ${validUrls.length} files to your gallery.`);
      }
    } catch (error) {
      console.error('Error in batch upload:', error);
      toast.error('Failed to upload some files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeVideo = (index: number) => {
    setGalleryVideos(prev => prev.filter((_, i) => i !== index));
  };
  
  const addPortfolioLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      // Validate URL
      try {
        new URL(newLink.url);
        setPortfolioLinks([...portfolioLinks, { ...newLink }]);
        setNewLink({ title: '', url: '' });
      } catch (e) {
        setErrors({ ...errors, url: 'Please enter a valid URL' });
        return;
      }
    }
  };
  
  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index));
  };
  
  // Replace the handlePortfolioImageUpload function
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5MB.');
      setIsUploading(false);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', 'creator_portfolio');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }

      const data = await response.json();
      console.log('Cloudinary upload response:', data);

      if (data.secure_url) {
        setNewItem({ ...newItem, image: data.secure_url });
        toast.success('Portfolio image uploaded successfully!');
      } else {
        throw new Error('No image URL received from Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const validatePortfolioItem = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newItem.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newItem.client?.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!newItem.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!newItem.promotionType?.trim()) {
      newErrors.promotionType = 'Promotion type is required';
    }
    
    if (newItem.isVideo) {
      if (!newItem.videoUrl?.trim()) {
        newErrors.videoUrl = 'Video URL is required';
      } else {
        // Basic URL validation
        try {
          new URL(newItem.videoUrl);
        } catch (e) {
          newErrors.videoUrl = 'Please enter a valid URL';
        }
      }
    } else {
      if (!newItem.image) {
        newErrors.image = 'Please upload an image';
      }
    }
    
    console.log('Portfolio validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // In handleAddPortfolioItem, update logic to handle editing
  const handleAddPortfolioItem = () => {
    if (validatePortfolioItem()) {
      if (editingItemId) {
        // Edit mode: update the item in the array
        const updatedItems = portfolioItems.map(item =>
          item.id === editingItemId ? { ...item, ...newItem, id: editingItemId } : item
        );
        setPortfolioItems(updatedItems);
      } else {
        // Add mode: add new item
        const newId = Date.now().toString();
        const updatedItems = [...portfolioItems, { id: newId, ...newItem }];
        setPortfolioItems(updatedItems);
      }
      // Reset form for next entry
      setNewItem({
        title: '',
        image: '',
        category: 'photography',
        client: '',
        description: '',
        isVideo: false,
        videoUrl: '',
        promotionType: '',
      });
      setEditingItemId(null);
      setIsAddingItem(false);
    }
  };
  
  const handleRemovePortfolioItem = (id: string) => {
    const updatedItems = portfolioItems.filter(item => item.id !== id);
    setPortfolioItems(updatedItems);
  };
  
  // Finally, update the handleSubmit function to send data to the backend
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if at least one gallery image, video, or portfolio item is present
      const hasGallery = galleryImages.length > 0 || galleryVideos.length > 0;
      const hasPortfolio = portfolioItems.length > 0;
      const completionStatus = hasGallery || hasPortfolio;
      console.log('GalleryPortfolio completionStatus:', completionStatus);
      if (!hasGallery && !hasPortfolio) {
        toast.error('Please add at least one gallery image, video, or portfolio item');
        setIsSubmitting(false);
        return;
      }

      // Build the payload
      const updateData = {
        images: galleryImages,
        videos: galleryVideos,
        portfolioLinks: portfolioLinks,
        portfolio: portfolioItems
      };

      // Log the payload for debugging
      console.log('Payload to be sent to backend:', updateData);

      // Save to localStorage first as a safety backup
      try {
        localStorage.setItem('galleryData_backup', JSON.stringify(updateData));
        console.log('Backup saved to localStorage');
      } catch (storageError) {
        console.warn('Failed to save backup to localStorage:', storageError);
      }

      // Use the direct API function to save gallery data
      try {
        const response = await saveGalleryPortfolio(updateData);
        console.log('Gallery and portfolio saved successfully:', response);
        toast.success('Gallery and portfolio data saved successfully!');
        // Navigate to publish step
        router.push('/creator-setup/publish');
      } catch (apiError: any) {
        console.error('API call failed:', apiError);
        toast.error('Failed to save gallery data. Please check your content and try again.');
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsSubmitting(false);
    }
  };
  
  // Add debugging function
  const handleCheckUserRole = async () => {
    try {
      setIsCheckingUser(true);
      const info = await checkUserRoleAndId();
      setUserInfo(info);
      
      if (!info.authenticated) {
        toast.error('User authentication issue: ' + info.message);
      } else if (info.userData?.role !== 'creator') {
        toast.error('User does not have creator role. Current role: ' + (info.userData?.role || 'none'));
      } else {
        toast.success('User has creator role: ' + info.userData.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      toast.error('Failed to check user role');
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Add role upgrade function
  const handleUpgradeToCreator = async () => {
    try {
      setIsUpgrading(true);
      await upgradeToCreator();
      toast.success('Successfully upgraded to creator role');
      // Refresh user info
      await handleCheckUserRole();
    } catch (error) {
      console.error('Error upgrading role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade role');
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Add this function to directly test the backend connection
  const testDirectBackendConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Testing direct backend connection...');
      
      // Try a simpler endpoint first to verify connectivity
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/creators/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test: true })
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        toast.success('Backend connection successful!');
        console.log('Test endpoint response:', data);
      } else {
        toast.error(`Backend connection failed: ${testResponse.status}`);
        console.error('Test endpoint failed:', testResponse.status, testResponse.statusText);
      }
    } catch (error) {
      toast.error('Backend connection error');
      console.error('Test connection error:', error);
    }
  };

  // Function to directly create a minimal gallery document
  const createMinimalGallery = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Creating minimal gallery record...');
      
      // Simple minimal data structure
      const minimalData = {
        images: [
          {
            url: 'https://placehold.co/800x600?text=Test+Image',
            title: 'Test Image',
            description: 'Test description',
            tags: ['test'],
            order: 0
          }
        ],
        videos: [],
        portfolioLinks: [
          {
            url: 'https://example.com',
            title: 'Example Link'
          }
        ],
        portfolio: [
          {
            title: 'Test Portfolio Item',
            image: 'https://placehold.co/800x600?text=Test+Portfolio',
            category: 'general',
            client: 'Test Client',
            description: 'Test portfolio description',
            isVideo: false,
            videoUrl: '',
            promotionType: 'Test',
            projectDate: 'January 2023',
            sortOrder: 0
          }
        ]
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/creators/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(minimalData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Minimal gallery saved successfully!');
        console.log('Minimal gallery response:', data);
      } else {
        toast.error(`Failed to create minimal gallery: ${response.status}`);
        console.error('Minimal gallery failed:', response.status, response.statusText);
        
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
    } catch (error) {
      toast.error('Error creating minimal gallery');
      console.error('Minimal gallery error:', error);
    }
  };
  
  // Function to directly test gallery storage
  const testGalleryStorage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }
      
      toast('Testing gallery storage endpoint...');
      
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/creators/test-gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        toast.success('Gallery test storage successful!');
        console.log('Gallery test storage response:', data);
        
        // Show verification data
        if (data.data?.verification) {
          console.log('Verification data:', data.data.verification);
          toast(`Stored ${data.data.verification.imagesCount} images, ${data.data.verification.portfolioCount} portfolio items`);
        }
      } else {
        toast.error(`Gallery test storage failed: ${testResponse.status}`);
        console.error('Gallery test failed:', testResponse.status, testResponse.statusText);
        
        try {
          const errorData = await testResponse.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
    } catch (error) {
      toast.error('Gallery test connection error');
      console.error('Gallery test error:', error);
    }
  };
  
  const renderSocialIconLink = (url: string) => {
    if (!url) return null;
    // YouTube
    if (/youtube\.com|youtu\.be/.test(url)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-red-600 hover:underline">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.12C19.163 3.5 12 3.5 12 3.5s-7.163 0-9.386.566a2.994 2.994 0 0 0-2.112 2.12C0 8.41 0 12 0 12s0 3.59.502 5.814a2.994 2.994 0 0 0 2.112 2.12C4.837 20.5 12 20.5 12 20.5s7.163 0 9.386-.566a2.994 2.994 0 0 0 2.112-2.12C24 15.59 24 12 24 12s0-3.59-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>YouTube</span>
        </a>
      );
    }
    // Instagram
    if (/instagram\.com/.test(url)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-pink-500 hover:underline">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"/></svg>
          <span>Instagram</span>
        </a>
      );
    }
    // Facebook
    if (/facebook\.com/.test(url)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-blue-700 hover:underline">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg>
          <span>Facebook</span>
        </a>
      );
    }
    // Twitter
    if (/twitter\.com/.test(url)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-blue-400 hover:underline">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 0 0 1.88-2.37a8.59 8.59 0 0 1-2.72 1.04a4.28 4.28 0 0 0-7.29 3.9A12.13 12.13 0 0 1 3.11 4.86a4.28 4.28 0 0 0 1.32 5.71a4.23 4.23 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19a4.3 4.3 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2c0-.19-.01-.39-.02-.58A8.72 8.72 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg>
          <span>Twitter</span>
        </a>
      );
    }
    // LinkedIn
    if (/linkedin\.com/.test(url)) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-blue-800 hover:underline">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75s1.75.79 1.75 1.75s-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47c-1.5 0-1.73 1.18-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54c3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
          <span>LinkedIn</span>
        </a>
      );
    }
    // Generic link
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-3 text-gray-700 hover:underline">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 1 7 7l-1.5 1.5a5 5 0 0 1-7-7l1.5-1.5"/><path d="M14 11a5 5 0 0 0-7-7L5.5 5.5a5 5 0 0 0 7 7l1.5-1.5"/></svg>
        <span>Link</span>
      </a>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={6} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Add Your Gallery & Portfolio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Showcase your work with images, videos, and portfolio pieces to attract potential clients.
          </p>
          
          {/* Debug panel toggle */}
          <button 
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center mx-auto"
          >
            <Info className="w-3 h-3 mr-1" />
            {showDebugPanel ? 'Hide Debug Tools' : 'Show Debug Tools'}
          </button>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Troubleshooting Tools</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={handleCheckUserRole}
                disabled={isCheckingUser}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                {isCheckingUser ? 'Checking...' : 'Check User Role'}
              </button>
              
              <button
                onClick={handleUpgradeToCreator}
                disabled={isUpgrading}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                {isUpgrading ? 'Upgrading...' : 'Upgrade to Creator'}
              </button>
              
              <button
                onClick={testDirectBackendConnection}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                Test Backend Connection
              </button>
              
              <button
                onClick={createMinimalGallery}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                Create Minimal Gallery
              </button>
              
              <button
                onClick={testGalleryStorage}
                className="bg-pink-50 text-pink-600 px-3 py-1 rounded border border-pink-200 text-sm hover:bg-pink-100"
              >
                Test Gallery Storage API
              </button>
            </div>
            
            {userInfo && (
              <div className="bg-white p-3 rounded border border-gray-200 text-xs font-mono overflow-auto max-h-32 text-gray-700">
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Gallery Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Images & Videos</h2>
            <p className="text-gray-600 mb-4">
              Add high-quality visuals that showcase your work. Clients will see these on your profile.
            </p>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Images & Videos</label>
              
              <div className="mb-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images & Videos (Max 5MB each)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*" 
                      multiple 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              {isUploading && (
                <div className="flex items-center justify-center my-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                </div>
              )}
              
              {/* Gallery Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {galleryImages.map((image, index) => (
                  <div key={`image-${index}`} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={image} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {galleryVideos.map((video, index) => (
                  <div key={`video-${index}`} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
                    <FileVideo className="w-10 h-10 text-white" />
                    <button
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-purple-600">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
              My Past Work
            </h2>
            <p className="text-gray-600 mb-6 border-l-4 border-purple-200 pl-3 italic">
              Showcase your best work to potential brands. Include client information, project descriptions, and the results you achieved. This helps brands understand your expertise and style.
            </p>
            
            {portfolioItems.length > 0 ? (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {portfolioItems.map(item => (
                    <div key={item.id} className="relative group bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                      <div className="relative h-56">
                        {item.isVideo && item.videoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            {renderSocialIconLink(item.videoUrl)}
                          </div>
                        ) : (
                          <div className="relative w-full h-full overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemovePortfolioItem(item.id)}
                          className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingItem(true);
                            setEditingItemId(item.id);
                            setNewItem({
                              title: item.title || '',
                              image: item.image || '',
                              category: item.category || 'photography',
                              client: item.client || '',
                              description: item.description || '',
                              isVideo: !!item.isVideo,
                              videoUrl: item.videoUrl || '',
                              promotionType: item.promotionType || '',
                            });
                          }}
                          className="absolute top-3 left-3 bg-white/80 p-1.5 rounded-full text-gray-700 shadow hover:bg-purple-100 transition-colors z-10"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6-6M3 17v4h4l11-11a2.828 2.828 0 0 0-4-4L3 17z"/></svg>
                        </button>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                          <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            {categories.find(c => c.id === item.category)?.name || item.category}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Client:</span> {item.client}</p>
                          </div>
                          
                          {item.promotionType && (
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Campaign Type:</span> {item.promotionType}</p>
                            </div>
                          )}
                          
                          {item.projectDate && (
                            <div className="flex items-start">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-700 flex-1"><span className="font-medium">Date:</span> {item.projectDate}</p>
                            </div>
                          )}
                        </div>
                        
                        {item.description && (
                          <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-8">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Work Samples Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md text-center">
                  Showcase your previous work to attract more clients. Add details about past projects, client feedback, and results you achieved.
                </p>
                <Button 
                  onClick={() => setIsAddingItem(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your Past Work
                </Button>
              </div>
            )}
            
            {isAddingItem ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-purple-600" />
                    Add New Work Sample
                  </h3>
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Summer Collection Campaign"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.client}
                      onChange={(e) => setNewItem({ ...newItem, client: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.client ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Fashion Brand Co."
                    />
                    {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {categoriesLoading ? (
                      <div className="text-xs text-gray-500">Loading categories...</div>
                    ) : categoriesError ? (
                      <div className="text-xs text-red-500">{categoriesError}</div>
                    ) : (
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        style={{ maxWidth: '220px', width: '100%' }}
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign/Promotion Type <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newItem.promotionType}
                      onChange={(e) => setNewItem({ ...newItem, promotionType: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.promotionType ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      placeholder="e.g. Instagram Product Campaign, YouTube Review"
                    />
                    {errors.promotionType && <p className="mt-1 text-sm text-red-500">{errors.promotionType}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Description <span className="text-red-500">*</span></label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full p-2.5 border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                      rows={3}
                      placeholder="Describe what you did, your approach, and the results achieved"
                    ></textarea>
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-3">
                      <label className="text-sm font-medium text-gray-700 mr-4">Media Type</label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={!newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: false })}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Image</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            checked={newItem.isVideo}
                            onChange={() => setNewItem({ ...newItem, isVideo: true })}
                            className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Video URL</span>
                        </label>
                      </div>
                    </div>
                    
                    {newItem.isVideo ? (
                      <div>
                        <input
                          type="text"
                          value={newItem.videoUrl}
                          onChange={(e) => setNewItem({ ...newItem, videoUrl: e.target.value })}
                          className={`w-full p-2.5 border ${
                            errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        />
                        {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>}
                      </div>
                    ) : (
                      <div>
                        {newItem.image ? (
                          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={newItem.image}
                              alt="Portfolio preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNewItem({ ...newItem, image: '' })}
                              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <label className="cursor-pointer flex flex-col items-center p-6">
                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                                <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handlePortfolioImageUpload}
                                />
                              </label>
                            </div>
                            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingItem(false)}
                    className="px-5 py-2.5"
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPortfolioItem}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                    type="button"
                  >
                    {editingItemId ? 'Save Changes' : 'Add to Portfolio'}
                  </Button>
                </div>
              </div>
            ) : null}
            {/* Always show Add Another button below portfolio list */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Add Another Work Sample</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/creator-setup/pricing')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 