"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Clock, User, Search, Filter, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import API from '../../services/api';
import ReviewReplyDisplay from './ReviewReplyDisplay';
import BrandReviewUpdateModal from './BrandReviewUpdateModal';

interface Review {
  _id: string;
  orderId: {
    _id: string;
    orderID: string;
    service: string;
    packageName?: string;
  };
  creatorId: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  reply?: {
    text: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BrandReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showReviewUpdateModal, setShowReviewUpdateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get('/reviews/brand');
      console.log('Brand reviews response:', response);
      
      if (response.data && response.data.success) {
        setReviews(response.data.data || []);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err?.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewUpdate = () => {
    fetchReviews();
    setShowReviewUpdateModal(false);
    setSelectedReview(null);
  };

  const filteredReviews = reviews.filter(review => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const creatorName = review.creatorId.fullName?.toLowerCase() || '';
      const creatorUsername = review.creatorId.username?.toLowerCase() || '';
      const service = review.orderId.service?.toLowerCase() || '';
      const comment = review.comment?.toLowerCase() || '';
      
      if (!creatorName.includes(query) && 
          !creatorUsername.includes(query) && 
          !service.includes(query) && 
          !comment.includes(query)) {
        return false;
      }
    }

    // Rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      if (review.rating !== rating) {
        return false;
      }
    }

    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' 
        ? a.rating - b.rating 
        : b.rating - a.rating;
    }
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="ml-3 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-10 text-red-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Reviews</h2>
          <p className="text-gray-600">Reviews you've given to creators</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-2xl font-bold text-purple-600">{reviews.length}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by creator, service, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
          />
        </div>
        
        <div className="relative">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-purple-500 text-sm"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="relative">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'rating', 'asc' | 'desc'];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-purple-500 text-sm"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-3" />
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={review.creatorId.avatar || '/avatars/placeholder-1.svg'}
                    alt={review.creatorId.fullName}
                    className="w-12 h-12 rounded-full border-2 border-purple-200"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.creatorId.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{review.creatorId.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {review.orderId.service} • {review.orderId.packageName || 'Custom Package'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          review.rating >= star 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRatingColor(review.rating)}`}>
                    {getRatingText(review.rating)}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed">{review.comment}</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    Reviewed on {format(new Date(review.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                  </span>
                  {review.updatedAt !== review.createdAt && (
                    <span className="ml-2">
                      (Updated {format(new Date(review.updatedAt), 'MMM d, yyyy')})
                    </span>
                  )}
                </div>
              </div>

              {/* Creator Reply */}
              {review.reply && (
                <ReviewReplyDisplay
                  reply={review.reply}
                  creatorName={review.creatorId.fullName}
                  creatorAvatar={review.creatorId.avatar}
                />
              )}

              {/* Actions */}
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setShowReviewUpdateModal(true);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  Edit Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Update Modal */}
      {showReviewUpdateModal && selectedReview && (
        <BrandReviewUpdateModal
          open={showReviewUpdateModal}
          onClose={() => {
            setShowReviewUpdateModal(false);
            setSelectedReview(null);
          }}
          order={{
            _id: selectedReview.orderId._id,
            orderID: selectedReview.orderId.orderID,
            service: selectedReview.orderId.service,
            packageName: selectedReview.orderId.packageName,
            creatorName: selectedReview.creatorId.fullName,
            creatorImage: selectedReview.creatorId.avatar,
            creatorUsername: selectedReview.creatorId.username,
            status: 'completed',
            totalAmount: 0,
            createdAt: selectedReview.createdAt,
            updatedAt: selectedReview.updatedAt,
            paymentStatus: 'paid',
            deliveryDate: selectedReview.createdAt,
            currency: 'INR',
            platform: '',
            creatorId: {
              _id: selectedReview.creatorId._id,
              creatorName: selectedReview.creatorId.fullName,
              creatorEmail: '',
              creatorImage: selectedReview.creatorId.avatar,
              creatorUsername: selectedReview.creatorId.username
            },
            submittedWork: undefined,
            clientFeedback: undefined,
            statusHistory: []
          }}
          existingReview={selectedReview}
          onReviewUpdated={handleReviewUpdate}
        />
      )}
    </div>
  );
} 