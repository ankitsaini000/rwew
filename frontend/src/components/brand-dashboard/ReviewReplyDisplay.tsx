import React from 'react';
import { MessageSquare, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewReply {
  text: string;
  createdAt: string;
}

interface ReviewReplyDisplayProps {
  reply: ReviewReply;
  creatorName?: string;
  creatorAvatar?: string;
}

const ReviewReplyDisplay: React.FC<ReviewReplyDisplayProps> = ({ 
  reply, 
  creatorName = 'Creator',
  creatorAvatar 
}) => {
  if (!reply || !reply.text || reply.text.trim().length === 0) {
    return null;
  }

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        {/* Creator Avatar */}
        <div className="flex-shrink-0">
          <img
            src={creatorAvatar || '/avatars/placeholder-1.svg'}
            alt={creatorName}
            className="w-8 h-8 rounded-full border-2 border-blue-200"
          />
        </div>
        
        {/* Reply Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              {creatorName}'s Reply
            </span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Creator Response
            </span>
          </div>
          
          <div className="text-sm text-gray-800 leading-relaxed mb-2">
            {reply.text}
          </div>
          
          <div className="flex items-center text-xs text-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              Replied on {format(new Date(reply.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewReplyDisplay; 