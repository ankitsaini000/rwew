'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Award, GraduationCap, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { saveProfessionalInfo } from '../../services/creatorApi';
import { getCategories, getTargetAudienceGenders, getTargetAudienceAgeRanges, getSocialMediaPreferences, getEventTypes, getEventPricingRanges } from '../../services/api';

export const CreatorProfessionalInfo = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    categories: [] as string[],
    category: "",
    subcategory: "",
    yearsOfExperience: 0,
    expertise: [] as string[],
    tags: [] as string[],
    certifications: [] as { name: string; issuedBy: string; year: string; url: string }[],
    education: [] as { institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number }[],
    experience: [] as { title: string; company: string; location: string; startDate: Date; endDate: Date; description: string; isCurrent: boolean }[],
    eventAvailability: {
      available: false,
      eventTypes: [] as string[],
      pricing: "",
      requirements: "",
      travelWillingness: "",
      preferredLocations: [] as string[],
      leadTime: "",
    },
    contentTypes: [] as string[],
    targetAudienceGender: "",
    socialMediaPreference: "",
    targetAudienceAgeRange: "",
  });
  const [newTag, setNewTag] = useState("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string; subcategories: { name: string }[] }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);
  const subcategoryDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<{ [category: string]: string[] }>({});
  const [targetAudienceGenders, setTargetAudienceGenders] = useState<{ name: string; code: string }[]>([]);
  const [targetAudienceAgeRanges, setTargetAudienceAgeRanges] = useState<{ name: string; code: string }[]>([]);
  const [socialMediaPreferences, setSocialMediaPreferences] = useState<{ name: string; code: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ name: string; code: string }[]>([]);
  const [eventPricingRanges, setEventPricingRanges] = useState<{ name: string; code: string; min?: number; max?: number }[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (subcategoryDropdownRef.current && !subcategoryDropdownRef.current.contains(event.target as Node)) {
        setSubcategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen || subcategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryDropdownOpen, subcategoryDropdownOpen]);

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
          
          // Prefill form data if it exists
          if (profile.professionalInfo) {
            const professionalInfo = profile.professionalInfo;
            const newFormData = {
              title: professionalInfo.title || '',
              categories: professionalInfo.categories || [],
              category: professionalInfo.category || '',
              subcategory: professionalInfo.subcategory || '',
              yearsOfExperience: professionalInfo.yearsOfExperience || 0,
              expertise: professionalInfo.expertise || [],
              tags: professionalInfo.tags || [],
              certifications: (professionalInfo.certifications || []).map((cert: any) => ({
                name: cert.name || '',
                issuedBy: cert.issuedBy || '',
                year: cert.year || '',
                url: cert.url || ''
              })),
              education: professionalInfo.education || [],
              experience: professionalInfo.experience || [],
              eventAvailability: {
                available: Boolean(professionalInfo.eventAvailability?.available),
                eventTypes: professionalInfo.eventAvailability?.eventTypes || [],
                pricing: professionalInfo.eventAvailability?.pricing || '',
                requirements: professionalInfo.eventAvailability?.requirements || '',
                travelWillingness: String(professionalInfo.eventAvailability?.travelWillingness || ''),
                preferredLocations: professionalInfo.eventAvailability?.preferredLocations || [],
                leadTime: String(professionalInfo.eventAvailability?.leadTime || '')
              },
              contentTypes: professionalInfo.contentTypes || [],
              targetAudienceGender: professionalInfo.targetAudienceGender || '',
              socialMediaPreference: professionalInfo.socialMediaPreference || '',
              targetAudienceAgeRange: professionalInfo.targetAudienceAgeRange || '',
            };
            setFormData(newFormData);
            setSelectedContentTypes(newFormData.contentTypes);
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

    // Fetch categories from backend
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        setCategoriesError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();

    // Fetch target audience genders on component mount
    const fetchTargetAudienceGenders = async () => {
      const genders = await getTargetAudienceGenders();
      setTargetAudienceGenders(genders);
    };
    fetchTargetAudienceGenders();

    // Fetch target audience age ranges on component mount
    const fetchTargetAudienceAgeRanges = async () => {
      const ageRanges = await getTargetAudienceAgeRanges();
      setTargetAudienceAgeRanges(ageRanges);
    };
    fetchTargetAudienceAgeRanges();

    // Fetch social media preferences on component mount
    const fetchSocialMediaPreferences = async () => {
      const prefs = await getSocialMediaPreferences();
      setSocialMediaPreferences(prefs);
    };
    fetchSocialMediaPreferences();

    // Fetch event types on component mount
    const fetchEventTypes = async () => {
      const types = await getEventTypes();
      setEventTypes(types);
    };
    fetchEventTypes();

    // Fetch event pricing ranges on component mount
    const fetchEventPricingRanges = async () => {
      const ranges = await getEventPricingRanges();
      setEventPricingRanges(ranges);
    };
    fetchEventPricingRanges();
  }, []); // Empty dependency array means this runs once on mount

  const handleEventTypeChange = (eventType: string) => {
    const currentEventTypes = [...formData.eventAvailability.eventTypes];
    
    if (currentEventTypes.includes(eventType)) {
      setFormData(prev => ({
        ...prev,
        eventAvailability: {
          ...prev.eventAvailability,
          eventTypes: currentEventTypes.filter(type => type !== eventType)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        eventAvailability: {
          ...prev.eventAvailability,
          eventTypes: [...currentEventTypes, eventType]
        }
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.title || formData.categories.length === 0 || selectedContentTypes.length === 0 || formData.tags.length === 0) {
      setError("Please provide your professional title, at least one category, one content type, and one tag");
      toast.error("All required professional info fields must be filled");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    // Check if required fields are filled
    const allFieldsFilled = !!(formData.title && formData.categories.length > 0 && selectedContentTypes.length > 0 && formData.tags.length > 0);
    const completionStatus = allFieldsFilled;
    console.log('Professional Info completionStatus:', completionStatus);

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
      professionalInfo: {
        title: formData.title,
        categories: formData.categories,
        subcategories: formData.categories.flatMap(cat => selectedSubcategories[cat] || []),
        yearsExperience: Number(formData.yearsOfExperience) || 0,
        expertise: formData.expertise || [],
        tags: formData.tags || [],
        certifications: formData.certifications.map(cert => ({
          name: cert.name,
          issuedBy: cert.issuedBy,
          year: Number(cert.year) || new Date().getFullYear(),
          url: cert.url || ''
        })),
        education: formData.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: Number(edu.startYear),
          endYear: Number(edu.endYear)
        })),
        experience: formData.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: new Date(exp.startDate),
          endDate: exp.isCurrent ? new Date() : new Date(exp.endDate),
          description: exp.description,
          isCurrent: Boolean(exp.isCurrent)
        })),
        eventAvailability: {
          available: Boolean(formData.eventAvailability.available),
          eventTypes: formData.eventAvailability.eventTypes || [],
          pricing: formData.eventAvailability.pricing || '',
          requirements: formData.eventAvailability.requirements || '',
          travelWillingness: Boolean(formData.eventAvailability.travelWillingness),
          preferredLocations: formData.eventAvailability.preferredLocations || [],
          leadTime: Number(formData.eventAvailability.leadTime) || 0
        },
        contentTypes: selectedContentTypes,
        targetAudienceGender: formData.targetAudienceGender,
        socialMediaPreference: formData.socialMediaPreference,
        targetAudienceAgeRange: formData.targetAudienceAgeRange,
      },
      completionStatus: {
        ...prevCompletion,
        professionalInfo: completionStatus
      },
      onboardingStep: 'description-faq'
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
      toast.success('Professional information saved successfully!');
      
      // Redirect to the next step
      router.push('/creator-setup/description-faq');
    } catch (error: any) {
      console.error('Error saving professional information:', error);
      setError(error.message || 'Failed to save professional information. Please try again.');
      toast.error(error.message || 'Failed to save professional information. Please try again.');
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
      <OnboardingProgressBar currentStep={2} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Professional Information</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is your time to shine. Let potential clients know what you do best and how you gained your skills,
            certifications, and experience.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Professional Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <BriefcaseBusiness className="w-4 h-4 mr-2" />
                Professional Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="e.g. Social Media Content Creator, Fashion Influencer"
              />
            </div>

            {/* Category and Subcategory */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-left flex flex-wrap gap-2 items-center focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    onClick={() => setCategoryDropdownOpen((open) => !open)}
                    disabled={categoriesLoading || categoriesError !== null}
                  >
                    {formData.categories.length === 0 ? (
                      <span className="text-gray-400">Select categories...</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map((cat) => (
                          <span key={cat} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    <svg className={`ml-auto w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {categoryDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto p-2">
                      {categoriesLoading ? (
                        <div className="p-2 text-gray-500">Loading...</div>
                      ) : categoriesError ? (
                        <div className="p-2 text-red-500">{categoriesError}</div>
                      ) : categories.length === 0 ? (
                        <div className="p-2 text-gray-400">No categories found</div>
                      ) : (
                        categories.map((cat) => (
                          <label key={cat.name} className="flex items-center gap-2 py-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(cat.name)}
                              onChange={e => {
                                setFormData(prev => {
                                  let updated = [...prev.categories];
                                  if (e.target.checked) {
                                    updated.push(cat.name);
                                  } else {
                                    updated = updated.filter(c => c !== cat.name);
                                  }
                                  return {
                                    ...prev,
                                    categories: updated,
                                    category: e.target.checked ? cat.name : (updated[updated.length-1] || ""),
                                    subcategory: ""
                                  };
                                });
                                setSelectedSubcategories(prev => {
                                  const updated = { ...prev };
                                  if (!e.target.checked) delete updated[cat.name];
                                  return updated;
                                });
                              }}
                            />
                            {cat.name}
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <div className="relative" ref={subcategoryDropdownRef}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 border rounded-lg bg-white text-left flex flex-wrap gap-2 items-center focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                    onClick={() => setSubcategoryDropdownOpen((open) => !open)}
                    disabled={formData.categories.length === 0 || categoriesLoading || categoriesError !== null}
                  >
                    {formData.categories.length === 0 ? (
                      <span className="text-gray-400">Select categories first</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.flatMap((cat) =>
                          (selectedSubcategories[cat] || []).map((sub) => (
                            <span key={cat + '-' + sub} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              {sub}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                    <svg className={`ml-auto w-4 h-4 transition-transform ${subcategoryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {subcategoryDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto p-2">
                      {categoriesLoading ? (
                        <div className="p-2 text-gray-500">Loading...</div>
                      ) : categoriesError ? (
                        <div className="p-2 text-red-500">{categoriesError}</div>
                      ) : formData.categories.length === 0 ? (
                        <div className="p-2 text-gray-400">Select categories first</div>
                      ) : (
                        formData.categories.map((cat) => {
                          const catObj = categories.find(c => c.name === cat);
                          if (!catObj) return null;
                          return (
                            <div key={cat} className="mb-2">
                              <div className="font-medium text-sm mb-1">{cat}</div>
                              {catObj.subcategories.length === 0 ? (
                                <div className="text-gray-400 text-xs ml-2">No subcategories</div>
                              ) : (
                                catObj.subcategories.map((sub) => (
                                  <label key={sub.name} className="flex items-center gap-2 text-sm cursor-pointer ml-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategories[cat]?.includes(sub.name) || false}
                                      onChange={e => {
                                        setSelectedSubcategories(prev => {
                                          const updated = { ...prev };
                                          let subs = updated[cat] || [];
                                          if (e.target.checked) {
                                            subs = [...subs, sub.name];
                                          } else {
                                            subs = subs.filter(s => s !== sub.name);
                                          }
                                          updated[cat] = subs;
                                          return updated;
                                        });
                                      }}
                                    />
                                    {sub.name}
                                  </label>
                                ))
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Target Audience Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Target Audience Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.targetAudienceGender}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudienceGender: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              >
                <option value="">Select Gender</option>
                {targetAudienceGenders.map((g) => (
                  <option key={g.code} value={g.code}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Target Audience Age Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Target Audience Age Range <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.targetAudienceAgeRange}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudienceAgeRange: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              >
                <option value="">Select Age Range</option>
                {targetAudienceAgeRanges.map((a) => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Social Media Preference */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Social Media Preference <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.socialMediaPreference}
                onChange={(e) => setFormData(prev => ({ ...prev, socialMediaPreference: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              >
                <option value="">Select Social Media</option>
                {socialMediaPreferences.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content Type <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {['Reels', 'Posts', 'Shorts', 'Stories', 'Live', 'Blog', 'Podcast', 'Video', 'Photo', 'Article', 'Other'].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedContentTypes.includes(type)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedContentTypes(prev => [...prev, type]);
                        } else {
                          setSelectedContentTypes(prev => prev.filter(t => t !== type));
                        }
                      }}
                      className="accent-blue-600"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags <span className="text-gray-400 ml-1">(up to 5, help buyers find you)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="e.g. fashion, travel, fitness"
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => {
                    const tag = newTag.trim();
                    if (!tag) {
                      toast.error('Tag cannot be empty');
                      return;
                    }
                    if (formData.tags.includes(tag)) {
                      toast.error('Tag already added');
                      return;
                    }
                    if (formData.tags.length >= 5) {
                      toast.error('Maximum 5 tags allowed');
                      return;
                    }
                    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                    setNewTag("");
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={formData.tags.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))}
                      className="text-gray-500 hover:text-gray-700 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {formData.tags.length === 0 && (
                  <span className="text-sm text-gray-400 italic">No tags added yet</span>
                )}
              </div>
            </div>

            {/* Event Availability Section - Add this before the submit button */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Event Availability
              </h3>
              <p className="text-sm text-gray-600 mb-4 bg-purple-50 p-3 rounded-lg">
                Let brands know if you're available for in-person events, virtual appearances, or other collaborations.
                This information will help brands plan their campaigns and contact you for appropriate opportunities.
              </p>

              <div className="flex items-center mb-4">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={formData.eventAvailability.available}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          available: e.target.checked
                        }
                      }))}
                    />
                    <div className={`block w-14 h-8 rounded-full ${formData.eventAvailability.available ? 'bg-purple-600' : 'bg-gray-300'} transition-colors`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.eventAvailability.available ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">I'm available for events and appearances</span>
                </label>
              </div>

              {formData.eventAvailability.available && (
                <div className="pl-4 border-l-2 border-purple-200 space-y-5 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Types You're Available For
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {eventTypes.length === 0 ? (
                        <span className="text-gray-400">Loading event types...</span>
                      ) : (
                        eventTypes.map((type) => (
                          <label key={type.code} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.eventAvailability.eventTypes.includes(type.code)}
                              onChange={() => handleEventTypeChange(type.code)}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span>{type.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing for Events (Approximate Range)
                    </label>
                    <select
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      value={formData.eventAvailability.pricing}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          pricing: e.target.value
                        }
                      }))}
                    >
                      <option value="">Select a pricing range...</option>
                      {eventPricingRanges.map(range => (
                        <option key={range.code} value={range.code}>{range.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">This helps brands understand your rates before contacting you.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements
                    </label>
                    <textarea
                      value={formData.eventAvailability.requirements}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          requirements: e.target.value
                        }
                      }))}
                      rows={3}
                      placeholder="e.g. Hair & makeup, photography, specific technical equipment"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Willing to Travel
                      </label>
                      <select
                        value={formData.eventAvailability.travelWillingness}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eventAvailability: {
                            ...prev.eventAvailability,
                            travelWillingness: e.target.value
                          }
                        }))}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        <option value="">Select option</option>
                        <option value="local">Local only (within city)</option>
                        <option value="state">Within state</option>
                        <option value="national">Nationwide</option>
                        <option value="international">International</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Locations
                      </label>
                      <input
                        type="text"
                        value={formData.eventAvailability.preferredLocations.join(', ')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          eventAvailability: {
                            ...prev.eventAvailability,
                            preferredLocations: e.target.value.split(',').map(loc => loc.trim())
                          }
                        }))}
                        placeholder="e.g. Mumbai, Delhi, Bangalore"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Lead Time for Booking
                    </label>
                    <select
                      value={formData.eventAvailability.leadTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        eventAvailability: {
                          ...prev.eventAvailability,
                          leadTime: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="">Select option</option>
                      <option value="1-week">At least 1 week</option>
                      <option value="2-weeks">At least 2 weeks</option>
                      <option value="1-month">At least 1 month</option>
                      <option value="2-months">At least 2 months</option>
                      <option value="custom">Custom (specify in requirements)</option>
                    </select>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      Brands may contact you directly to discuss event opportunities. Make sure your contact information is up to date in your personal information section.
                    </p>
                  </div>
                </div>
              )}
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
                onClick={() => router.push('/creator-setup/personal-info')}
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
