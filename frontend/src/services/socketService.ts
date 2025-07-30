import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  
  // Initialize the socket connection
  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }
    
    this.token = token;
    
    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    this.setupListeners();
    
    return this.socket;
  }
  
  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Get the socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
  
  // Join a conversation
  joinConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('join-conversation', { conversationId });
    }
  }
  
  // Send a message
  sendMessage(payload: {
    conversationId: string;
    receiverId: string;
    content?: string;
    attachments?: string[];
    type: 'text' | 'image' | 'file' | 'system';
  }): void {
    if (this.socket) {
      this.socket.emit('send-message', payload);
    }
  }
  
  // Mark messages as read
  markMessagesAsRead(conversationId: string, messageIds?: string[]): void {
    if (this.socket) {
      this.socket.emit('mark-read', { conversationId, messageIds });
    }
  }
  
  // Setup event listeners
  private setupListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      
      // If we were disconnected due to an error, try to reconnect
      if (reason === 'io server disconnect') {
        if (this.token) {
          this.connect(this.token);
        }
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
}

const socketService = new SocketService();
export default socketService; 