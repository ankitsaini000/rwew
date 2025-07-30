"use client";

import { useEffect, useState, useRef } from "react";
import {
  Shield,
  Mail,
  Phone,
  FileText,
  FileBadge,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getBrandVerificationStatus, 
  submitEmailVerification,
  submitPhoneVerification,
  submitPANVerification,
  submitGSTVerification,
  submitIDProofVerification,
  submitUPIVerification,
  submitCardVerification,
  createBrandVerificationPaymentOrder,
  verifyBrandVerificationPayment
} from "@/services/api";
import VerificationModal from "./VerificationModal";
import { loadRazorpayScript } from '@/utils/razorpay';

interface BrandVerificationProps {
  accountStatus: {
    email: boolean;
    phone: boolean;
    pan: boolean;
    gst: boolean;
    idProof: boolean;
    payment: {
      upi: boolean;
      card: boolean;
    };
  };
  onPhoneVerify?: () => void;
  setAccountStatus: React.Dispatch<React.SetStateAction<{
    email: boolean;
    phone: boolean;
    pan: boolean;
    gst: boolean;
    idProof: boolean;
    payment: {
      upi: boolean;
      card: boolean;
    };
  }>>;
}

interface VerificationItem {
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
}

interface VerificationStatus {
  email: VerificationItem;
  phone: VerificationItem;
  pan: VerificationItem;
  gst?: VerificationItem;
  idProof: VerificationItem;
  payment: {
    upi: VerificationItem;
    card: VerificationItem;
  };
  overallStatus: 'pending' | 'verified' | 'rejected';
}

type VerificationType = 'email' | 'phone' | 'pan' | 'gst' | 'idProof' | 'upi' | 'card' | 'payment';

