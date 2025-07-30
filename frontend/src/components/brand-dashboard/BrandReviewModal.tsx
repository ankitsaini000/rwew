import React, { useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import { Order } from '@/types/order';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import API from '../../services/api';

interface BrandReviewModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onReviewSubmitted: () => void;
}

const MAX_COMMENT = 1000;

const BrandReviewModal: React.FC<BrandReviewModalProps> = ({ open, onClose, order, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await API.post('/reviews', {
        orderId: order._id,
        rating,
        comment
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRating(0);
        setComment('');
        onReviewSubmitted();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Avatar fallback
  const avatar = order.creatorImage || '/avatars/placeholder-1.svg';
  const creatorName = order.creatorName || 'Creator';
  const orderInfo = order.packageName ? `${order.packageName} • ${order.service}` : order.service;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="px-8 pt-8 pb-6 flex flex-col items-center">
          {/* Header with avatar and info */}
          <img
            src={avatar}
            alt={creatorName}
            className="w-16 h-16 rounded-full border-4 border-purple-100 shadow-md mb-2 object-cover"
          />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Leave a Review</h2>
          <div className="text-gray-600 text-sm mb-2 font-medium">for <span className="text-purple-700">{creatorName}</span></div>
          {orderInfo && <div className="text-xs text-gray-400 mb-4">{orderInfo}</div>}

          {/* Success animation */}
          {success && (
            <div className="flex flex-col items-center my-6">
              <CheckCircle className="w-16 h-16 text-green-500 animate-pop" />
              <div className="text-green-700 font-semibold mt-2">Review submitted!</div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-3 w-full text-center">
              {error}
            </div>
          )}

          {/* Review form */}
          {!success && (
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              {/* Star rating */}
              <div className="mb-4 flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors duration-150 ${
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mb-2">{rating ? `${rating} out of 5` : 'Select a rating'}</div>

              {/* Comment box */}
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 mb-2 min-h-[90px] focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all resize-none text-gray-800 bg-gray-50"
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={MAX_COMMENT}
                required
                disabled={submitting}
              />
              <div className="w-full flex justify-between text-xs text-gray-400 mb-4">
                <span>{comment.length}/{MAX_COMMENT} characters</span>
                <span className={comment.length > MAX_COMMENT - 50 ? 'text-red-400' : ''}>
                  {MAX_COMMENT - comment.length} left
                </span>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 shadow-lg transition-all"
                disabled={submitting || !rating || !comment.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}
        </div>
      </div>
      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pop {
          animation: pop 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BrandReviewModal; 