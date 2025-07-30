import React from 'react';
import { Participant, Conversation } from '@/types/conversation';

interface ConversationItemProps {
  conversation: Pick<Conversation, '_id' | 'otherUser' | 'lastMessage'>;
  onClick: (conversationId: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  if (!conversation?.otherUser) {
    return null;
  }
  const otherParticipant = conversation.otherUser;
  const isUnread = conversation.lastMessage?.isRead === false;
  // Placeholder: Assume online if avatar exists (replace with real status if available)
  const isOnline = !!otherParticipant.avatar;

  return (
    <div
      onClick={() => onClick(conversation._id)}
      className={`flex items-center space-x-3 p-3 md:p-4 hover:bg-purple-50/40 cursor-pointer border-b border-gray-100 rounded-lg transition-all duration-200 relative group ${isUnread ? 'bg-purple-50/60' : ''}`}
    >
      <div className="relative">
        {otherParticipant.avatar && String(otherParticipant.avatar).trim() ? (
          <img
            src={String(otherParticipant.avatar)}
            alt={otherParticipant.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold text-xl border-2 border-purple-200">
            {otherParticipant.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Online status dot */}
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1">
            {otherParticipant.fullName}
            {otherParticipant.username && (
              <span className="ml-1 text-gray-500 text-xs font-normal">
                @{otherParticipant.username}
              </span>
            )}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-400 font-medium ml-2 whitespace-nowrap">
              {formatDate(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <div className="flex items-center gap-2 mt-0.5">
            {isUnread && <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Unread"></span>}
            <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{conversation.lastMessage.content}</p>
          </div>
        )}
      </div>
    </div>
  );
} 