export default function BrandVerification({
  accountStatus,
  onPhoneVerify,
  setAccountStatus
}: BrandVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'upi' | 'card' | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiId, setUpiId] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const upiInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        const response = await getBrandVerificationStatus();
        console.log('getBrandVerificationStatus response:', response);
        if (response.success && 'data' in response && response.data) {
          setVerificationStatus(response.data as VerificationStatus);
        } else if (!response.success && 'error' in response) {
          console.error('Failed to fetch verification status:', response.error);
          toast.error('Failed to load verification status');
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        toast.error('Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  const handleVerificationClick = (type: VerificationType) => {
    if (!verificationStatus) return;
    let isInProcess = false;
    if (
      (type === 'pan' && verificationStatus.pan && verificationStatus.pan.status === 'pending' && (verificationStatus.pan as any).panNumber) ||
      (type === 'gst' && verificationStatus.gst && verificationStatus.gst.status === 'pending' && (verificationStatus.gst as any).gstNumber) ||
      (type === 'idProof' && verificationStatus.idProof && verificationStatus.idProof.status === 'pending' && (verificationStatus.idProof as any).documentUrl)
    ) {
      isInProcess = true;
    }
    if (isInProcess) {
      toast('Your document is in process, please wait.', { icon: '⏳' });
      return;
    }
    if (type === 'payment') {
      setShowPaymentModal(true);
      setPaymentMethod('card');
      setUpiId('');
      setCardLast4('');
    } else {
      setSelectedVerification(type);
      setShowVerificationModal(true);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(false);
    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Please enter your UPI ID');
      setShowPaymentModal(true);
      return;
    }
    if (paymentMethod === 'card' && !cardLast4) {
      toast.error('Please enter last 4 digits of your card');
      setShowPaymentModal(true);
      return;
    }
    await handleBrandPayment(paymentMethod, upiId, cardLast4);
  };

  // Close modal after successful verification submission
  const handleVerificationComplete = () => {
    setShowVerificationModal(false);
    // Optionally, refresh status here if needed
  };

  // Razorpay payment handler
  const handleBrandPayment = async (method: 'upi' | 'card', upiId?: string, cardLast4?: string) => {
    setPaymentLoading(true);
    try {
      // 1. Create order on backend
      const orderRes = await createBrandVerificationPaymentOrder(1, 'INR', `brand-verification-${Date.now()}`);
      if (!orderRes || !orderRes.order) {
        toast.error('Failed to create payment order');
        setPaymentLoading(false);
        return;
      }
      const order = orderRes.order;
      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error('Razorpay SDK failed to load.');
        setPaymentLoading(false);
        return;
      }
      // 3. Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Jlvb5wZpEue8k0',
        amount: order.amount,
        currency: order.currency,
        name: 'Brand Verification',
        description: 'Payment Verification',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setPaymentLoading(true);
            const verifyRes = await verifyBrandVerificationPayment({
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              method,
              upiId,
              cardLast4,
            });
            setPaymentLoading(false);
            if (verifyRes && verifyRes.success) {
              setVerificationStatus(verifyRes.verification);
              toast.success('Payment verified!');
              setShowPaymentOptions(false);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            setPaymentLoading(false);
            toast.error('Payment verification error');
            console.error('Payment verification error:', err);
          }
        },
        prefill: {},
        theme: { color: '#7c3aed' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentLoading(false);
      toast.error('Payment error');
      console.error('Payment error:', err);
    }
  };

  const renderVerificationItem = (title: string, description: string, type: VerificationType, icon: React.ReactNode, optional = false, paymentButton?: React.ReactNode) => {
    if (!verificationStatus) return null;
    let verificationItem: VerificationItem | undefined;
    if (type === 'payment') {
      const upi = verificationStatus.payment.upi;
      const card = verificationStatus.payment.card;
      if (upi.status === 'verified' || card.status === 'verified') {
        verificationItem = { status: 'verified' };
      } else if (upi.status === 'rejected' && card.status === 'rejected') {
        verificationItem = { status: 'rejected' };
      } else {
        verificationItem = { status: 'pending' };
      }
    } else if (type === 'upi' || type === 'card') {
      // These are not rendered anymore, but keep for type safety
      verificationItem = undefined;
    } else {
      verificationItem = verificationStatus[type];
    }
    if (!verificationItem || !('status' in verificationItem)) return null;
    const status = verificationItem.status;
    const isVerified = status === 'verified';
    const isRejected = status === 'rejected';
    let isInProcess = false;
    if (status === 'pending') {
      if (
        (type === 'pan' && verificationStatus.pan && (verificationStatus.pan as any).panNumber) ||
        (type === 'gst' && verificationStatus.gst && (verificationStatus.gst as any).gstNumber) ||
        (type === 'idProof' && verificationStatus.idProof && (verificationStatus.idProof as any).documentUrl)
      ) {
        isInProcess = true;
      }
    }
    const statusLabel = isVerified
      ? 'Verified'
      : isRejected
      ? 'Rejected'
      : isInProcess
      ? 'In Process'
      : 'Pending';
    const finalStatusLabel = (type === 'payment' && status === 'pending') ? 'Pending' : statusLabel;
    return (
      <div className="flex items-start p-4 bg-white rounded-xl border border-gray-100">
        <div className={`p-2 rounded-lg ${isVerified ? 'bg-green-100' : isRejected ? 'bg-red-100' : isInProcess && type !== 'payment' ? 'bg-blue-100' : 'bg-orange-100'} mr-4`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium text-gray-900">{title} {optional && <span className="text-xs text-gray-400 ml-1">(Optional)</span>}</h3>
            <span className={`$ {
              isVerified ? 'bg-green-100 text-green-800' : 
              isRejected ? 'bg-red-100 text-red-800' : 
              isInProcess && type !== 'payment' ? 'bg-blue-100 text-blue-800' : 
              'bg-orange-100 text-orange-800'
            } text-xs px-2.5 py-1 rounded-full flex items-center`}>
              {isVerified ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : isRejected ? (
                <AlertCircle className="w-3 h-3 mr-1" />
              ) : isInProcess && type !== 'payment' ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin text-blue-800" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {finalStatusLabel}
            </span>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-2 flex space-x-3">
            {!isVerified && (
              <button 
                onClick={() => handleVerificationClick(type)}
                className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center"
              >
                {isRejected ? 'Resubmit' : 'Complete Verification'} <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
            <button 
              onClick={() => handleVerificationClick(type)}
              className="text-sm text-gray-500 font-medium hover:text-gray-700 flex items-center"
            >
              {isVerified ? 'Edit' : 'View Details'}
            </button>
          </div>
          {paymentButton}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-purple-600" />
          Brand Verification
        </h2>
        <div className="space-y-4">
          {renderVerificationItem(
            "Email",
            "Verify your email to secure your account and receive important updates.",
            "email",
            <Mail className="w-5 h-5 text-purple-600" />
          )}
          {renderVerificationItem(
            "Phone",
            "Add and verify your phone number for additional security and communication.",
            "phone",
            <Phone className="w-5 h-5 text-orange-600" />
          )}
          {renderVerificationItem(
            "PAN Card",
            "Upload your PAN card for identity verification.",
            "pan",
            <FileText className="w-5 h-5 text-blue-600" />
          )}
          {renderVerificationItem(
            "GST Number",
            "Provide your GST number for business verification (optional).",
            "gst",
            <FileBadge className="w-5 h-5 text-green-600" />, true
          )}
          {renderVerificationItem(
            "ID Proof",
            "Upload a government-issued ID proof (Aadhaar, Passport, etc.).",
            "idProof",
            <FileText className="w-5 h-5 text-pink-600" />
          )}
          {renderVerificationItem(
            "Payment Method",
            "Add and verify your UPI ID or credit card for payments.",
            "payment",
            <CreditCard className="w-5 h-5 text-green-600" />,
            false
          )}
        </div>
      </div>
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Payment Verification</h4>
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as 'card' | 'upi')}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              {paymentMethod === 'upi' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    ref={upiInputRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    placeholder="Enter your UPI ID (e.g. name@bank)"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Last 4 Digits</label>
                  <input
                    ref={cardInputRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                    placeholder="Enter last 4 digits of your card"
                    value={cardLast4}
                    onChange={e => setCardLast4(e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors text-sm mt-2"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Processing...' : 'Verify & Pay'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Render VerificationModal and pass onVerificationComplete */}
      <VerificationModal
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        selectedVerification={selectedVerification}
        handleVerificationSubmit={() => {}}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
} 