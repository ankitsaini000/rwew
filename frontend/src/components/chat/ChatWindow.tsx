import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send, Paperclip, Image, File, UserCircle2, DollarSign } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { getConversationMessages, sendMessage, sendMessageToCreator, markMessagesAsRead, getOffersByConversation } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useMessageStore } from '../../store/messageStore';
import MakeOfferModal from '../modals/MakeOfferModal';
import OfferMessage from '../messages/OfferMessage';

interface Message {
  _id: string;
  conversation: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  type: 'text' | 'image' | 'file' | 'link';
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  sentAt: string;
  isRead: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  otherParticipant: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
}

export default function ChatWindow({ conversationId, otherParticipant }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const { setUnreadCount } = useMessageStore();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Infer other participant's role if missing
  let otherRole = (otherParticipant as any).role;
  if (!otherRole && user?.role) {
    otherRole = user.role === 'brand' ? 'creator' : user.role === 'creator' ? 'brand' : undefined;
  }

  // Fetch messages and offers when conversation changes
  useEffect(() => {
    fetchMessages();
    fetchOffers();
  }, [conversationId]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      markMessagesAsReadOnOpen();
    }
  }, [conversationId, user]);

  // Socket event handling
  useEffect(() => {
    if (socket) {
      // Join the conversation room
      socket.emit('join_conversation', conversationId);
      console.log('Joined conversation room:', conversationId);

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        console.log('Received new message:', message);
        if (message.conversation === conversationId) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m._id === message._id);
            if (exists) return prev;
            return [...prev, message];
          });
          scrollToBottom();
          
          // Mark new messages as read if they're from the other participant
          if (message.sender._id !== user?._id) {
            markMessagesAsReadOnOpen();
          }
        }
      });

      // Listen for message read status updates
      socket.on('message_read', ({ messageIds, conversationId: msgConversationId, userId: readByUserId }) => {
        if (msgConversationId === conversationId) {
          console.log('Messages marked as read by:', readByUserId, 'Message IDs:', messageIds);
          
          // Update message read status in local state
          setMessages(prev => 
            prev.map(msg => {
              if (messageIds.includes(msg._id)) {
                return { ...msg, isRead: true };
              }
              return msg;
            })
          );
        }
      });

      // Listen for typing status
      socket.on('typing', ({ userId, isTyping }) => {
        if (userId === otherParticipant._id) {
          setIsTyping(isTyping);
        }
      });

      // Listen for conversation updates
      socket.on('conversation_update', (updatedConversation) => {
        if (updatedConversation._id === conversationId) {
          // Only update the last message if it's not already in our messages
          setMessages(prev => {
            const lastMessage = updatedConversation.lastMessage;
            if (!lastMessage) return prev;
            
            const exists = prev.some(m => m._id === lastMessage._id);
            if (exists) return prev;
            
            return [...prev, lastMessage];
          });
        }
      });

      // Listen for new offers
      socket.on('new_offer', (offer) => {
        if (offer.conversationId === conversationId) {
          setOffers(prev => {
            const exists = prev.some(o => o._id === offer._id);
            if (exists) return prev;
            return [...prev, offer];
          });
        }
      });

      // Listen for offer updates
      socket.on('offer_updated', (offer) => {
        if (offer.conversationId === conversationId) {
          setOffers(prev => 
            prev.map(o => o._id === offer._id ? offer : o)
          );
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', conversationId);
        socket.off('new_message');
        socket.off('message_read');
        socket.off('typing');
        socket.off('conversation_update');
        socket.off('new_offer');
        socket.off('offer_updated');
      }
    };
  }, [conversationId, socket, otherParticipant._id, user?._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getConversationMessages(conversationId);
      console.log('Fetched messages:', data);
      
      // Only set messages if we don't have any yet
      if (messages.length === 0) {
        setMessages(data);
      } else {
        // Check for new messages and append only those that don't exist
        setMessages(prev => {
          const newMessages = data.filter((newMsg: Message) => 
            !prev.some(existingMsg => existingMsg._id === newMsg._id)
          );
          return [...prev, ...newMessages];
        });
      }
      
      setHasMore(data.length === 20);
      
      // Mark messages as read when chat window is opened
      await markMessagesAsReadOnOpen();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await getOffersByConversation(conversationId);
      if (response.data) {
        setOffers(response.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const handleOfferUpdate = (offerId: string, newStatus: string, message?: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer._id === offerId ? { ...offer, status: newStatus } : offer
      )
    );
    
    // If there's a message to display, show it in the chat input
    if (message) {
      setNewMessage(message);
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
      // Fetch unread count and update store
      const token = localStorage.getItem('token');
      if (token) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const conversations = await res.json();
          const convos = Array.isArray(conversations) ? conversations : conversations.data || [];
          const totalUnread = convos.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !file) return;
    if (!otherParticipant?._id) {
      console.error('Recipient ID is missing');
      return;
    }
    setIsUploading(true);
    try {
      let sentMessage;
      
      if (file) {
        // Handle file upload
        sentMessage = await sendMessageToCreator({
          receiverId: otherParticipant._id,
          content: newMessage.trim() || (file.type.startsWith('image/') ? 'Shared an image' : 'Shared a file'),
          attachments: [file]
        });
      } else {
        // Handle text-only message
        sentMessage = await sendMessage(otherParticipant._id, newMessage.trim());
      }
      
      console.log('Message sent:', sentMessage);
      
      // Add the sent message to the local state
      if (sentMessage) {
        const newMessageObj: Message = {
          _id: sentMessage._id,
          conversation: conversationId,
          content: newMessage.trim() || (file ? (file.type.startsWith('image/') ? 'Shared an image' : 'Shared a file') : ''),
          type: file ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text',
          fileUrl: sentMessage.fileUrl,
          fileName: file?.name,
          fileType: file?.type,
          sender: {
            _id: user?._id || '',
            fullName: user?.fullName || '',
            avatar: user?.avatar
          },
          sentAt: new Date().toISOString(),
          isRead: false
        };

        // Update local state
        setMessages(prev => [...prev, newMessageObj]);
        scrollToBottom();

        // Emit message sent event
        if (socket) {
          socket.emit('message_sent', {
            messageId: sentMessage._id,
            conversationId,
            receiverId: otherParticipant._id,
            message: newMessageObj // Send the complete message object
          });
        }
      }
      
      setNewMessage('');
      setFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update input to handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleViewProfile = () => {
    const username = (otherParticipant as any).username;
    if (username) {
      if (otherRole === 'brand') {
        router.push(`/brand/${username}`);
      } else if (otherRole === 'creator') {
        router.push(`/creator/${username}`);
      }
    } else {
      alert('No username found for this user!');
    }
  };

  // Debug: Log role and username
  console.log('otherRole:', otherRole, 'username:', (otherParticipant as any).username, 'otherParticipant:', otherParticipant);

  useEffect(() => {
    // Set isMobile based on window width
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Modal for file preview (mobile only)
  const FilePreviewModal = () => {
    if (!file || !isMobile) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-[90vw] w-full max-w-sm relative">
          <button
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
          {filePreview && file.type.startsWith('image/') ? (
            <img
              src={filePreview}
              alt="Preview"
              className="rounded-lg w-full max-h-80 object-contain mb-3"
            />
          ) : (
            <span className="block text-gray-800 text-center text-sm font-medium mb-3">{file.name}</span>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleRemoveFile}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Inline file preview for desktop (not mobile)
  const InlineFilePreview = () => {
    if (!file || isMobile) return null;
    return (
      <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-200 max-w-xs ml-2">
        <span className="text-xs text-gray-700 max-w-[100px] truncate block">{file.name}</span>
        <button
          type="button"
          onClick={handleRemoveFile}
          className="text-red-500 hover:text-red-700 text-lg font-bold"
          aria-label="Remove file"
        >
          &times;
        </button>
        <button
          type="button"
          onClick={handleSend}
          className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
        >
          Send
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="flex-1 p-4">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white" style={{ height: '100vh', maxHeight: '100vh' }}>
      {/* File Preview Modal (mobile only) */}
      {file && <FilePreviewModal />}
      {/* Fixed Header with participant info */}
      <div className="flex-shrink-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        {otherParticipant.avatar && String(otherParticipant.avatar).trim() ? (
          <img
            src={String(otherParticipant.avatar)}
            alt={otherParticipant.fullName}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold text-lg border-2 border-purple-200">
            {otherParticipant.fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 leading-tight flex items-center gap-2">
            <span className="text-sm md:text-base lg:text-lg">{otherParticipant.fullName}</span>
            {/* Role label */}
            {otherRole && (
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${otherRole === 'creator' ? 'bg-purple-100 text-purple-700' : otherRole === 'brand' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {otherRole === 'creator' ? 'Creator' : otherRole === 'brand' ? 'Brand' : 'User'}
              </span>
            )}
            {/* {((otherParticipant as any).username) && (
              <div className="text-xs text-gray-500">@{((otherParticipant as any).username.slice(0, 3))}...</div>
            )} */}
          </div>
        </div>
        {/* Move View Profile button to the far right */}
        <button
          onClick={handleViewProfile}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-md hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs md:text-sm md:px-5 md:py-2 md:gap-2"
          type="button"
        >
          <UserCircle2 className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden xs:inline md:inline">View Profile</span>
          <span className="inline md:hidden">Profile</span>
        </button>
      </div>
      {/* Messages and Offers */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 py-4 space-y-2 bg-gradient-to-br from-white to-purple-50">
        {/* Combine messages and offers and sort by creation time */}
        {[...messages, ...offers.map(offer => ({
          _id: offer._id,
          type: 'offer' as const,
          content: '',
          sender: offer.senderId,
          sentAt: offer.createdAt,
          isRead: true,
          offer: offer,
          fileUrl: undefined
        }))].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()).map((item) => (
          <div
            key={item._id}
            className={`flex ${item.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
          >
            {item.type === 'offer' ? (
              <OfferMessage
                offer={item.offer}
                isSent={item.sender._id === user?._id}
                currentUserId={user?._id || ''}
                onOfferUpdate={handleOfferUpdate}
              />
            ) : (
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md text-sm break-words transition-all duration-200
                  ${item.sender._id === user?._id
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'}
                `}
              >
                {item.type === 'image' && item.fileUrl ? (
                  <img
                    src={item.fileUrl}
                    alt={item.content || 'Shared image'}
                    className="rounded-lg shadow-sm w-full max-w-[90vw] sm:max-w-xs max-h-60 object-contain mb-1"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                ) : null}
                <div>{item.content}</div>
                <div className="text-[10px] text-gray-300 text-right mt-1">
                  {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 pl-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="text-xs text-gray-500">Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center gap-2 sticky bottom-0">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex w-full gap-1 items-center">
          {/* File upload button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="attachment-btn flex items-center justify-center px-2 py-2 sm:px-3 sm:py-3 rounded-full bg-transparent transition"
            title="Attach file"
            disabled={isUploading}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-purple-100">
              <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </span>
          </button>
          {/* Inline File Preview (desktop only, next to attachment) */}
          {file && <InlineFilePreview />}
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 shadow-sm"
            disabled={isUploading}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSend(); } }}
          />
          {/* Make Offer Button - Show for both brands and creators */}
          {(user?.role === 'brand' || user?.role === 'creator') && (
            <button
              type="button"
              onClick={() => setShowOfferModal(true)}
              className="make-offer-btn flex items-center justify-center px-2 py-2 sm:px-3 sm:py-3 rounded-full bg-transparent transition"
              title="Make an offer"
              disabled={isUploading}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </span>
            </button>
          )}
          <button
            type="submit"
            disabled={isUploading || (!newMessage.trim() && !file)}
            className="send-btn flex items-center justify-center px-2 py-2 sm:px-3 sm:py-3 rounded-full bg-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
            ) : (
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 hover:bg-purple-700">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="sendGradient" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#E0A6F7"/>
                      <stop offset="1" stopColor="#6B6BFA"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 5L55 30L10 55V35H35V25H10V5Z"
                    fill="url(#sendGradient)"
                  />
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>
      
      {/* Make Offer Modal */}
      {showOfferModal && (
        <MakeOfferModal
          conversationId={conversationId}
          otherParticipant={otherParticipant}
          onClose={() => setShowOfferModal(false)}
          onOfferSent={(offer) => {
            console.log('Offer sent:', offer);
            // Refresh offers to show the new one
            fetchOffers();
            // Optionally send a message about the offer
            if (offer) {
              const offerMessage = `💰 I've sent you an offer for ${offer.service} at ${offer.currency} ${offer.price}. Please review and respond!`;
              setNewMessage(offerMessage);
            }
          }}
        />
      )}
    </div>
  );
} 