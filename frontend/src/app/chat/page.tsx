'use client';

import React, { useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/context/AuthContext';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<{
    _id: string;
    otherParticipant: {
      _id: string;
      fullName: string;
      avatar?: string;
    };
  } | null>(null);
  const { token } = useAuth();

  if (!token) {
    return <div className="flex-1 p-4">Please log in to access chat.</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-200">
        <ChatSidebar
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?._id}
        />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation._id}
            otherParticipant={selectedConversation.otherParticipant}
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