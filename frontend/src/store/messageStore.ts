import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  subject: string;
  content: string;
  senderType: "user" | "creator";
  timestamp: number;
  isRead: boolean;
  source?: "contact" | "chat" | "checkout";
}

interface MessageState {
  messages: Message[];
  unreadCount: number;
  addMessage: (message: Omit<Message, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (messageId: string) => void;
  markAllAsReadForCreator: (creatorId: string) => void;
  deleteMessage: (messageId: string) => void;
  getMessagesForCreator: (creatorId: string) => Message[];
  setUnreadCount: (count: number) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [],
      unreadCount: 0,
      
      addMessage: (message) => {
        const newMessage: Message = {
          id: uuidv4(),
          ...message,
          timestamp: Date.now(),
          isRead: message.senderType === "user", // User's own messages are always read
        };
        
        console.log("Adding new message:", {
          id: newMessage.id,
          creatorId: newMessage.creatorId,
          subject: newMessage.subject,
          source: newMessage.source,
          senderType: newMessage.senderType
        });
        
        set((state) => ({
          messages: [...state.messages, newMessage],
          unreadCount: message.senderType === "creator" 
            ? state.unreadCount + 1 
            : state.unreadCount,
        }));
      },
      
      markAsRead: (messageId) => {
        console.log("Marking message as read:", messageId);
        
        set((state) => {
          const updatedMessages = state.messages.map((msg) => {
            if (msg.id === messageId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          
          const unreadCount = updatedMessages.filter(
            (msg) => !msg.isRead && msg.senderType === "creator"
          ).length;
          
          return { messages: updatedMessages, unreadCount };
        });
      },
      
      markAllAsReadForCreator: (creatorId) => {
        console.log("Marking all messages as read for creator:", creatorId);
        
        set((state) => {
          const updatedMessages = state.messages.map((msg) => {
            if (msg.creatorId === creatorId && !msg.isRead) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          
          const unreadCount = updatedMessages.filter(
            (msg) => !msg.isRead && msg.senderType === "creator"
          ).length;
          
          return { messages: updatedMessages, unreadCount };
        });
      },
      
      deleteMessage: (messageId) => {
        console.log("Deleting message:", messageId);
        
        set((state) => {
          const messageToDelete = state.messages.find((msg) => msg.id === messageId);
          const updatedMessages = state.messages.filter((msg) => msg.id !== messageId);
          
          const unreadCount = messageToDelete && !messageToDelete.isRead && messageToDelete.senderType === "creator"
            ? state.unreadCount - 1
            : state.unreadCount;
          
          return { messages: updatedMessages, unreadCount };
        });
      },
      
      getMessagesForCreator: (creatorId) => {
        const messages = get().messages.filter((msg) => msg.creatorId === creatorId);
        console.log(`Getting messages for creator ${creatorId}:`, messages.length);
        return messages;
      },
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        messages: state.messages,
        unreadCount: state.unreadCount
      }),
      // Debug the initial hydration
      onRehydrateStorage: () => (state) => {
        console.log("Messages store hydrated:", state?.messages?.length || 0, "messages");
      },
    }
  )
);
