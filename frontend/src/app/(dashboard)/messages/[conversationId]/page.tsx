"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getConversationMessages, sendMessage, markMessagesAsRead } from '@/services/api';
import { Message } from '@/types/message';
import { Participant } from '@/types/conversation';
import Link from 'next/link';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.conversationId;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/messages');
      return;
    }

    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 15000); // Poll every 15 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, conversationId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      setError(null);
      
      console.log(`Fetching messages for conversation: ${conversationId}`);
      const data = await getConversationMessages(conversationId);
      
      if (data) {
        console.log('Messages fetched successfully:', data);
        
        // If API returns both messages and participants
        if (data.messages) {
          setMessages(data.messages);
          
          // Find the other participant
          if (data.participants && user) {
            const other = data.participants.find((p: Participant) => p._id !== user._id);
            if (other) {
              setOtherParticipant(other);
            }
          }
        } else {
          // If API just returns messages array
          setMessages(data);
          
          // Try to get other participant from first message
          if (data.length > 0 && user) {
            const firstMsg = data[0];
            const otherUserId = firstMsg.senderId === user._id ? firstMsg.receiverId : firstMsg.senderId;
            
            // For demo purposes, create a basic participant
            setOtherParticipant({
              _id: otherUserId,
              fullName: `User ${otherUserId.substring(0, 5)}`,
            });
          }
        }
        
        // Mark messages as read
        try {
          await markMessagesAsRead(conversationId);
        } catch (readError) {
          console.error('Error marking messages as read:', readError);
        }
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      if (showLoading) {
        setError('Failed to load messages. Please try again later.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !otherParticipant) return;

    try {
      setSending(true);
      await sendMessage(otherParticipant._id, newMessage);
      setNewMessage('');
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMessages()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard/messages" className="mr-3 text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            {otherParticipant && (
              <div className="flex items-center">
                {otherParticipant.avatar ? (
                  <img 
                    src={otherParticipant.avatar} 
                    alt={otherParticipant.fullName} 
                    className="h-8 w-8 rounded-full object-cover mr-2"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-medium text-lg mr-2">
                    {otherParticipant.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-lg font-semibold text-white">
                  {otherParticipant.fullName}
                  {otherParticipant.username && (
                    <span className="ml-1 text-gray-200 text-sm">
                      @{otherParticipant.username}
                    </span>
                  )}
                </h1>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === user?._id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 