import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Target, MessageSquare, Plus, UploadCloud, Send, Zap, Info, UserCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast

interface RequestCustomQuoteModalProps {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
}

const promotionTypes = ['Social Media Post', 'Video Integration', 'Event Appearance', 'Product Review', 'Sponsored Content', 'Giveaway', 'Other'];
const campaignObjectives = ['Brand Awareness', 'Lead Generation', 'Sales', 'Website Traffic', 'Engagement', 'App Downloads', 'Other'];
const platformPreferences = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn', 'Blog', 'Twitch', 'Other'];
const contentFormats = ['Video', 'Image', 'Carousel', 'Story', 'Reel', 'Short', 'Live Stream', 'Blog Post', 'Podcast', 'Other'];
const currencies = ['₹', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
const eventTypes = ['Corporate Event', 'Product Launch', 'Conference', 'Workshop', 'Networking Event', 'Private Party', 'Other'];

export default function RequestCustomQuoteModal({
  creatorId,
  creatorName,
  onClose,
}: RequestCustomQuoteModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    promotionType: '',
    campaignObjective: '',
    platformPreference: [] as string[],
    contentFormat: [] as string[],
    contentGuidelines: '',
    attachments: [] as string[], // Storing URLs
    audienceTargeting: {
      demographics: '',
      interests: '',
      geography: '',
    },
    timeline: {
      startDate: '',
      endDate: '',
      deliveryDeadlines: '',
    },
    budget: {
      min: '',
      max: '',
      currency: '₹',
      compensationDetails: '',
    },
    additionalNotes: '',
    isPrivateEvent: false,
    eventDetails: {
      eventName: '',
      eventType: '',
      eventDate: '',
      eventLocation: '',
      expectedAttendance: '',
      eventDescription: '',
      specialRequirements: '',
    },
  });

  // New: Avatar URL (fallback to initials if not available)
  const creatorInitial = creatorName?.charAt(0).toUpperCase() || 'C';

  // New: Progress bar state (simple, since it's a single form)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Calculate progress based on filled required fields
    let filled = 0;
    let total = 5; // Promotion, Objective, Guidelines, Timeline, Budget
    if (formData.promotionType) filled++;
    if (formData.campaignObjective) filled++;
    if (formData.contentGuidelines) filled++;
    if (formData.timeline.startDate && formData.timeline.endDate) filled++;
    if (formData.budget.min && formData.budget.max) filled++;
    setProgress(Math.round((filled / total) * 100));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => {
      const currentArray = (prev as any)[name] || [];
      if (checked) {
        return {
          ...prev,
          [name]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter((item: string) => item !== value),
        };
      }
    });
  };

  const handleAttachmentAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const url = input.value.trim();
      if (url && !formData.attachments.includes(url)) {
        setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, url] }));
        input.value = '';
      }
    }
  };

  const handleAttachmentRemove = (urlToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((url) => url !== urlToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!isAuthenticated || !user) {
      toast.error('You must be logged in as a brand to request a quote.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Validate private event data if isPrivateEvent is true
      if (formData.isPrivateEvent) {
        if (!formData.eventDetails.eventName || !formData.eventDetails.eventType || 
            !formData.eventDetails.eventDate || !formData.eventDetails.eventLocation || 
            !formData.eventDetails.expectedAttendance || !formData.eventDetails.eventDescription) {
          toast.error('Please fill in all required private event details.');
          setLoading(false);
          return;
        }
      }

      const requestBody = {
        creatorId,
        promotionType: formData.promotionType,
        campaignObjective: formData.campaignObjective,
        platformPreference: formData.platformPreference,
        contentFormat: formData.contentFormat,
        contentGuidelines: formData.contentGuidelines,
        attachments: formData.attachments,
        audienceTargeting: formData.audienceTargeting,
        timeline: {
          startDate: new Date(formData.timeline.startDate),
          endDate: new Date(formData.timeline.endDate),
          deliveryDeadlines: formData.timeline.deliveryDeadlines,
        },
        budget: {
          min: parseFloat(formData.budget.min as string),
          max: parseFloat(formData.budget.max as string),
          currency: formData.budget.currency,
          compensationDetails: formData.budget.compensationDetails,
        },
        additionalNotes: formData.additionalNotes,
        isPrivateEvent: formData.isPrivateEvent,
        eventDetails: formData.isPrivateEvent ? {
          eventName: formData.eventDetails.eventName,
          eventType: formData.eventDetails.eventType,
          eventDate: formData.eventDetails.eventDate,
          eventLocation: formData.eventDetails.eventLocation,
          expectedAttendance: parseInt(formData.eventDetails.expectedAttendance),
          eventDescription: formData.eventDetails.eventDescription,
          specialRequirements: formData.eventDetails.specialRequirements || '',
        } : undefined,
      };

      console.log('Sending request with data:', requestBody); // Debug log

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/custom-quotes`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response from server:', response.data); // Debug log

      setSuccess('Custom quote request sent successfully!');
      toast.success('Custom quote request sent successfully!');
      onClose();
    } catch (err: any) {
      console.error('Error sending custom quote request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send custom quote request.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warn('You must be logged in as a brand to request a custom quote.');
    }
  }, [isAuthenticated]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-purple-700/80 to-pink-500/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[98vh] overflow-y-auto border border-purple-100 relative animate-fadeIn">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-3xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 pb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 rounded-t-3xl relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-purple-600 text-3xl font-bold border-4 border-purple-200">
              <UserCircle className="w-10 h-10 text-purple-400" />
              <span className="absolute text-lg font-bold text-purple-700 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">{creatorInitial}</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 drop-shadow-lg">
                <Zap className="w-7 h-7 text-yellow-300 animate-bounce" /> Request Custom Quote
              </h2>
              <p className="text-purple-100 text-sm mt-1 font-medium drop-shadow">for <span className="font-bold text-white">{creatorName}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-purple-200 p-2 rounded-full hover:bg-purple-700/30 transition-colors absolute top-4 right-4">
            <X className="w-7 h-7" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          {/* 1. Campaign Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">1</span>
              <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Campaign Details <span title='What is the main goal and type of this campaign?'><Info className="w-4 h-4 text-purple-400" /></span></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <select
                  id="promotionType"
                  name="promotionType"
                  value={formData.promotionType}
                  onChange={handleInputChange}
                  required
                  className="peer block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-gray-50 transition-all"
                >
                  <option value="" disabled>Select Promotion Type</option>
                  {promotionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <label htmlFor="promotionType" className="absolute left-4 -top-3.5 bg-white px-1 text-xs text-purple-600 font-semibold transition-all peer-focus:-top-3.5 peer-focus:text-purple-700 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 pointer-events-none">Promotion Type *</label>
              </div>
              <div className="relative">
                <select
                  id="campaignObjective"
                  name="campaignObjective"
                  value={formData.campaignObjective}
                  onChange={handleInputChange}
                  required
                  className="peer block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-gray-50 transition-all"
                >
                  <option value="" disabled>Select Objective</option>
                  {campaignObjectives.map((obj) => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
                <label htmlFor="campaignObjective" className="absolute left-4 -top-3.5 bg-white px-1 text-xs text-purple-600 font-semibold transition-all peer-focus:-top-3.5 peer-focus:text-purple-700 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 pointer-events-none">Campaign Objective *</label>
              </div>
            </div>
          </div>
          {/* 2. Platform & Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">2</span>
              <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Platform & Content <span title='Where and how should the content be delivered?'><Info className="w-4 h-4 text-purple-400" /></span></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Platform Preference</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  {platformPreferences.map((platform) => (
                    <label key={platform} className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer text-sm font-medium border transition-all ${formData.platformPreference.includes(platform) ? 'bg-purple-100 border-purple-400 text-purple-700 shadow' : 'bg-white border-gray-200 text-gray-600 hover:bg-purple-50'}`}>
                      <input
                        type="checkbox"
                        name="platformPreference"
                        value={platform}
                        checked={formData.platformPreference.includes(platform)}
                        onChange={handleCheckboxChange}
                        className="accent-purple-600 w-4 h-4 rounded-full border-gray-300 focus:ring-purple-500"
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Content Format</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  {contentFormats.map((format) => (
                    <label key={format} className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer text-sm font-medium border transition-all ${formData.contentFormat.includes(format) ? 'bg-pink-100 border-pink-400 text-pink-700 shadow' : 'bg-white border-gray-200 text-gray-600 hover:bg-pink-50'}`}>
                      <input
                        type="checkbox"
                        name="contentFormat"
                        value={format}
                        checked={formData.contentFormat.includes(format)}
                        onChange={handleCheckboxChange}
                        className="accent-pink-500 w-4 h-4 rounded-full border-gray-300 focus:ring-pink-500"
                      />
                      {format}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 3. Content Guidelines & Attachments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">3</span>
              <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Content Guidelines <span title='Describe your expectations, tone, and requirements.'><Info className="w-4 h-4 text-purple-400" /></span></span>
            </div>
            <textarea
              id="contentGuidelines"
              name="contentGuidelines"
              rows={4}
              value={formData.contentGuidelines}
              onChange={handleInputChange}
              required
              placeholder="Describe your content expectations, tone, key messages, any specific requirements or restrictions."
              className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-gray-50 transition-all"
            ></textarea>
            {/* Attachments */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">Attachments <span title='Add reference URLs (e.g., Google Drive, Dropbox, examples)'><Info className="w-4 h-4 text-purple-400" /></span></label>
              <div className="flex items-center space-x-3">
                <input
                  type="url"
                  id="attachmentInput"
                  placeholder="Add URL (e.g., Google Drive, Dropbox link, example content)"
                  onKeyDown={handleAttachmentAdd}
                  className="flex-1 border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('attachmentInput') as HTMLInputElement;
                    const url = input.value.trim();
                    if (url && !formData.attachments.includes(url)) {
                      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, url] }));
                      input.value = '';
                    }
                  }}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors shadow-md"
                  title="Add attachment URL"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.attachments.map((url, index) => (
                  <span key={index} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                    {url.length > 40 ? `${url.substring(0, 37)}...` : url}
                    <button type="button" onClick={() => handleAttachmentRemove(url)} className="ml-2 -mr-1 text-purple-500 hover:text-purple-700 p-0.5 rounded-full hover:bg-purple-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">Provide URLs to relevant files like brand guidelines, mood boards, or previous campaign examples.</p>
            </div>
          </div>
          {/* 4. Audience & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">4</span>
                <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Audience Targeting <span title='Who is your target audience?'><Info className="w-4 h-4 text-purple-400" /></span></span>
              </div>
              <input
                type="text"
                id="demographics"
                name="audienceTargeting.demographics"
                value={formData.audienceTargeting.demographics}
                onChange={handleInputChange}
                placeholder="e.g., 18-35, Female, Urban, High-income"
                className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-base bg-white mb-3"
              />
              <input
                type="text"
                id="interests"
                name="audienceTargeting.interests"
                value={formData.audienceTargeting.interests}
                onChange={handleInputChange}
                placeholder="e.g., Fashion, Gaming, Travel, Technology, Cooking"
                className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-base bg-white mb-3"
              />
              <input
                type="text"
                id="geography"
                name="audienceTargeting.geography"
                value={formData.audienceTargeting.geography}
                onChange={handleInputChange}
                placeholder="e.g., USA, UK, Los Angeles, Europe"
                className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-base bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">5</span>
                <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Timeline & Delivery <span title='When do you want the campaign to run?'><Info className="w-4 h-4 text-purple-400" /></span></span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  id="startDate"
                  name="timeline.startDate"
                  value={formData.timeline.startDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-base bg-white"
                />
                <input
                  type="date"
                  id="endDate"
                  name="timeline.endDate"
                  value={formData.timeline.endDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-base bg-white"
                />
              </div>
              <textarea
                id="deliveryDeadlines"
                name="timeline.deliveryDeadlines"
                rows={2}
                value={formData.timeline.deliveryDeadlines}
                onChange={handleInputChange}
                placeholder="e.g., Draft by MM/DD, Final content by MM/DD, First post on X date."
                className="mt-3 block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-base bg-white"
              ></textarea>
            </div>
          </div>
          {/* 6. Budget & Compensation */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">6</span>
              <span className="font-semibold text-lg text-purple-700 flex items-center gap-1">Budget & Compensation <span title='What is your budget and compensation structure?'><Info className="w-4 h-4 text-purple-400" /></span></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="number"
                  id="budgetMin"
                  name="budget.min"
                  value={formData.budget.min}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Min Budget"
                  className="peer block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-base bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none">$</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="budgetMax"
                  name="budget.max"
                  value={formData.budget.max}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Max Budget"
                  className="peer block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-base bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none">$</span>
              </div>
              <div>
                <select
                  id="currency"
                  name="budget.currency"
                  value={formData.budget.currency}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-base bg-white"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              id="compensationDetails"
              name="budget.compensationDetails"
              rows={2}
              value={formData.budget.compensationDetails}
              onChange={handleInputChange}
              placeholder="Describe how compensation will be structured (e.g., flat fee, per post, commission-based, product in exchange)."
              className="mt-3 block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-base bg-white"
            ></textarea>
          </div>
          {/* 7. Private Event (collapsible) */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-purple-700">Private Event</span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivateEvent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivateEvent: e.target.checked }))}
                  className="accent-purple-600 w-5 h-5 rounded-full border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">This is a private event</span>
              </label>
            </div>
            {formData.isPrivateEvent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <input
                  type="text"
                  id="eventName"
                  name="eventDetails.eventName"
                  value={formData.eventDetails.eventName}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  placeholder="Event Name *"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                />
                <select
                  id="eventType"
                  name="eventDetails.eventType"
                  value={formData.eventDetails.eventType}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                >
                  <option value="">Select Event Type *</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDetails.eventDate"
                  value={formData.eventDetails.eventDate}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                />
                <input
                  type="text"
                  id="eventLocation"
                  name="eventDetails.eventLocation"
                  value={formData.eventDetails.eventLocation}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  placeholder="Event Location *"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                />
                <input
                  type="number"
                  id="expectedAttendance"
                  name="eventDetails.expectedAttendance"
                  value={formData.eventDetails.expectedAttendance}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  min="1"
                  placeholder="Expected Attendance *"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                />
                <textarea
                  id="eventDescription"
                  name="eventDetails.eventDescription"
                  rows={2}
                  value={formData.eventDetails.eventDescription}
                  onChange={handleInputChange}
                  required={formData.isPrivateEvent}
                  placeholder="Event Description *"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                ></textarea>
                <textarea
                  id="specialRequirements"
                  name="eventDetails.specialRequirements"
                  rows={2}
                  value={formData.eventDetails.specialRequirements}
                  onChange={handleInputChange}
                  placeholder="Special Requirements (optional)"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-white"
                ></textarea>
              </div>
            )}
          </div>
          {/* 8. Additional Notes */}
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">Additional Notes <span title='Any other details or requests?'><Info className="w-4 h-4 text-purple-400" /></span></label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={3}
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Add any other relevant details, specific questions for the creator, or special requests."
              className="block w-full border border-gray-300 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 text-base bg-gray-50"
            ></textarea>
          </div>
          {/* Error/Success */}
          {error && <p className="text-red-500 text-sm text-center font-medium mt-4">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center font-medium mt-4">{success}</p>}
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-purple-100 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors font-semibold shadow-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-all font-bold shadow-lg flex items-center justify-center gap-2 text-lg active:scale-95 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Send className="w-6 h-6 animate-pulse" />
              )}
              {loading ? 'Sending Request...' : 'Send Custom Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 