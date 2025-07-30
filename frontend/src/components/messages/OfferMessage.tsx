import React, { useState } from 'react';
import { DollarSign, Clock, Calendar, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { acceptOffer, rejectOffer, counterOffer, createOffer } from '@/services/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface OfferMessageProps {
  offer: {
    _id: string;
    conversationId: string;
    type: 'brand_to_creator' | 'creator_to_brand';
    service: string;
    description: string;
    price: number;
    currency: string;
    deliveryTime: number;
    revisions: number;
    deliverables: string[];
    terms: string;
    validUntil: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
    counterOffer?: {
      price: number;
      deliveryTime: number;
      revisions: number;
      terms: string;
      message: string;
    };
    senderId: {
      _id: string;
      fullName: string;
      username: string;
      avatar?: string;
      role: string;
    };
    recipientId: {
      _id: string;
      fullName: string;
      username: string;
      avatar?: string;
      role: string;
    };
    createdAt: string;
  };
  isSent: boolean;
  currentUserId: string;
  onOfferUpdate?: (offerId: string, newStatus: string, message?: string) => void;
}

export default function OfferMessage({ offer, isSent, currentUserId, onOfferUpdate }: OfferMessageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [counterData, setCounterData] = useState({
    price: offer.price,
    deliveryTime: offer.deliveryTime,
    revisions: offer.revisions,
    terms: offer.terms,
    message: ''
  });

  // Helper to get recipient id whether it's an object or string
  const getRecipientId = (recipient: any) => {
    if (recipient && typeof recipient === 'object' && '_id' in recipient) {
      return recipient._id;
    }
    return recipient;
  };

  const isRecipient = getRecipientId(offer.recipientId) === currentUserId;
  const isExpired = new Date() > new Date(offer.validUntil);
  const canAct = isRecipient && offer.status === 'pending' && !isExpired;

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptOffer(offer._id);
      toast.success('Offer accepted successfully!');
      onOfferUpdate?.(offer._id, 'accepted');
      
      // Automatically display payment message to brand when creator accepts
      if (offer.type === 'brand_to_creator') {
        const paymentMessage = `🎉 Your offer has been accepted! Please make payment of ${offer.currency} ${offer.price} to start the order for ${offer.service}.`;
        // This will be handled by the parent component to display in chat
        if (onOfferUpdate) {
          onOfferUpdate(offer._id, 'accepted', paymentMessage);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectOffer(offer._id);
      toast.success('Offer rejected');
      onOfferUpdate?.(offer._id, 'rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject offer');
    } finally {
      setLoading(false);
    }
  };

  const handleCounter = async () => {
    try {
      setLoading(true);
      await counterOffer(offer._id, counterData);
      toast.success('Counter offer sent!');
      onOfferUpdate?.(offer._id, 'countered');
      setShowCounterForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send counter offer');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async () => {
    try {
      setLoading(true);
      // Create a new offer based on the counter offer terms
      const counterOfferData = {
        conversationId: offer.conversationId,
        recipientId: offer.senderId._id,
        type: offer.type === 'brand_to_creator' ? 'creator_to_brand' : 'brand_to_creator',
        service: offer.service,
        description: offer.description,
        price: offer.counterOffer!.price,
        currency: offer.currency,
        deliveryTime: offer.counterOffer!.deliveryTime,
        revisions: offer.counterOffer!.revisions,
        deliverables: offer.deliverables,
        terms: offer.counterOffer!.terms || offer.terms,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      await createOffer(counterOfferData);
      toast.success('Counter offer accepted! New offer created.');
      onOfferUpdate?.(offer._id, 'accepted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept counter offer');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = () => {
    console.log('Original offer data:', offer);
    
    // Prepare checkout data with offer details
    const checkoutData = {
      service: offer.service,
      description: offer.description,
      price: offer.price,
      currency: offer.currency,
      deliveryTime: offer.deliveryTime,
      revisions: offer.revisions,
      deliverables: offer.deliverables,
      terms: offer.terms,
      offerId: offer._id,
      conversationId: offer.conversationId,
      creatorId: getRecipientId(offer.recipientId),
      creatorName: offer.recipientId.fullName,
      creatorUsername: offer.recipientId.username,
      creatorAvatar: offer.recipientId.avatar
    };

    console.log('Checkout data being stored:', checkoutData);
    
    // Store checkout data in localStorage for the checkout page to access
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Redirect to checkout page with offerId in URL
    router.push(`/checkout?offerId=${offer._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-700 bg-green-200 border border-green-300';
      case 'rejected': return 'text-red-700 bg-red-200 border border-red-300';
      case 'expired': return 'text-gray-700 bg-gray-200 border border-gray-300';
      case 'countered': return 'text-orange-700 bg-orange-200 border border-orange-300';
      default: return 'text-blue-700 bg-blue-200 border border-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'countered': return <MessageSquare className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className={`max-w-[85%] ${isSent ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
        isSent 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
          : 'bg-white text-gray-900 border-2 border-gray-200'
      }`}>
        {/* Offer Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wide">
              {offer.type === 'brand_to_creator' ? 'Brand Offer' : 'Creator Offer'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(offer.status)}`}>
              {getStatusIcon(offer.status)}
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </span>
            {isExpired && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-300">Expired</span>
            )}
          </div>
        </div>

        {/* Service and Price */}
        <div className="mb-4">
          <div className="font-bold text-base mb-2 tracking-wide">{offer.service}</div>
          <div className="text-3xl font-black tracking-tight">
            {offer.currency} {offer.price.toLocaleString()}
          </div>
        </div>

        {/* Quick Details */}
        <div className="flex items-center gap-6 text-sm mb-4 font-semibold">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{offer.deliveryTime} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{offer.revisions} revisions</span>
          </div>
        </div>

        {/* Description Preview */}
        <div className="text-sm mb-4 font-semibold leading-relaxed text-gray-900">
          {offer.description}
        </div>

        {/* Action Buttons */}
        {canAct && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={() => setShowCounterForm(!showCounterForm)}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              Counter
            </button>
          </div>
        )}

        {/* Accept Counter Button - shown when there's a counter offer and user is the original sender */}
        {offer.counterOffer && offer.senderId._id === currentUserId && offer.status === 'countered' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAcceptCounter}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Accepting Counter...' : 'Accept Counter'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}

        {/* Payment Prompt - shown when offer is accepted and user is the brand */}
        {offer.status === 'accepted' && offer.senderId._id === currentUserId && offer.type === 'brand_to_creator' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-300 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">💰</span>
              </div>
              <div>
                <h4 className="font-bold text-green-800 text-sm">Payment Required</h4>
                <p className="text-green-700 text-xs">Your offer has been accepted! Please make payment to start the order.</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">{offer.currency} {offer.price.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-600">
                Service: {offer.service} • Delivery: {offer.deliveryTime} days
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMakePayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? 'Processing Payment...' : 'Make Payment & Start Order'}
              </button>
              <button
                onClick={() => {/* Add payment method selection */}}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md"
              >
                Payment Methods
              </button>
            </div>
          </div>
        )}

        {/* Counter Offer Form */}
        {showCounterForm && canAct && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Price</label>
                <input
                  type="number"
                  value={counterData.price}
                  onChange={(e) => setCounterData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Delivery (days)</label>
                <input
                  type="number"
                  value={counterData.deliveryTime}
                  onChange={(e) => setCounterData(prev => ({ ...prev, deliveryTime: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-2">Message</label>
              <textarea
                value={counterData.message}
                onChange={(e) => setCounterData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a message to your counter offer..."
                rows={3}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCounter}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? 'Sending...' : 'Send Counter'}
              </button>
              <button
                onClick={() => setShowCounterForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-bold mt-3 hover:underline transition-colors"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-4">
            <div>
              <span className="text-sm font-bold text-gray-800 block mb-2">Description:</span>
              <p className="text-sm font-semibold leading-relaxed text-gray-900">{offer.description}</p>
            </div>
            
            {offer.deliverables.length > 0 && (
              <div>
                <span className="text-sm font-bold text-gray-800 block mb-2">Deliverables:</span>
                <ul className="space-y-2">
                  {offer.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {offer.terms && (
              <div>
                <span className="text-sm font-bold text-gray-800 block mb-2">Terms:</span>
                <p className="text-sm font-semibold leading-relaxed text-gray-900">{offer.terms}</p>
              </div>
            )}

            {offer.counterOffer && (
              <div className="mt-4 p-4 bg-orange-100 rounded-lg border-2 border-orange-300 shadow-md">
                <span className="text-sm font-bold text-orange-900 block mb-3">Counter Offer:</span>
                <div className="space-y-2 text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-800">Price:</span>
                    <span>{offer.currency} {offer.counterOffer.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-800">Delivery:</span>
                    <span>{offer.counterOffer.deliveryTime} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-800">Revisions:</span>
                    <span>{offer.counterOffer.revisions}</span>
                  </div>
                  {offer.counterOffer.message && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-orange-800">Message:</span>
                      <span className="flex-1">{offer.counterOffer.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs font-bold text-gray-700 mt-3 text-right">
          {new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
} 