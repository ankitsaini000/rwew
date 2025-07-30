'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Image, X, Upload, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

export const CreatorPortfolio = () => {
  const router = useRouter();
  
  const [portfolioItems, setPortfolioItems] = useState<Array<{
    id: string;
    title: string;
    image: string;
    category: string;
    client?: string;
    description?: string;
    isVideo?: boolean;
    videoUrl?: string;
  }>>([]);
  
  const [newItem, setNewItem] = useState({
    title: '',
    image: '',
    category: 'photography',
    client: '',
    description: '',
    isVideo: false,
    videoUrl: '',
  });
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Categories for portfolio items
  const categories = [
    { id: 'photography', name: 'Photography' },
    { id: 'video', name: 'Video' },
    { id: 'design', name: 'Design' },
    { id: 'branding', name: 'Branding' },
    { id: 'social', name: 'Social Media' },
    { id: 'web', name: 'Web Development' }
  ];
  
  useEffect(() => {
    // Load existing data from local storage if available
    const savedData = localStorage.getItem('creatorPortfolio');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPortfolioItems(parsedData);
      } catch (e) {
        console.error('Error parsing saved portfolio data', e);
      }
    }
  }, []);
  
  const validateItem = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newItem.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newItem.image && !newItem.isVideo) {
      newErrors.image = 'Image is required';
    }
    
    if (newItem.isVideo && !newItem.videoUrl) {
      newErrors.videoUrl = 'Video URL is required';
    }
    
    if (!newItem.client?.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!newItem.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddItem = () => {
    if (validateItem()) {
      const newId = Date.now().toString();
      const updatedItems = [...portfolioItems, { id: newId, ...newItem }];
      setPortfolioItems(updatedItems);
      
      // Save to local storage
      localStorage.setItem('creatorPortfolio', JSON.stringify(updatedItems));
      
      // Reset form
      setNewItem({
        title: '',
        image: '',
        category: 'photography',
        client: '',
        description: '',
        isVideo: false,
        videoUrl: '',
      });
      
      setIsAddingItem(false);
    }
  };
  
  const handleRemoveItem = (id: string) => {
    const updatedItems = portfolioItems.filter(item => item.id !== id);
    setPortfolioItems(updatedItems);
    
    // Save to local storage
    localStorage.setItem('creatorPortfolio', JSON.stringify(updatedItems));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate file upload - in a real app, this would be an API call
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, image: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = () => {
    // Save to local storage
    localStorage.setItem('creatorPortfolio', JSON.stringify(portfolioItems));
    
    // Navigate to the next step
    router.push('/creator-setup/review-submit');
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600 rounded-full" style={{ width: '87.5%' }}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Step 7 of 8</span>
          <span>Portfolio</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Showcase Your Work</h1>
        <p className="text-gray-600 mb-6">Add examples of your past work to help brands understand your style and capabilities.</p>
        
        {portfolioItems.length > 0 ? (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioItems.map(item => (
                <div key={item.id} className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-48">
                    {item.isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <div className="text-white">Video Content</div>
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{item.client}</p>
                    <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-8">
            <Image className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-4">No portfolio items added yet</p>
          </div>
        )}
        
        {isAddingItem ? (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Portfolio Item</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="E.g., Social Media Campaign"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <input
                  type="text"
                  value={newItem.client}
                  onChange={(e) => setNewItem({ ...newItem, client: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.client ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="E.g., Nike"
                />
                {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Briefly describe the project, your role, and the results"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <input
                    type="checkbox"
                    checked={newItem.isVideo}
                    onChange={(e) => setNewItem({ ...newItem, isVideo: e.target.checked })}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  This is a video
                </label>
                
                {newItem.isVideo ? (
                  <div>
                    <input
                      type="text"
                      value={newItem.videoUrl}
                      onChange={(e) => setNewItem({ ...newItem, videoUrl: e.target.value })}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.videoUrl ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    />
                    {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>}
                  </div>
                ) : (
                  <div>
                    <div className={`border-2 border-dashed p-4 rounded-md text-center ${errors.image ? 'border-red-500' : 'border-gray-300'}`}>
                      {newItem.image ? (
                        <div className="relative">
                          <img 
                            src={newItem.image} 
                            alt="Preview" 
                            className="max-h-32 mx-auto object-contain"
                          />
                          <button
                            onClick={() => setNewItem({ ...newItem, image: '' })}
                            className="absolute top-0 right-0 bg-black/60 p-1 rounded-full text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="mt-2">
                            {isUploading ? (
                              <div className="flex justify-center">
                                <div className="animate-spin h-5 w-5 border-2 border-purple-600 rounded-full border-t-transparent"></div>
                              </div>
                            ) : (
                              <label className="cursor-pointer text-sm text-purple-600 hover:text-purple-500">
                                Upload image
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                    {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddingItem(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingItem(true)}
            className="w-full justify-center items-center flex space-x-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Item</span>
          </Button>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/creator-setup/gallery')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex items-center space-x-2"
          disabled={portfolioItems.length === 0}
        >
          <span>Next Step</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}; 