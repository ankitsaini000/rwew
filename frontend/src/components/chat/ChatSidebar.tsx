import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Archive, Trash2 } from 'lucide-react';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    avatar?: string;
  }>;
  lastMessage?: {
    content?: string;
    type: 'text' | 'image' | 'file' | 'link';
    sentAt: string;
  };
  lastMessageAt: string;
  unreadCounts: {
    [key: string]: number;
  };
}

interface ChatSidebarProps {
  onSelectConversation: (conversation: {
    _id: string;
    otherParticipant: {
      _id: string;
      fullName: string;
      avatar?: string;
    };
  }) => void;
  selectedConversationId?: string;
}

export default function ChatSidebar({ onSelectConversation, selectedConversationId }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchConversations();
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await fetch(`/api/messages/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const getUnreadCount = (counts: any, userId: string | null): number => {
    if (!counts || typeof counts !== 'object' || !userId) return 0;
    return counts[userId] || 0;
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p._id !== token);
    return otherParticipant?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(p => p._id !== token);
          if (!otherParticipant) return null;

          return (
            <div
              key={conversation._id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedConversationId === conversation._id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectConversation({
                _id: conversation._id,
                otherParticipant
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={otherParticipant.avatar || '/default-avatar.png'}
                    alt={otherParticipant.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{otherParticipant.fullName}</h3>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.type === 'text'
                          ? conversation.lastMessage.content
                          : `Sent a ${conversation.lastMessage.type}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                    </span>
                  )}
                  {getUnreadCount(conversation.unreadCounts, token) > 0 && (
                    <span className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                      {getUnreadCount(conversation.unreadCounts, token)}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(conversation._id);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Archive className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conversation._id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 