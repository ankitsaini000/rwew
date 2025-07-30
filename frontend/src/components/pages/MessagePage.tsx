"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getConversations } from '@/services/api';
import { Conversation } from '@/types/conversation';
import ConversationItem from '@/components/messages/ConversationItem';
import ChatWindow from '@/components/chat/ChatWindow';

export default function MessagePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchConversations();
  }, [user, router]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    const conversation = conversations.find(c => c._id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              onClick={handleConversationClick}
            />
          ))
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation._id}
            otherParticipant={selectedConversation.otherUser}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
