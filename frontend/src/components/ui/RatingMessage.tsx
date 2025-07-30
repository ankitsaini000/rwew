import React from 'react';
import { Star, TrendingUp, Award, ThumbsUp, Heart } from 'lucide-react';

interface RatingMessageProps {
  rating: number;
  reviewCount: number;
  title?: string;
  variant?: 'creator' | 'brand';
  showIcon?: boolean;
  className?: string;
}

export const RatingMessage: React.FC<RatingMessageProps> = ({
  rating,
  reviewCount,
  title,
  variant = 'creator',
  showIcon = true,
  className = ''
}) => {
  const getRatingMessage = (rating: number, variant: 'creator' | 'brand') => {
    if (rating >= 4.8) {
      return variant === 'creator' 
        ? "Exceptional Creator! Consistently delivers outstanding work"
        : "Excellent Brand! Great to work with";
    } else if (rating >= 4.5) {
      return variant === 'creator'
        ? "Excellent Creator! Highly recommended for quality work"
        : "Great Brand! Reliable and professional";
    } else if (rating >= 4.0) {
      return variant === 'creator'
        ? "Very Good Creator! Delivers quality results"
        : "Good Brand! Professional and trustworthy";
    } else if (rating >= 3.5) {
      return variant === 'creator'
        ? "Good Creator! Satisfactory work quality"
        : "Fair Brand! Generally positive experience";
    } else if (rating >= 3.0) {
      return variant === 'creator'
        ? "Average Creator! Room for improvement"
        : "Average Brand! Mixed experiences";
    } else {
      return variant === 'creator'
        ? "Needs improvement in service quality"
        : "Below average experience";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (rating >= 4.5) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (rating >= 3.0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4.8) return <Award className="w-5 h-5" />;
    if (rating >= 4.5) return <TrendingUp className="w-5 h-5" />;
    if (rating >= 4.0) return <ThumbsUp className="w-5 h-5" />;
    if (rating >= 3.5) return <Star className="w-5 h-5" />;
    if (rating >= 3.0) return <Heart className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const getRatingLevel = (rating: number) => {
    if (rating >= 4.8) return 'Exceptional';
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    return 'Below Average';
  };

  const ratingColor = getRatingColor(rating);
  const ratingMessage = getRatingMessage(rating, variant);
  const ratingLevel = getRatingLevel(rating);
  const icon = getRatingIcon(rating);

  return (
    <div className={`p-4 rounded-lg border ${ratingColor} ${className}`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg">
              {title || `${variant === 'creator' ? 'Creator' : 'Brand'} Rating`}
            </h3>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-white/80">
              {ratingLevel}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xl font-bold">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <p className="text-sm leading-relaxed">
            {ratingMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RatingMessage; 