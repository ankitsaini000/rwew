import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getConversationMessages, sendMessage, markMessagesAsRead } from '@/services/api';
import MessageItem from './MessageItem';
import { Message } from '@/types/message';
import { Participant } from '@/types/conversation';

interface ChatWindowProps {
  conversationId: string;
  otherParticipant: Participant;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, otherParticipant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [conversationId]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      markMessagesAsReadOnOpen();
    }
  }, [conversationId, user]);

  const fetchMessages = async () => {
    try {
      const data = await getConversationMessages(conversationId);
      if (data) {
        setMessages(data);
        // Mark messages as read after fetching
        await markMessagesAsReadOnOpen();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to mark messages as read when chat window is opened
  const markMessagesAsReadOnOpen = async () => {
    try {
      console.log('Marking messages as read for conversation:', conversationId);
      const result = await markMessagesAsRead(conversationId);
      console.log('Messages marked as read:', result);
      
      // Update local message states to reflect read status
      setMessages(prev => 
        prev.map(msg => 
          msg.sender._id !== user?._id ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      await sendMessage(otherParticipant._id, newMessage);
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <img
            src={otherParticipant.avatar || '/avatars/placeholder-1.svg'}
            alt={otherParticipant.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{otherParticipant.fullName}</h2>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            content={message.content}
            timestamp={message.sentAt}
            isSent={message.sender._id === user?._id}
            isRead={message.isRead}
            readAt={message.readAt}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 