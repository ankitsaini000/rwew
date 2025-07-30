'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getConversations } from '@/services/api';
import { Conversation } from '@/types/conversation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ConversationItem from '@/components/messages/ConversationItem';
import ChatWindow from '@/components/chat/ChatWindow';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<{
    _id: string;
    otherParticipant: {
      _id: string;
      fullName: string;
      avatar?: string;
      username: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Track mobile view: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Switch to chat view on mobile when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setMobileView('chat');
    }
  }, [selectedConversation]);

  // If user goes back to conversation list, clear selectedConversation
  const handleBackToList = () => {
    setMobileView('list');
    setSelectedConversation(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      await fetchConversations();
    };

    checkAuth();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!searchParams) return;
    
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setSelectedConversation({
          _id: conversation._id,
          otherParticipant: {
            _id: conversation.otherUser._id,
            fullName: conversation.otherUser.fullName,
            avatar: conversation.otherUser.avatar,
            username: conversation.otherUser.username || ''
          }
        });
      }
    }
  }, [conversations, searchParams]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      // Sort conversations by lastMessage?.createdAt descending, fallback to createdAt
      const sorted = data.sort((a: Conversation, b: Conversation) => {
        const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setConversations(sorted);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation({
      _id: conversation._id,
      otherParticipant: {
        _id: conversation.otherUser._id,
        fullName: conversation.otherUser.fullName,
        avatar: conversation.otherUser.avatar,
        username: conversation.otherUser.username || ''
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Conversations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-purple-50 relative">
        {/* Conversations List */}
        <div
          className={
            `w-full md:w-1/3 border-r border-gray-200 bg-white/80 backdrop-blur-md overflow-y-auto transition-all duration-300 ` +
            `${mobileView === 'list' ? 'block' : 'hidden'} md:block`
          }
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {/* Floating Action Button (placeholder) */}
            <button
              className="ml-2 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow transition"
              title="Start new conversation"
              aria-label="Start new conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="p-2 md:p-4">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                <p className="text-gray-600">Start a conversation with a creator to see your messages here.</p>
              </div>
            ) :
              <div className="space-y-2 md:space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => {
                      setSelectedConversation({
                        _id: conversation._id,
                        otherParticipant: {
                          _id: conversation.otherUser._id,
                          fullName: conversation.otherUser.fullName,
                          avatar: conversation.otherUser.avatar,
                          username: conversation.otherUser.username || ''
                        }
                      });
                      setMobileView('chat');
                    }}
                    className={`cursor-pointer rounded-lg transition-all duration-200 ${selectedConversation?._id === conversation._id ? 'ring-2 ring-purple-400 bg-purple-50/60' : 'hover:bg-purple-50/40'}`}
                  >
                    <ConversationItem
                      conversation={conversation}
                      onClick={() => {
                        setSelectedConversation({
                          _id: conversation._id,
                          otherParticipant: {
                            _id: conversation.otherUser._id,
                            fullName: conversation.otherUser.fullName,
                            avatar: conversation.otherUser.avatar,
                            username: conversation.otherUser.username || ''
                          }
                        });
                        setMobileView('chat');
                      }}
                    />
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={
            `w-full md:flex-1 bg-gray-50/80 transition-all duration-300 ` +
            `${mobileView === 'chat' ? 'block' : 'hidden'} md:flex`
          }
        >
          {selectedConversation ? (
            <div className="h-full w-full flex flex-col">
              {/* Back button for mobile */}
              <div className="md:hidden flex items-center p-2 border-b bg-white/90 backdrop-blur-md sticky top-0 z-10">
                <button
                  onClick={handleBackToList}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  aria-label="Back to conversations"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="ml-2 font-medium text-gray-900">Chat</span>
              </div>
              <div className="flex-1 flex flex-col">
                <ChatWindow
                  conversationId={selectedConversation._id}
                  otherParticipant={selectedConversation.otherParticipant}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 animate-fade-in">
              <span className="hidden md:block">Select a conversation to start chatting</span>
              <span className="md:hidden">Select a conversation</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 