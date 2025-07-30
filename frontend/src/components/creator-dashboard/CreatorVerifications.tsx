"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  CreditCard,
  UserCheck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  IndianRupee,
  FileText
} from "lucide-react";
import { submitCreatorVerification, getCreatorVerificationStatus, submitCreatorEmailVerification, verifyCreatorEmailCode, submitCreatorPhoneVerification, verifyCreatorPhoneCode } from '@/services/creatorApi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const VERIFICATION_TYPES = [
  { key: 'email', label: 'Email', icon: <Mail className="w-5 h-5 text-purple-600" /> },
  { key: 'phone', label: 'Phone', icon: <Phone className="w-5 h-5 text-orange-600" /> },
  { key: 'pan', label: 'PAN', icon: <FileText className="w-5 h-5 text-blue-600" /> },
  { key: 'identity', label: 'Identity', icon: <UserCheck className="w-5 h-5 text-green-600" /> },
  { key: 'payment', label: 'Payment', icon: <div className="flex items-center space-x-1"><CreditCard className="w-5 h-5 text-green-600" /><span className="text-gray-400">/</span><IndianRupee className="w-5 h-5 text-purple-600" /></div> },
];

const statusMeta = {
  pending: {
    color: 'bg-orange-100 text-orange-800',
    label: 'Pending',
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
  processing: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Processing',
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
  verified: {
    color: 'bg-green-100 text-green-800',
    label: 'Verified',
    icon: <CheckCircle className="w-3 h-3 mr-1" />,
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    label: 'Rejected',
    icon: <AlertCircle className="w-3 h-3 mr-1" />,
  },
};

const initialStatus = {
  email: { status: 'pending' },
  phone: { status: 'pending' },
  pan: { status: 'pending' },
  identity: { status: 'pending' },
  payment: { status: 'pending' },
};

type VerificationType = 'email' | 'phone' | 'pan' | 'identity' | 'payment';
type Status = 'pending' | 'processing' | 'verified' | 'rejected';

const IDENTITY_DOC_OPTIONS = [
  '', 'Aadhaar Card', 'Passport', 'Driving License', 'Voter ID'
];
const IDENTITY_DOC_LABELS: Record<string, string> = {
  'Aadhaar Card': 'Aadhaar Number',
  'Passport': 'Passport Number',
  'Driving License': 'Driving License Number',
  'Voter ID': 'Voter ID Number',
};

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Jlvb5wZpEue8k0';

// TypeScript declaration for Razorpay on window
declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Utility to load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CreatorVerifications() {
  const [verificationStatus, setVerificationStatus] = useState<any>(initialStatus);
  const [modalType, setModalType] = useState<VerificationType | null>(null);
  const [form, setForm] = useState<any>({});
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [uploading, setUploading] = useState(false);
  const [emailStep, setEmailStep] = useState<'input' | 'verify' | 'success'>('input');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify' | 'success'>('input');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');

  // Fetch current verification status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getCreatorVerificationStatus();
        if (res && res.verification) {
          setVerificationStatus(res.verification);
        }
      } catch (err) {
        console.error('Failed to fetch creator verification status:', err);
      }
    };
    fetchStatus();
  }, []);

  const openModal = (type: VerificationType) => {
    setModalType(type);
    setForm({});
    setFileValue(null);
    if (type === 'payment') setPaymentMethod('card');
  };

  const closeModal = () => {
    setModalType(null);
    setForm({});
    setFileValue(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setFileValue((e.target as HTMLInputElement).files?.[0] || null);
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value as 'card' | 'upi');
    setForm({});
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) return;
    let payload: any = {};
    try {
      if (modalType === 'payment') {
        setUploading(true);
        const orderRes = await axios.post('http://localhost:5001/api/creator-verification/payment/order', {
          amount: 1,
          currency: 'INR',
          receipt: `creator-verification-${Date.now()}`,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUploading(false);
        if (!orderRes.data || !orderRes.data.order) {
          toast.error('Failed to create payment order');
          return;
        }
        const order = orderRes.data.order;
        // Ensure Razorpay script is loaded
        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          toast.error('Razorpay SDK failed to load.');
          return;
        }
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Creator Verification',
          description: 'Payment Verification',
          order_id: order.id,
          handler: async function (response: any) {
            try {
              setUploading(true);
              const verifyRes = await axios.post('http://localhost:5001/api/creator-verification/payment/verify', {
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                method: paymentMethod,
                upiId: form.upiId,
                cardLast4: form.cardNumber?.slice(-4),
              }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              setUploading(false);
              if (verifyRes.data && verifyRes.data.success) {
                setVerificationStatus((prev: any) => ({ ...prev, payment: verifyRes.data.verification.payment }));
                toast.success('Payment verified!');
                closeModal();
              } else {
                toast.error('Payment verification failed');
              }
            } catch (err) {
              setUploading(false);
              toast.error('Payment verification error');
              console.error('Payment verification error:', err);
            }
          },
          prefill: {
            name: form.cardholder || '',
            email: form.email || '',
          },
          theme: { color: '#7c3aed' },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } else if (modalType === 'pan' && fileValue) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileValue);
        const res = await axios.post('http://localhost:5001/api/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUploading(false);
        if (res.data && res.data.data && res.data.data.fileUrl) {
          payload = { pan: { status: 'pending', panNumber: form.panNumber, documentUrl: res.data.data.fileUrl } };
        } else {
          toast.error('File upload failed');
          return;
        }
      } else if (modalType === 'identity' && fileValue) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileValue);
        const res = await axios.post('http://localhost:5001/api/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUploading(false);
        if (res.data && res.data.data && res.data.data.fileUrl) {
          payload = { identity: { status: 'pending', idType: form.idDocType, idNumber: form.idNumber, documentUrl: res.data.data.fileUrl } };
        } else {
          toast.error('File upload failed');
          return;
        }
      } else {
        switch (modalType) {
          case 'email':
            payload = { email: { status: 'pending', email: form.email } };
            break;
          case 'phone':
            payload = { phone: { status: 'pending', phoneNumber: form.phone } };
            break;
          default:
            break;
        }
      }
      const res = await submitCreatorVerification(payload);
      if (res && res.success) {
        setVerificationStatus((prev: any) => ({ ...prev, ...payload }));
        toast.success('Verification data submitted!');
        console.log('Creator verification data submitted:', payload);
      } else {
        toast.error('Failed to submit verification data');
      }
    } catch (err) {
      setUploading(false);
      toast.error('Error submitting verification data');
      console.error('Error submitting verification:', err);
      return;
    }
    closeModal();
  };

  const handleSendEmailOTP = async () => {
    setEmailLoading(true);
    try {
      const res = await submitCreatorEmailVerification(form.email);
      if (res && res.success) {
        toast.success(res.message || 'Verification code sent!');
        setEmailStep('verify');
      } else {
        toast.error(res?.error || 'Failed to send verification code');
      }
    } catch (err) {
      toast.error('Error sending verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    setEmailLoading(true);
    try {
      const res = await verifyCreatorEmailCode(form.email, emailVerificationCode);
      if (res && res.success) {
        toast.success(res.message || 'Email verified!');
        setEmailStep('success');
        setVerificationStatus((prev: any) => ({ ...prev, email: { ...prev.email, status: 'verified' } }));
      } else {
        toast.error(res?.error || 'Invalid or expired code');
      }
    } catch (err) {
      toast.error('Error verifying code');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    setPhoneLoading(true);
    try {
      const res = await submitCreatorPhoneVerification(form.phone);
      if (res && res.success) {
        toast.success(res.message || 'Verification code sent!');
        setPhoneStep('verify');
      } else {
        toast.error(res?.error || 'Failed to send verification code');
      }
    } catch (err) {
      toast.error('Error sending verification code');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    setPhoneLoading(true);
    try {
      const res = await verifyCreatorPhoneCode(form.phone, phoneVerificationCode);
      if (res && res.success) {
        toast.success(res.message || 'Phone verified!');
        setPhoneStep('success');
        setVerificationStatus((prev: any) => ({ ...prev, phone: { ...prev.phone, status: 'verified' } }));
      } else {
        toast.error(res?.error || 'Invalid or expired code');
      }
    } catch (err) {
      toast.error('Error verifying code');
    } finally {
      setPhoneLoading(false);
    }
  };

  const renderModalFields = () => {
    switch (modalType) {
      case 'email':
        return (
          <>
            {emailStep === 'input' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={form.email || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmailOTP}
                  disabled={emailLoading || !form.email}
                  className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${emailLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {emailLoading ? (
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
            {emailStep === 'verify' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="Enter code sent to your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={emailVerificationCode}
                    onChange={e => setEmailVerificationCode(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyEmailOTP}
                  disabled={emailLoading || emailVerificationCode.length !== 6}
                  className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${emailLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {emailLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailOTP}
                  disabled={emailLoading}
                  className="w-full py-2.5 mt-2 text-purple-600 hover:text-purple-800"
                >
                  Resend Code
                </button>
              </>
            )}
            {emailStep === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verified Successfully!</h3>
                <p className="text-sm text-gray-600 mb-4">Your email has been verified and your account is now more secure.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep('input');
                    setEmailVerificationCode('');
                    closeModal();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Continue
                </button>
              </div>
            )}
          </>
        );
      case 'phone':
        return (
          <>
            {phoneStep === 'input' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={form.phone || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendPhoneOTP}
                  disabled={phoneLoading || !form.phone}
                  className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${phoneLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {phoneLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            )}
            {phoneStep === 'verify' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="Enter code sent to your phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={phoneVerificationCode}
                    onChange={e => setPhoneVerificationCode(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyPhoneOTP}
                  disabled={phoneLoading || phoneVerificationCode.length !== 6}
                  className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${phoneLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {phoneLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={handleSendPhoneOTP}
                  disabled={phoneLoading}
                  className="w-full py-2.5 mt-2 text-purple-600 hover:text-purple-800"
                >
                  Resend Code
                </button>
              </>
            )}
            {phoneStep === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verified Successfully!</h3>
                <p className="text-sm text-gray-600 mb-4">Your phone has been verified and your account is now more secure.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneStep('input');
                    setPhoneVerificationCode('');
                    closeModal();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Continue
                </button>
              </div>
            )}
          </>
        );
      case 'pan':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                placeholder="Enter your PAN number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                value={form.panNumber || ''}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PAN Document</label>
              <input
                type="file"
                name="panFile"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                onChange={handleFormChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit PAN Verification'
              )}
            </button>
          </>
        );
      case 'identity':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                value={form.fullName || ''}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                name="idDocType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                value={form.idDocType || ''}
                onChange={handleFormChange}
                required
              >
                {IDENTITY_DOC_OPTIONS.map((doc) => (
                  <option key={doc} value={doc}>{doc === '' ? 'Select Document Type' : doc}</option>
                ))}
              </select>
            </div>
            {form.idDocType && IDENTITY_DOC_LABELS[form.idDocType] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{IDENTITY_DOC_LABELS[form.idDocType]}</label>
                <input
                  type="text"
                  name="idNumber"
                  placeholder={`Enter your ${IDENTITY_DOC_LABELS[form.idDocType]}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                  value={form.idNumber || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
              <input
                type="file"
                name="idFile"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                onChange={handleFormChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Identity Verification'
              )}
            </button>
          </>
        );
      case 'payment':
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardholder"
                    placeholder="Enter cardholder name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={form.cardholder || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Enter card number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    value={form.cardNumber || ''}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                      value={form.expiry || ''}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="CVV"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                      value={form.cvv || ''}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  placeholder="Enter your UPI ID (e.g. name@bank)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                  value={form.upiId || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderModal = () => {
    if (!modalType) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative animate-fadeIn mx-2">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            onClick={closeModal}
            aria-label="Close"
          >
            &times;
          </button>
          <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">{VERIFICATION_TYPES.find(v => v.key === modalType)?.label} Verification</h4>
          <form onSubmit={handleVerification} className="space-y-5">
            {renderModalFields()}
            {/* Only show the main submit button if not email modal */}
            {modalType !== 'email' && (
              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors text-sm mt-2"
                disabled={uploading}
              >
                {uploading ? 'Verifying...' : 'Verify'}
              </button>
            )}
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
          Creator Verification
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {VERIFICATION_TYPES.map((v) => {
            let status = verificationStatus[v.key]?.status || 'pending';
            if (v.key === 'payment') {
              const upiStatus = verificationStatus.payment?.upi?.status;
              const cardStatus = verificationStatus.payment?.card?.status;
              if (upiStatus === 'verified' || cardStatus === 'verified') status = 'verified';
              else if (upiStatus === 'rejected' && cardStatus === 'rejected') status = 'rejected';
              else status = 'pending';
            }
            const meta = statusMeta[status as Status];
            const isVerified = status === 'verified';
            const isRejected = status === 'rejected';
            return (
              <div key={v.key} className="flex items-start p-3 sm:p-4 bg-white rounded-xl border border-gray-100">
                <div className={`p-2 rounded-lg ${isVerified ? 'bg-green-100' : isRejected ? 'bg-red-100' : 'bg-orange-100'} mr-3 sm:mr-4`}>
                  {v.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-900 text-base sm:text-lg">{v.label} Verification</h3>
                    <span className={`inline-flex items-center ${meta.color} text-xs px-2.5 py-1 rounded-full`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {v.key === 'email' && 'Verify your email to secure your account and receive important updates.'}
                    {v.key === 'phone' && 'Add and verify your phone number for additional security and communication.'}
                    {v.key === 'pan' && 'Upload your PAN card for identity verification.'}
                    {v.key === 'identity' && 'Upload a government-issued ID proof (Aadhaar, Passport, etc.).'}
                    {v.key === 'payment' && 'Add a payment method (Card or UPI) to easily receive payments from brands.'}
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {!isVerified && (
                      <button
                        onClick={() => openModal(v.key as VerificationType)}
                        className="text-sm sm:text-base text-purple-600 font-medium hover:text-purple-800 flex items-center px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition"
                      >
                        Complete Verification <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                    <button
                      onClick={() => openModal(v.key as VerificationType)}
                      className="text-sm sm:text-base text-gray-500 font-medium hover:text-gray-700 flex items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      {isVerified ? 'Edit' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative animate-fadeIn mx-2">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">{VERIFICATION_TYPES.find(v => v.key === modalType)?.label} Verification</h4>
            <form onSubmit={handleVerification} className="space-y-5">
              {renderModalFields()}
              {/* Only show the main submit button if not email modal */}
              {modalType !== 'email' && (
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors text-sm mt-2"
                  disabled={uploading}
                >
                  {uploading ? 'Verifying...' : 'Verify'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
