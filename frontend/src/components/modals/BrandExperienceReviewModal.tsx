import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { submitBrandExperienceReview } from '../../services/api';

interface BrandExperienceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSubmitted?: () => void;
}

const BrandExperienceReviewModal: React.FC<BrandExperienceReviewModalProps> = ({ isOpen, onClose, orderId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitBrandExperienceReview(orderId, rating, comment);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRating(0);
        setComment('');
        onClose();
        if (onSubmitted) onSubmitted();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Rate Your Experience</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="p-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">How was your experience with this brand?</label>
            <div className="flex items-center space-x-1 mb-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star className={`w-7 h-7 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">{rating ? `${rating} out of 5` : 'Select a rating'}</div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Comments (optional)</label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[80px]"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={1000}
              placeholder="Share your experience with the brand..."
            />
          </div>
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          {success && <div className="text-green-600 mb-2 text-sm">Thank you for your feedback!</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BrandExperienceReviewModal; 