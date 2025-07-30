import express from 'express';
import http from 'http';
import { initializeSocketIO } from './sockets';
import { SocketIOServer } from './types/socket';

/**
 * This file is now just a helper module to create server instances.
 * The actual server is now started directly from index.ts.
 * 
 * This file is kept for backward compatibility and potential testing purposes.
 */

export function createServer(app: express.Application): {
  server: http.Server;
  io: SocketIOServer;
} {
  // Create HTTP server from Express app
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = initializeSocketIO(server);

  return { server, io };
}
