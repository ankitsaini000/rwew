import React, { useState, useEffect } from 'react';
import { X, DollarSign, Clock, Calendar, MessageSquare, Send, Zap, Info, UserCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { createOffer } from '@/services/api';
import 'react-toastify/dist/ReactToastify.css';

interface MakeOfferModalProps {
  conversationId: string;
  otherParticipant: {
    _id: string;
    fullName: string;
    avatar?: string;
    role?: string;
  };
  onClose: () => void;
  onOfferSent?: (offer: any) => void;
}

interface OfferData {
  type: 'brand_to_creator' | 'creator_to_brand';
  service: string;
  description: string;
  price: number;
  currency: string;
  deliveryTime: number; // in days
  revisions: number;
  deliverables: string[];
  terms: string;
  validUntil: string; // ISO date string
}

const serviceTypes = [
  'Social Media Post',
  'Video Content',
  'Product Review',
  'Event Appearance',
  'Sponsored Content',
  'Custom Content',
  'Consultation',
  'Other'
];

const currencies = ['₹', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export default function MakeOfferModal({
  conversationId,
  otherParticipant,
  onClose,
  onOfferSent
}: MakeOfferModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [offerData, setOfferData] = useState<OfferData>({
    type: user?.role === 'brand' ? 'brand_to_creator' : 'creator_to_brand',
    service: '',
    description: '',
    price: 0,
    currency: '₹',
    deliveryTime: 7,
    revisions: 2,
    deliverables: [],
    terms: '',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
  });

  const [newDeliverable, setNewDeliverable] = useState('');

  const isBrand = user?.role === 'brand';
  const isCreator = user?.role === 'creator';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOfferData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'deliveryTime' || name === 'revisions' ? Number(value) : value
    }));
  };

  const handleAddDeliverable = () => {
    if (newDeliverable.trim() && !offerData.deliverables.includes(newDeliverable.trim())) {
      setOfferData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setOfferData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const requestBody = {
        conversationId,
        recipientId: otherParticipant._id,
        ...offerData
      };

      const result = await createOffer(requestBody);
      setSuccess('Offer sent successfully!');
      toast.success('Offer sent successfully!');
      
      if (onOfferSent) {
        onOfferSent(result.data);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error sending offer:', err);
      const errorMessage = err.message || 'Failed to send offer';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
              <p className="text-gray-600">Negotiate with {otherParticipant.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <select
              name="service"
              value={offerData.service}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a service type</option>
              {serviceTypes.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              name="description"
              value={offerData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe the project requirements, goals, and expectations..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={offerData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {offerData.currency}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={offerData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Time and Revisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (days) *
              </label>
              <input
                type="number"
                name="deliveryTime"
                value={offerData.deliveryTime}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Revisions
              </label>
              <input
                type="number"
                name="revisions"
                value={offerData.revisions}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliverables
            </label>
            <div className="space-y-2">
              {offerData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="flex-1">{deliverable}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Add a deliverable..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable())}
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              name="terms"
              value={offerData.terms}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional terms, conditions, or special requirements..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Offer Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Valid Until *
            </label>
            <input
              type="date"
              name="validUntil"
              value={offerData.validUntil}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Offer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 