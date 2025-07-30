export interface Notification {
  _id: string;
  user: string;
  type: 'message' | 'like' | 'order' | 'promotion' | 'quote_request';
  message: string;
  fromUser?: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  conversationId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
} 