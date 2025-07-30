export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
} 