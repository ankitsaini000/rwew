"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone,
  MapPin,
  Building,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  Shield
} from 'lucide-react';
import { submitBrandVerification, getBrandVerificationStatus, getBrandVerification } from '@/services/api';

interface BrandVerificationFormProps {
  onSuccess?: () => void;
}

interface SocialMedia {
  platform: string;
  url: string;
}

interface Document {
  name: string;
  url: string;
  type: string;
}

interface VerificationStatusType {
  business: 'pending' | 'verified' | 'rejected';
  contact: 'pending' | 'verified' | 'rejected';
  documents: 'pending' | 'verified' | 'rejected';
  registration: 'pending' | 'verified' | 'rejected';
  overall: 'pending' | 'verified' | 'rejected';
}

interface BrandVerificationFormData {
  businessName: string;
  businessWebsite: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  documents: Document[];
  socialMediaProfiles: SocialMedia[];
  verificationStatus?: VerificationStatusType;
}

export default function BrandVerificationForm({ onSuccess }: BrandVerificationFormProps) {
  const [formData, setFormData] = useState<BrandVerificationFormData>({
    businessName: '',
    businessWebsite: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    documents: [],
    socialMediaProfiles: [],
    verificationStatus: {
      business: 'pending',
      contact: 'pending',
      documents: 'pending',
      registration: 'pending',
      overall: 'pending'
    }
  });

  const [loading, setLoading] = useState(false);
  const [verificationExists, setVerificationExists] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSocialMedia, setNewSocialMedia] = useState<SocialMedia>({ platform: '', url: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await getBrandVerificationStatus();
        // Assuming response structure: { success: boolean, data?: any, error?: any }
        if (response.success && 'data' in response) {
          const statusData = response.data;
          if (statusData && statusData.verificationStatus) {
            setVerificationExists(true);
            
            // Fetch full verification details if it exists
            const verificationResponse = await getBrandVerification();
            if (verificationResponse.success && 'data' in verificationResponse) {
              const verificationData = verificationResponse.data;
              if (verificationData) {
                setFormData({
                  businessName: verificationData.businessName || '',
                  businessWebsite: verificationData.businessWebsite || '',
                  businessEmail: verificationData.businessEmail || '',
                  businessPhone: verificationData.businessPhone || '',
                  businessAddress: verificationData.businessAddress || '',
                  businessType: verificationData.businessType || '',
                  registrationNumber: verificationData.registrationNumber || '',
                  taxId: verificationData.taxId || '',
                  documents: verificationData.documents || [],
                  socialMediaProfiles: verificationData.socialMediaProfiles || [],
                  verificationStatus: verificationData.verificationStatus || {
                    business: 'pending',
                    contact: 'pending',
                    documents: 'pending',
                    registration: 'pending',
                    overall: (verificationData.status as 'pending' | 'verified' | 'rejected') || 'pending'
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };
    
    checkVerificationStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSocialMediaChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedProfiles = [...formData.socialMediaProfiles];
    updatedProfiles[index] = {
      ...updatedProfiles[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      socialMediaProfiles: updatedProfiles
    });
  };

  const handleAddSocialMedia = () => {
    if (!newSocialMedia.platform || !newSocialMedia.url) {
      toast.error('Please provide both platform name and URL');
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      socialMediaProfiles: [...prevData.socialMediaProfiles, { ...newSocialMedia }]
    }));
    setNewSocialMedia({ platform: '', url: '' });
  };

  const removeSocialMedia = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      socialMediaProfiles: prevData.socialMediaProfiles.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Mock file upload - in a real app, you would upload to a server/cloud storage
      // and get back a URL
      const newDocuments = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file) // This is temporary and for demo purposes only
      }));

      setFormData(prevData => ({
        ...prevData,
        documents: [...prevData.documents, ...newDocuments]
      }));
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleAddDocument = (type: string) => {
    // In a real app, this would trigger a file upload dialog
    // For this example, we'll simulate adding a document
    const newDocument = {
      name: `${type} Document ${formData.documents.length + 1}`,
      url: `https://example.com/documents/${Date.now()}`,
      type
    };
    
    setFormData({
      ...formData,
      documents: [...formData.documents, newDocument]
    });
  };

  const handleRemoveDocument = (index: number) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  const mapDocumentsToBackendFormat = (documents: Document[]) => {
    // Create an object with expected document fields
    const documentMap: {
      businessRegistration: string[],
      taxDocument: string[],
      identityProof: string[],
      additionalDocuments: string[]
    } = {
      businessRegistration: [],
      taxDocument: [],
      identityProof: [],
      additionalDocuments: []
    };
    
    // Categorize documents by type
    documents.forEach(doc => {
      if (doc.type === 'Business Registration') {
        documentMap.businessRegistration.push(doc.url);
      } else if (doc.type === 'Tax Document') {
        documentMap.taxDocument.push(doc.url);
      } else if (doc.type === 'Identity Proof') {
        documentMap.identityProof.push(doc.url);
      } else {
        documentMap.additionalDocuments.push(doc.url);
      }
    });
    
    return documentMap;
  };

  const mapSocialMediaToBackendFormat = (profiles: SocialMedia[]) => {
    // Create an object that matches the model format expected by backend
    const socialMediaProfiles: Record<string, string> = {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      youtube: ''
    };
    
    // Populate the profiles
    profiles.forEach(profile => {
      const platformKey = profile.platform.toLowerCase();
      if (platformKey in socialMediaProfiles) {
        socialMediaProfiles[platformKey] = profile.url;
      }
    });
    
    return socialMediaProfiles;
  };

  const formatAddressForBackend = (address: string) => {
    // Parse the address components - this is a simplified example
    const addressParts = address.split(',').map(part => part.trim());
    
    return {
      street: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2] || '',
      postalCode: addressParts[3] || '',
      country: addressParts[4] || ''
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting brand verification submission process');
    
    // Validation
    if (!formData.businessName || !formData.businessEmail) {
      toast.error('Business name and email are required');
      console.log('Validation failed: business name or email missing');
      return;
    }
    
    if (!formData.businessWebsite || !formData.businessPhone) {
      toast.error('Business website and phone are required');
      console.log('Validation failed: business website or phone missing');
      return;
    }
    
    if (formData.documents.length === 0) {
      toast.error('At least one document is required for verification');
      console.log('Validation failed: no documents provided');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('=====================================================');
      console.log('VERIFICATION PROCESS STARTED');

      // Format data to match backend model directly
      const formattedDocuments = mapDocumentsToBackendFormat(formData.documents);
      console.log('Formatted documents:', formattedDocuments);
      
      const formattedSocialMedia = mapSocialMediaToBackendFormat(formData.socialMediaProfiles);
      console.log('Formatted social media:', formattedSocialMedia);
      
      const formattedAddress = formatAddressForBackend(formData.businessAddress);
      console.log('Formatted address:', formattedAddress);
      
      // Use a direct structure that matches the MongoDB schema in backend
      const verificationData = {
        businessName: formData.businessName,
        businessWebsite: formData.businessWebsite,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        businessAddress: formattedAddress,
        businessType: formData.businessType,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        documents: formattedDocuments,
        socialMediaProfiles: formattedSocialMedia
      };
      
      console.log("SENDING VERIFICATION DATA:", JSON.stringify(verificationData, null, 2));
      
      // Submit the verification request to backend
      const response = await submitBrandVerification(verificationData);
      console.log("BACKEND RESPONSE:", response);
      
      if (response && response.success) {
        // Update local status to pending
        setFormData(prev => ({
          ...prev,
          verificationStatus: {
            business: 'pending',
            contact: 'pending',
            documents: 'pending',
            registration: 'pending',
            overall: 'pending'
          }
        }));
        
        toast.success('Verification submitted successfully. Your verification data has been stored in MongoDB.');
        console.log('=====================================================');
        console.log('✅ SUCCESS: Brand verification stored in MongoDB successfully!');
        console.log('Verification ID:', response.data?.verificationRequest?._id || 'ID not returned');
        console.log('Status:', response.data?.verificationRequest?.verificationStatus || 'Status not returned');
        console.log('=====================================================');
        
        setVerificationExists(true);
        if (onSuccess) onSuccess();
      } else {
        const errorMessage = response && 'error' in response ? response.error : 'Failed to submit verification';
        toast.error(errorMessage);
        console.log('=====================================================');
        console.error('❌ FAILURE: Error response from server:', errorMessage);
        console.log('=====================================================');
      }
    } catch (error) {
      console.log('=====================================================');
      console.error('❌ FAILURE: Error submitting verification:', error);
      console.log('=====================================================');
      toast.error('Failed to submit verification. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="flex items-center text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-1" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center text-red-600 text-sm font-medium">
            <XCircle className="w-4 h-4 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center text-amber-600 text-sm font-medium">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </span>
        );
    }
  };

  const isFormDisabled = formData.verificationStatus?.overall === 'verified' || 
                         formData.verificationStatus?.overall === 'pending';

  if (loading && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <div className="animate-spin mb-4">
          <RotateCw size={24} />
        </div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (formData.verificationStatus?.overall === 'verified' && !isEditing) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Business Verification</h2>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Verified
          </div>
        </div>
        
        <p className="mb-4">Your business has been verified. This helps establish trust with creators on our platform.</p>
        
        <button onClick={handleEdit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          View Details
        </button>
      </div>
    );
  }

  if (formData.verificationStatus?.overall === 'pending' && !isEditing) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Business Verification</h2>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
            <Clock size={16} className="mr-2" />
            Pending Review
          </div>
        </div>
        
        <p className="mb-4">Your verification request is being reviewed. This process typically takes 1-2 business days.</p>
        
        <button onClick={handleEdit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          View Submission
        </button>
      </div>
    );
  }

  if (formData.verificationStatus?.overall === 'rejected' && !isEditing) {
    return (
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Verification Rejected</h3>
        <p className="text-gray-600 mb-4">
          Your verification has been rejected. Please review the feedback and resubmit with the required information.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => setFormData(prev => ({
            ...prev,
            verificationStatus: {
              ...prev.verificationStatus!,
              overall: 'pending'
            }
          }))}
        >
          Edit and Resubmit
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Brand Verification</h2>
        {formData.verificationStatus?.overall && (
          <div className="flex justify-center mb-4">
            {renderStatusBadge(formData.verificationStatus.overall)}
          </div>
        )}
        <p className="text-gray-600">
          Complete the verification process to unlock all brand features and establish trust with creators.
        </p>
      </div>

      {formData.verificationStatus?.overall === 'verified' ? (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Your Brand is Verified!</h3>
          <p className="text-gray-600 mb-4">
            Congratulations! Your brand has been verified. You now have full access to all platform features.
          </p>
        </div>
      ) : formData.verificationStatus?.overall === 'rejected' ? (
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Verification Rejected</h3>
          <p className="text-gray-600 mb-4">
            Your verification has been rejected. Please review the feedback and resubmit with the required information.
          </p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => setFormData(prev => ({
              ...prev,
              verificationStatus: {
                ...prev.verificationStatus!,
                overall: 'pending'
              }
            }))}
          >
            Edit and Resubmit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary" />
                Business Information
              </h3>
              {formData.verificationStatus?.business && renderStatusBadge(formData.verificationStatus.business)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name*
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your business name"
                  required
                  disabled={isFormDisabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isFormDisabled}
                >
                  <option value="">Select business type</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                Contact Information
              </h3>
              {formData.verificationStatus?.contact && renderStatusBadge(formData.verificationStatus.contact)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Business Website*
                </label>
                <input
                  type="url"
                  name="businessWebsite"
                  value={formData.businessWebsite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://your-business.com"
                  required
                  disabled={isFormDisabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Business Email*
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="contact@your-business.com"
                  required
                  disabled={isFormDisabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Business Phone*
                </label>
                <input
                  type="tel"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={isFormDisabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Business Address
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123 Business St, City, Country"
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                Registration Information
              </h3>
              {formData.verificationStatus?.registration && renderStatusBadge(formData.verificationStatus.registration)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Registration number"
                  disabled={isFormDisabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Tax ID number"
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Verification Documents
              </h3>
              {formData.verificationStatus?.documents && renderStatusBadge(formData.verificationStatus.documents)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Please upload documents to verify your business. At least one document is required.
            </p>
            
            {!isFormDisabled && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-4 mb-2">
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Business Registration')}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Business Registration
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Tax Document')}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Tax Document
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Identity Proof')}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Identity Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDocument('Other')}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Other Document
                  </button>
                </div>
              </div>
            )}
            
            {formData.documents.length > 0 ? (
              <div className="space-y-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    {!isFormDisabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
                <Paperclip className="w-5 h-5 mx-auto mb-2" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              Social Media Profiles (Optional)
            </h3>
            
            {!isFormDisabled && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleAddSocialMedia}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Social Media
                </button>
              </div>
            )}
            
            {formData.socialMediaProfiles.length > 0 ? (
              <div className="space-y-3">
                {formData.socialMediaProfiles.map((profile, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <select
                          value={profile.platform}
                          onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          disabled={isFormDisabled}
                        >
                          <option value="">Select platform</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="YouTube">YouTube</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="url"
                          value={profile.url}
                          onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Profile URL"
                          disabled={isFormDisabled}
                        />
                      </div>
                    </div>
                    {!isFormDisabled && (
                      <button
                        type="button"
                        onClick={() => removeSocialMedia(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
                <Globe className="w-5 h-5 mx-auto mb-2" />
                <p>No social media profiles added yet</p>
              </div>
            )}
          </div>
          
          {!isFormDisabled && (
            <div className="mt-6 text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : verificationExists ? (
                  'Update Verification'
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
} 