"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketIO = initializeSocketIO;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const authMiddleware_1 = require("./middleware/authMiddleware");
const messageHandler_1 = __importDefault(require("./handlers/messageHandler"));
let io;
function initializeSocketIO(server) {
    if (io) {
        console.log('Socket.IO already initialized');
        return io;
    }
    console.log('Initializing Socket.IO...');
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // In production, you may want to enable more options
        // transports: ['websocket', 'polling'],
        // pingTimeout: 60000,
    });
    // Apply authentication middleware to all socket connections
    io.use(authMiddleware_1.socketAuth);
    // Handle socket connections
    io.on('connection', (socket) => {
        var _a;
        console.log(`User connected: ${((_a = socket.user) === null || _a === void 0 ? void 0 : _a._id) || 'unknown'}`);
        // Set up message handlers for this socket
        (0, messageHandler_1.default)(io, socket);
        // Handle disconnect
        socket.on('disconnect', () => {
            var _a;
            console.log(`User disconnected: ${((_a = socket.user) === null || _a === void 0 ? void 0 : _a._id) || 'unknown'}`);
        });
    });
    console.log('Socket.IO initialized successfully');
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
}
