'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MessagesSquare, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

export const CreatorDescriptionFaq = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    briefDescription: '',
    longDescription: '',
    faqs: [] as { question: string; answer: string }[],
    specialties: [] as string[],
    workProcess: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [briefCharCount, setBriefCharCount] = useState(0);
  const [detailedCharCount, setDetailedCharCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    
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
          
          // Prefill form data if it exists
          if (profile.descriptionFaq) {
            const descriptionFaq = profile.descriptionFaq;
            const newFormData = {
              briefDescription: descriptionFaq.briefDescription || '',
              longDescription: descriptionFaq.longDescription || '',
              faqs: (descriptionFaq.faqs || []).map((faq: any) => ({
                question: faq.question || '',
                answer: faq.answer || ''
              })),
              specialties: descriptionFaq.specialties || [],
              workProcess: descriptionFaq.workProcess || ''
            };
            setFormData(newFormData);
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        // Don't show error toast as this might be a new user
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []); // Empty dependency array means this runs once on mount

  const handleBriefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBriefCharCount(value.length);
    setFormData(prev => ({ ...prev, briefDescription: value }));
  };

  const handleDetailedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDetailedCharCount(value.length);
    setFormData(prev => ({ ...prev, longDescription: value }));
  };

  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaq = [...formData.faqs];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updatedFaq }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.briefDescription || !formData.longDescription || formData.faqs.length === 0) {
      setError("Please provide both brief and long descriptions and at least one FAQ");
      toast.error("All required description & FAQ fields must be filled");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    // Check if required fields are filled
    const allFieldsFilled = !!(formData.briefDescription && formData.longDescription && formData.faqs.length > 0);
    const completionStatus = allFieldsFilled;
    console.log('DescriptionFaq completionStatus:', completionStatus);

    // Prepare update data (do not overwrite other completionStatus fields)
    let prevCompletion = {};
    try {
      const token = localStorage.getItem('token');
      const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prevRes.ok) {
        const prevJson = await prevRes.json();
        prevCompletion = prevJson.data?.completionStatus || {};
      }
    } catch {}

    const updateData = {
      descriptionFaq: {
        briefDescription: formData.briefDescription,
        longDescription: formData.longDescription,
        faqs: formData.faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        })),
        specialties: formData.specialties || [],
        workProcess: formData.workProcess || ''
      },
      completionStatus: {
        ...prevCompletion,
        descriptionFaq: completionStatus
      },
      onboardingStep: 'social-media'
    };

    console.log('Updating with data:', updateData); // Debug log

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Update response:', result); // Debug log

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Show success message
      toast.success('Description & FAQ saved successfully!');
      
      // Redirect to the next step
      router.push('/creator-setup/social-media');
    } catch (error: any) {
      console.error('Error saving description & FAQ:', error);
      setError(error.message || 'Failed to save description & FAQ. Please try again.');
      toast.error(error.message || 'Failed to save description & FAQ. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={3} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Description & FAQ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell potential clients about your services and answer common questions they might have.
            A clear description and well-prepared FAQs can significantly increase your booking rate.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brief Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                Brief Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.briefDescription}
                onChange={handleBriefChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="Provide a short summary of the services you offer (50-150 characters)"
                maxLength={150}
                required
              ></textarea>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min. 50 characters</span>
                <span className={briefCharCount < 50 ? 'text-red-500' : briefCharCount > 120 ? 'text-amber-500' : 'text-green-500'}>
                  {briefCharCount}/150
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MessagesSquare className="w-4 h-4 mr-2" />
                Detailed Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={formData.longDescription}
                onChange={handleDetailedChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[200px]"
                placeholder="Provide a comprehensive description of your services, experience, and what sets you apart from others (200-1200 characters)"
                maxLength={1200}
                required
              ></textarea>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min. 200 characters</span>
                <span className={detailedCharCount < 200 ? 'text-red-500' : detailedCharCount > 1000 ? 'text-amber-500' : 'text-green-500'}>
                  {detailedCharCount}/1200
                </span>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <HelpCircle className="w-4 h-4 mr-2" />
                Frequently Asked Questions
              </label>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Adding FAQs helps potential clients understand your services better and addresses 
                  common concerns before they reach out to you. This can save time and increase bookings.
                </p>
              </div>
              
              {formData.faqs.length > 0 ? (
                <div className="space-y-6">
                  {formData.faqs.map((item, index) => (
                    <div key={index} className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFaq(index)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question {index + 1}
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                          placeholder="e.g., What is your turnaround time?"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                          placeholder="Provide a clear and concise answer"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[100px]"
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">No FAQs added yet. Click the button below to add your first FAQ.</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
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
                  'Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 