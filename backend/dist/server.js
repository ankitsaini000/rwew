"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const http_1 = __importDefault(require("http"));
const sockets_1 = require("./sockets");
/**
 * This file is now just a helper module to create server instances.
 * The actual server is now started directly from index.ts.
 *
 * This file is kept for backward compatibility and potential testing purposes.
 */
function createServer(app) {
    // Create HTTP server from Express app
    const server = http_1.default.createServer(app);
    // Initialize Socket.IO
    const io = (0, sockets_1.initializeSocketIO)(server);
    return { server, io };
}
