export interface Participant {
  _id: string;
  fullName: string;
  username?: string;
  avatar?: string;
  profileImage?: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  otherUser: Participant;
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
} 