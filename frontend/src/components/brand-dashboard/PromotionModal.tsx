"use client";

import { useEffect, useState, useRef } from 'react';
import { X, CheckCircle, Plus, Megaphone, Calendar, DollarSign, HashIcon, Target, Globe, Layers } from 'lucide-react';
import axios from 'axios';
import { getCategories } from '../../services/api';


interface PromotionModalProps {
  showPromotionModal: boolean;
  setShowPromotionModal: (show: boolean) => void;
  promotionStep: number;
  setPromotionStep: (step: number) => void;
  promotionData: {
    title: string;
    description: string;
    budget: string;
    category: string[];
    platform: string;
    deadline: string;
    promotionType: string;
    deliverables: string[];
    tags: string[];
    requirements: string;
  };
  handlePromotionChange: (field: string, value: any) => void;
  newDeliverable: string;
  setNewDeliverable: (value: string) => void;
  newTag: string;
  setNewTag: (value: string) => void;
  addDeliverable: () => void;
  removeDeliverable: (index: number) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
  publishPromotion: () => void;
}

export default function PromotionModal({
  showPromotionModal,
  setShowPromotionModal,
  promotionStep,
  setPromotionStep,
  promotionData,
  handlePromotionChange,
  newDeliverable,
  setNewDeliverable,
  newTag,
  setNewTag,
  addDeliverable,
  removeDeliverable,
  addTag,
  removeTag,
  publishPromotion
}: PromotionModalProps) {
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showPromotionModal) {
      axios.get('http://localhost:5001/api/categories')
        .then(res => {
          setCategories(res.data.data);
        })
        .catch(err => {
          setCategories([]);
          console.error('Failed to fetch categories', err);
        });

      axios.get('http://localhost:5001/api/social-media-preferences')
        .then(res => {
          setPlatforms(res.data.data);
        })
        .catch(err => {
          setPlatforms([]);
          console.error('Failed to fetch platforms', err);
        });
    }
  }, [showPromotionModal]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  if (!showPromotionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
              Post a Promotion
            </h3>
            <button 
              onClick={() => {
                setShowPromotionModal(false);
                setPromotionStep(1);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
              {[1, 2, 3].map((step) => (
                <div 
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative ${
                    step < promotionStep 
                      ? 'bg-green-600 text-white' 
                      : step === promotionStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < promotionStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1 text-sm">
              <span className={promotionStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Promotion Details
              </span>
              <span className={promotionStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Requirements
              </span>
              <span className={promotionStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                Review & Publish
              </span>
            </div>
          </div>
          
          {/* Step 1: Basic Details */}
          {promotionStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Title *</label>
                <input 
                  type="text" 
                  value={promotionData.title}
                  onChange={(e) => handlePromotionChange('title', e.target.value)}
                  placeholder="e.g. Looking for lifestyle influencers for our new product launch" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea 
                  rows={4}
                  value={promotionData.description}
                  onChange={(e) => handlePromotionChange('description', e.target.value)}
                  placeholder="Describe what you're looking for in this promotion. Include details about your product, brand values, and campaign objectives." 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range (INR) *</label>
                  <input 
                    type="text" 
                    value={promotionData.budget}
                    onChange={(e) => handlePromotionChange('budget', e.target.value)}
                    placeholder="e.g. ₹5000-₹10000" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
                      onClick={() => setCategoryDropdownOpen(open => !open)}
                    >
                      {promotionData.category && promotionData.category.length > 0
                        ? promotionData.category.join(', ')
                        : 'Select categories...'}
                      <span className="float-right">▼</span>
                    </button>
                    {categoryDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {categories.map((cat: any) => (
                          <label key={cat._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              value={cat.name}
                              checked={promotionData.category.includes(cat.name)}
                              onChange={e => {
                                const value = e.target.value;
                                if (e.target.checked) {
                                  handlePromotionChange('category', [...promotionData.category, value]);
                                } else {
                                  handlePromotionChange('category', promotionData.category.filter((c: string) => c !== value));
                                }
                              }}
                              className="form-checkbox mr-2"
                            />
                            <span>{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                  <select 
                    value={promotionData.platform}
                    onChange={(e) => handlePromotionChange('platform', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a platform</option>
                    {platforms.map((platform: any) => (
                      <option key={platform._id} value={platform.name}>{platform.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                  <input 
                    type="date" 
                    value={promotionData.deadline}
                    onChange={(e) => handlePromotionChange('deadline', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type *</label>
                <select 
                  value={promotionData.promotionType}
                  onChange={(e) => handlePromotionChange('promotionType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a promotion type</option>
                  <option value="Product Review">Product Review</option>
                  <option value="Brand Awareness">Brand Awareness</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Unboxing">Unboxing</option>
                  <option value="Tutorial/How-to">Tutorial/How-to</option>
                  <option value="Giveaway/Contest">Giveaway/Contest</option>
                  <option value="Sponsored Content">Sponsored Content</option>
                  <option value="Affiliate Marketing">Affiliate Marketing</option>
                  <option value="Brand Ambassador">Brand Ambassador</option>
                  <option value="Event Promotion">Event Promotion</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Step 2: Requirements */}
          {promotionStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Deliverables *</label>
                  <span className="text-xs text-gray-500">What should creators provide?</span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="e.g. 1 Instagram post + 3 stories" 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={addDeliverable}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {promotionData.deliverables.map((deliverable, index) => (
                    <div 
                      key={index} 
                      className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{deliverable}</span>
                      <button 
                        onClick={() => removeDeliverable(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {promotionData.deliverables.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No deliverables added yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <span className="text-xs text-gray-500">Keywords related to your promotion</span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g. sustainable, vegan, eco-friendly" 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={addTag}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {promotionData.tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      <HashIcon className="w-3 h-3" />
                      <span>{tag}</span>
                      <button 
                        onClick={() => removeTag(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {promotionData.tags.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No tags added yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Creator Requirements</label>
                <textarea 
                  rows={4}
                  value={promotionData.requirements}
                  onChange={(e) => handlePromotionChange('requirements', e.target.value)}
                  placeholder="Describe any specific requirements for creators (e.g. follower count, engagement rate, audience demographics, etc.)" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Step 3: Review & Publish */}
          {promotionStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Promotion Preview
                </h4>
                
                <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{promotionData.title || "Untitled Promotion"}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Deadline: {promotionData.deadline ? new Date(promotionData.deadline).toLocaleDateString() : "No deadline set"}</span>
                      <span className="mx-2">•</span>
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Budget: {promotionData.budget || "Not specified"}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Category</span>
                      <span className="text-sm font-medium flex items-center">
                        <Target className="w-4 h-4 mr-1 text-blue-600" />
                        {promotionData.category && promotionData.category.length > 0 ? promotionData.category.join(', ') : "Not specified"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Platform</span>
                      <span className="text-sm font-medium flex items-center">
                        <Globe className="w-4 h-4 mr-1 text-blue-600" />
                        {promotionData.platform || "Not specified"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Promotion Type</span>
                      <span className="text-sm font-medium flex items-center">
                        <Megaphone className="w-4 h-4 mr-1 text-blue-600" />
                        {promotionData.promotionType || "Not specified"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {promotionData.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="mb-5">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h5>
                    {promotionData.deliverables.length > 0 ? (
                      <ul className="space-y-1">
                        {promotionData.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No deliverables specified</p>
                    )}
                  </div>
                  
                  {promotionData.requirements && (
                    <div className="mb-5">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Creator Requirements</h5>
                      <p className="text-sm text-gray-600">
                        {promotionData.requirements}
                      </p>
                    </div>
                  )}
                  
                  {promotionData.tags.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {promotionData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
                          >
                            <HashIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Ready to publish?</h4>
                <p className="text-sm text-blue-600 mb-3">
                  This promotion will be visible to relevant creators who match your requirements.
                  You'll be notified when creators apply for this opportunity.
                </p>
                
                <button
                  onClick={publishPromotion}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <Megaphone className="w-5 h-5 mr-2" />
                  Publish Promotion
                </button>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {promotionStep > 1 && (
              <button
                onClick={() => setPromotionStep(promotionStep - 1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                Previous Step
              </button>
            )}
            
            {promotionStep < 3 && (
              <button
                onClick={() => setPromotionStep(promotionStep + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 