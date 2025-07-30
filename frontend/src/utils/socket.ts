import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket) {
    return socket;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
  
  socket = io(backendUrl, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinUserRoom = (userId: string): void => {
  if (socket) {
    socket.emit('join', { userId });
  }
}; 