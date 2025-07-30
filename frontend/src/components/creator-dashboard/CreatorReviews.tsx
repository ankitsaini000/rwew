'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, Award, TrendingUp, Heart, Reply, Edit2, Trash2, Send } from 'lucide-react';
import Link from 'next/link';
import { getCreatorReviewsDirect, addReviewReply, updateReviewReply, deleteReviewReply } from '../../services/api';

interface Review {
  _id?: string;
  orderId: {
    _id: string;
    orderID: string;
    service: string;
  };
  creatorId: string;
  brandId: {
    _id: string;
    fullName: string;
    avatar?: string;
    username: string;
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

interface CreatorReviewsProps {
  creatorId: string;
  title?: string;
  showAllLink?: boolean;
  limit?: number;
  showStats?: boolean;
}

export default function CreatorReviews({ 
  creatorId, 
  title = "Client Reviews", 
  showAllLink = false, 
  limit = 3, 
  showStats = false 
}: CreatorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Reply functionality state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    console.log('[CreatorReviews] ===== COMPONENT DEBUG START =====');
    console.log('[CreatorReviews] Component mounted with props:', { creatorId, title, showAllLink, limit });
    console.log('[CreatorReviews] CreatorId type:', typeof creatorId);
    console.log('[CreatorReviews] CreatorId value:', creatorId);
    console.log('[CreatorReviews] CreatorId length:', creatorId?.length);
    console.log('[CreatorReviews] ===== COMPONENT DEBUG END =====');

    if (!creatorId) {
      console.log('[CreatorReviews] No creatorId provided, skipping fetch');
      return;
    }

    const fetchReviews = async () => {
      try {
        console.log('[CreatorReviews] Starting to fetch reviews for creatorId:', creatorId);
        setLoading(true);
        setError(null);

        const data = await getCreatorReviewsDirect(creatorId, limit);
        console.log('[CreatorReviews] API response:', data);
        console.log('[CreatorReviews] Reviews array:', data.reviews);
        console.log('[CreatorReviews] Reviews count:', data.reviews?.length || 0);
        console.log('[CreatorReviews] Average rating:', data.averageRating);
        console.log('[CreatorReviews] Total reviews:', data.totalReviews);
        console.log('[CreatorReviews] ===== DEBUG END =====');
        
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (err) {
        console.error('[CreatorReviews] Error fetching reviews:', err);
        setError('Failed to load reviews');
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        console.log('[CreatorReviews] Setting loading to false');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [creatorId, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 border-green-200';
    if (rating >= 4.0) return 'bg-blue-50 border-blue-200';
    if (rating >= 3.5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-orange-50 border-orange-200';
  };

  // Reply handling functions
  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      let response;
      if (editingReply === reviewId) {
        response = await updateReviewReply(reviewId, replyText);
      } else {
        response = await addReviewReply(reviewId, replyText);
      }
      
      // Update the reviews state with the new reply
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { ...review, reply: response.review.reply }
            : review
        )
      );
      
      setReplyText('');
      setReplyingTo(null);
      setEditingReply(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReplyDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    
    setSubmittingReply(true);
    try {
      await deleteReviewReply(reviewId);
      
      // Update the reviews state to remove the reply completely
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { ...review, reply: undefined }
            : review
        )
      );
    } catch (error) {
      console.error('Error deleting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const startReply = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText('');
    setEditingReply(null);
  };

  const startEditReply = (reviewId: string, currentReply: string) => {
    setEditingReply(reviewId);
    setReplyText(currentReply);
    setReplyingTo(reviewId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText('');
  };

  const displayReviews = reviews;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin h-8 w-8 border-3 border-purple-600 rounded-full border-t-transparent"></div>
            <p className="text-gray-500 font-medium">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-700 font-medium mb-2">Unable to load reviews</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Star className="w-10 h-10 text-purple-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600 mb-4">Reviews from completed orders will appear here</p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium">Start building your reputation!</span>
          </div>
          
          {/* Debug info - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left max-w-md mx-auto">
              <p className="text-xs font-medium text-gray-700 mb-2">Debug Info:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>CreatorId: {creatorId}</p>
                <p>CreatorId type: {typeof creatorId}</p>
                <p>CreatorId length: {creatorId?.length}</p>
                <p>Loading: {loading.toString()}</p>
                <p>Error: {error || 'None'}</p>
                <p>Reviews count: {reviews.length}</p>
                <p>Average rating: {averageRating}</p>
                <p>Total reviews: {totalReviews}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Stats Section */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReviews > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / totalReviews) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= averageRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-lg font-bold ${getRatingColor(averageRating)}`}>
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Heart className="w-4 h-4" />
                <span className="font-medium">{totalReviews}</span>
                <span className="text-sm">reviews</span>
              </div>
            </div>
          </div>
        </div>
        {showAllLink && reviews.length > limit && (
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            View All
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayReviews.map((review, index) => (
          <div
            key={review._id || index}
            className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
              getRatingBg(review.rating)
            }`}
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.brandId?.fullName || review.brandId?.username || 'Anonymous Client'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Order #{review.orderId?.orderID || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`font-bold text-sm ${getRatingColor(review.rating)}`}>
                  {review.rating}/5
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed text-sm">
                "{review.comment}"
              </p>
            </div>

            {/* Reply Section */}
            {review.reply && review.reply.text && review.reply.text.trim().length > 0 && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <Reply className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-900">Your Reply</p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditReply(review._id!, review.reply!.text)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                          disabled={submittingReply}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleReplyDelete(review._id!)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          disabled={submittingReply}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      "{review.reply.text}"
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      {formatDate(review.reply.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === review._id && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-purple-100 rounded-full">
                    <Reply className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-2">
                      {editingReply === review._id ? 'Edit Reply' : 'Write a Reply'}
                    </p>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Thank your client for their feedback..."
                      className="w-full p-3 border border-purple-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {replyText.length}/1000 characters
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={cancelReply}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={submittingReply}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(review._id!)}
                          disabled={!replyText.trim() || submittingReply}
                          className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {submittingReply ? (
                            <>
                              <div className="animate-spin h-3 w-3 border border-white rounded-full border-t-transparent"></div>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>{editingReply === review._id ? 'Update' : 'Send'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Button */}
            {(!review.reply || !review.reply.text || review.reply.text.trim().length === 0) && replyingTo !== review._id && (
              <div className="mb-4">
                <button
                  onClick={() => startReply(review._id!)}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                  disabled={submittingReply}
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply to this review</span>
                </button>
              </div>
            )}

            {/* Review Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                  {review.orderId?.service || 'Service'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Section */}
      {limit && reviews.length > limit && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="w-full py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:shadow-md">
            View {reviews.length - limit} more reviews
          </button>
        </div>
      )}
    </div>
  );
} 