import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Document } from 'mongoose';

export interface IUserSocket {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: IUserSocket;
}

export interface MessagePayload {
  conversationId: string;
  receiverId: string;
  content?: string;
  attachments?: string[];
  type: 'text' | 'image' | 'file' | 'system';
}

export interface JoinConversationPayload {
  conversationId: string;
}

export interface MarkReadPayload {
  conversationId: string;
  messageIds?: string[];
}

export type SocketIOServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>; 