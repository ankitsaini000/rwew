"use client";

import { useState, FormEvent } from 'react';
import { X, CheckCircle, Mail, Smartphone, CreditCard, FileText, FileBadge, IdCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  submitEmailVerification,
  submitPhoneVerification,
  submitPANVerification,
  submitGSTVerification,
  submitIDProofVerification,
  submitUPIVerification,
  submitCardVerification,
  verifyEmailCode,
  verifyPhoneCode
} from '@/services/api';

interface VerificationModalProps {
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  selectedVerification: string | null;
  handleVerificationSubmit: (e: FormEvent) => void;
  onVerificationComplete?: () => void;
}

export default function VerificationModal({ 
  showVerificationModal, 
  setShowVerificationModal, 
  selectedVerification,
  handleVerificationSubmit,
  onVerificationComplete
}: VerificationModalProps) {
  const [verificationStep, setVerificationStep] = useState<"input" | "verify" | "success">("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    panNumber: '',
    gstNumber: '',
    idType: 'aadhaar',
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      switch (selectedVerification) {
        case 'email':
          response = await submitEmailVerification(formData.email);
          break;
        case 'phone':
          response = await submitPhoneVerification(formData.phoneNumber);
          break;
        case 'pan':
          if (!selectedFile) {
            toast.error('Please select a PAN document');
            setLoading(false);
            return;
          }
          response = await submitPANVerification(formData.panNumber, selectedFile);
          break;
        case 'gst':
          response = await submitGSTVerification(formData.gstNumber, selectedFile || undefined);
          break;
        case 'idProof':
          if (!selectedFile) {
            toast.error('Please select an ID proof document');
            setLoading(false);
            return;
          }
          response = await submitIDProofVerification(formData.idType, selectedFile);
          break;
        case 'upi':
          response = await submitUPIVerification(formData.upiId);
          break;
        case 'card':
          response = await submitCardVerification(formData.cardNumber, formData.expiryDate, formData.cvv);
          break;
        default:
          toast.error('Invalid verification type');
          setLoading(false);
          return;
      }
      console.log('Verification response:', response);
      const isSuccess =
        (response && response.data && response.data.success) ||
        (response && response.success);
      if (isSuccess) {
        toast.success(
          response?.data?.message ||
          response?.message ||
          'Verification submitted successfully'
        );
        if (selectedVerification === 'email' || selectedVerification === 'phone') {
          setVerificationStep('verify');
        } else {
          setVerificationStep('success');
          onVerificationComplete?.();
        }
      } else {
        toast.error(
          response?.data?.error ||
          response?.data?.message ||
          response?.error ||
          response?.message ||
          'Failed to submit verification'
        );
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (selectedVerification === 'email') {
        response = await verifyEmailCode(formData.email, verificationCode);
      } else if (selectedVerification === 'phone') {
        response = await verifyPhoneCode(formData.phoneNumber, verificationCode);
      }
      console.log('Verify code response:', response);
      const isSuccess =
        (response && response.data && response.data.success) ||
        (response && response.success);
      if (isSuccess) {
        toast.success(
          response?.data?.message ||
          response?.message ||
          'Verification successful!'
        );
        setVerificationStep('success');
        onVerificationComplete?.();
      } else {
        toast.error(
          response?.data?.error ||
          response?.data?.message ||
          response?.error ||
          response?.message ||
          'Invalid or expired code.'
        );
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!showVerificationModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedVerification === 'email' && 'Email Verification'}
              {selectedVerification === 'phone' && 'Phone Verification'}
              {selectedVerification === 'payment' && 'Payment Method'}
              {selectedVerification === 'identity' && 'Identity Verification'}
              {selectedVerification === 'location' && 'Location Verification'}
              {selectedVerification === 'pan' && 'PAN Verification'}
              {selectedVerification === 'gst' && 'GST Verification'}
              {selectedVerification === 'idProof' && 'ID Proof Verification'}
              {selectedVerification === 'card' && 'Credit Card Verification'}
              {selectedVerification === 'upi' && 'UPI Verification'}
            </h3>
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {selectedVerification === 'email' && (
              <div className="space-y-4">
                {verificationStep === "input" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        placeholder="your@email.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <p className="text-sm text-gray-500">We'll send a verification code to this email address.</p>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  </>
                )}
                
                {verificationStep === "verify" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <div className="flex space-x-2">
                        {[...Array(6)].map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                            value={verificationCode[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                const newCode = verificationCode.split('');
                                newCode[index] = value;
                                setVerificationCode(newCode.join(''));
                                
                                // Auto-focus next input
                                if (value && index < 5) {
                                  const inputs = document.querySelectorAll('input[maxLength="1"]');
                                  const nextInput = inputs[index + 1] as HTMLInputElement;
                                  if (nextInput) nextInput.focus();
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your email.</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length !== 6 || loading}
                        className={`px-4 py-2 rounded-lg text-white ${
                          verificationCode.length === 6 && !loading
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-purple-400 cursor-not-allowed"
                        }`}
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                      <button
                        type="button"
                        disabled={loading}
                        className={`text-sm text-purple-600 hover:text-purple-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            let response;
                            if ((selectedVerification as string) === 'email') {
                              response = await submitEmailVerification(formData.email);
                            } else if ((selectedVerification as string) === 'phone') {
                              response = await submitPhoneVerification(formData.phoneNumber);
                            }
                            if (response && response.success) {
                              toast.success('Verification code resent!');
                            } else {
                              toast.error(response?.error || 'Failed to resend code');
                            }
                          } catch (err) {
                            toast.error('An unexpected error occurred');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          'Resend Code'
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                {verificationStep === "success" && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified Successfully!</h3>
                      <p className="text-sm text-gray-600 mb-4">Your email has been verified and your account is now more secure.</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleVerificationSubmit(new Event('submit') as any);
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {selectedVerification === 'phone' && (
              <div className="space-y-4">
                {verificationStep === "input" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        placeholder="+1 (555) 123-4567" 
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                    <p className="text-sm text-gray-500">We'll send a verification code via SMS to this number.</p>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  </>
                )}
                
                {verificationStep === "verify" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <div className="flex space-x-2">
                        {[...Array(6)].map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 text-center border border-gray-300 rounded-lg text-lg font-medium"
                            value={verificationCode[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                const newCode = verificationCode.split('');
                                newCode[index] = value;
                                setVerificationCode(newCode.join(''));
                                
                                // Auto-focus next input
                                if (value && index < 5) {
                                  const inputs = document.querySelectorAll('input[maxLength="1"]');
                                  const nextInput = inputs[index + 1] as HTMLInputElement;
                                  if (nextInput) nextInput.focus();
                                }
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code we sent to your phone.</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length !== 6 || loading}
                        className={`px-4 py-2 rounded-lg text-white ${
                          verificationCode.length === 6 && !loading
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-purple-400 cursor-not-allowed"
                        }`}
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                      <button
                        type="button"
                        disabled={loading}
                        className={`text-sm text-purple-600 hover:text-purple-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            let response;
                            if ((selectedVerification as string) === 'email') {
                              response = await submitEmailVerification(formData.email);
                            } else if ((selectedVerification as string) === 'phone') {
                              response = await submitPhoneVerification(formData.phoneNumber);
                            }
                            if (response && response.success) {
                              toast.success('Verification code resent!');
                            } else {
                              toast.error(response?.error || 'Failed to resend code');
                            }
                          } catch (err) {
                            toast.error('An unexpected error occurred');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          'Resend Code'
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                {verificationStep === "success" && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verified Successfully!</h3>
                      <p className="text-sm text-gray-600 mb-4">Your phone number has been verified and your account is now more secure.</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleVerificationSubmit(new Event('submit') as any);
                          setVerificationStep("input");
                          setVerificationCode("");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedVerification === 'payment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="1234 5678 9012 3456" 
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="MM/YY" 
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="123" 
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="John Doe" 
                  />
                </div>
                <p className="text-sm text-gray-500">Your payment information is securely stored.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Payment Method
                </button>
              </div>
            )}

            {selectedVerification === 'identity' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg" value={formData.idType} onChange={(e) => setFormData({ ...formData, idType: e.target.value })}>
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Front)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Back)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">We'll review your documents and update your verification status within 24-48 hours.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit for Verification
                </button>
              </div>
            )}

            {selectedVerification === 'location' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="123 Main St" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg"
                    placeholder="Apt 4B" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="New York" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="NY" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                      placeholder="10001" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg">
                      <option value="">Select Country</option>
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Address</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose File
                    </button>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG or PDF up to 5MB</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Please upload a utility bill, bank statement, or other official document showing your address.</p>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Verify Address
                </button>
              </div>
            )}

            {selectedVerification === 'pan' && (
              <div className="space-y-6">
                <div className="flex items-center mb-2">
                  <FileText className="w-6 h-6 text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-900">PAN Card Verification</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="ABCDE1234F" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload PAN Card</label>
                  <input type="file" className="w-full" accept="image/*,application/pdf" onChange={handleFileChange} />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF. Max size: 2MB.</p>
                </div>
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Submit PAN for Verification
                </button>
              </div>
            )}

            {selectedVerification === 'gst' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (optional)</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload GST Certificate (optional)</label>
                  <input type="file" className="w-full" accept="image/*,application/pdf" onChange={handleFileChange} />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF. Max size: 2MB.</p>
                </div>
                <button type="submit" className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit GST for Verification</button>
              </div>
            )}

            {selectedVerification === 'idProof' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select ID Type</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg" value={formData.idType} onChange={(e) => setFormData({ ...formData, idType: e.target.value })}>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="voter">Voter ID</option>
                    <option value="driving">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID Proof</label>
                  <input type="file" className="w-full" accept="image/*,application/pdf" onChange={handleFileChange} />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF. Max size: 2MB.</p>
                </div>
                <button type="submit" className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit ID Proof</button>
              </div>
            )}

            {selectedVerification === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="1234 5678 9012 3456" maxLength={19} value={formData.cardNumber} onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })} />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="MM/YY" maxLength={5} value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input type="password" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="123" maxLength={4} value={formData.cvv} onChange={(e) => setFormData({ ...formData, cvv: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Verify Card</button>
              </div>
            )}

            {selectedVerification === 'upi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg" placeholder="yourname@bank" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} />
                </div>
                <button type="submit" className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Verify UPI</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 