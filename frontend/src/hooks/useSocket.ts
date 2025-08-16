import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Get socket URL from environment or use fallback
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://rwew.onrender.com';
    
    console.log('Connecting to socket server:', socketUrl);

    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    // Handle connection events
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      
      // Log additional error details
      if (error.message.includes('CORS')) {
        console.error('🔒 CORS error detected. Check backend CORS configuration.');
      }
      if (error.message.includes('TransportError')) {
        console.error('🚗 Transport error. Check network connectivity and server status.');
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socketRef.current.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error.message);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return socketRef.current;
}