const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const redisService = require('./redis.service');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connections = new Map();
    this.rooms = new Map();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server, options = {}) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true
      },
      transports: ['websocket', 'polling'],
      ...options
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('✅ WebSocket service initialized');
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.user = decoded;
        
        // Store connection
        this.connections.set(socket.userId, socket.id);
        
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user's personal room
      socket.join(`user:${socket.userId}`);
      
      // Real-time notifications
      socket.on('subscribe:notifications', () => {
        socket.join(`notifications:${socket.userId}`);
      });
      
      // Product verification updates
      socket.on('subscribe:verification', (data) => {
        const { productId } = data;
        socket.join(`verification:${productId}`);
      });
      
      // Certificate updates
      socket.on('subscribe:certificate', (data) => {
        const { certificateId } = data;
        socket.join(`certificate:${certificateId}`);
      });
      
      // NFT marketplace updates
      socket.on('subscribe:marketplace', () => {
        socket.join('marketplace:updates');
      });
      
      // Live auction room
      socket.on('join:auction', (data) => {
        const { auctionId } = data;
        socket.join(`auction:${auctionId}`);
        
        // Notify others in the auction
        socket.to(`auction:${auctionId}`).emit('user:joined', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });
      
      // Chat functionality
      socket.on('send:message', async (data) => {
        const { roomId, message } = data;
        
        // Store message in Redis for history
        await redisService.addToList(`chat:${roomId}`, JSON.stringify({
          userId: socket.userId,
          message,
          timestamp: new Date()
        }));
        
        // Broadcast to room
        this.io.to(roomId).emit('receive:message', {
          userId: socket.userId,
          message,
          timestamp: new Date()
        });
      });
      
      // Real-time collaboration
      socket.on('update:document', (data) => {
        const { documentId, changes } = data;
        
        // Broadcast changes to all collaborators
        socket.to(`document:${documentId}`).emit('document:changed', {
          userId: socket.userId,
          changes,
          timestamp: new Date()
        });
      });
      
      // Typing indicators
      socket.on('typing:start', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('user:typing', {
          userId: socket.userId
        });
      });
      
      socket.on('typing:stop', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('user:stopped:typing', {
          userId: socket.userId
        });
      });
      
      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connections.delete(socket.userId);
        
        // Notify rooms about disconnection
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room.startsWith('auction:')) {
            socket.to(room).emit('user:left', {
              userId: socket.userId,
              timestamp: new Date()
            });
          }
        });
      });
    });
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId, event, data) {
    const socketId = this.connections.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Send notification to room
   */
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Get connected users count
   */
  getConnectionsCount() {
    return this.connections.size;
  }

  /**
   * Get room members
   */
  async getRoomMembers(room) {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(socket => ({
      socketId: socket.id,
      userId: socket.userId
    }));
  }

  /**
   * Emit real-time analytics
   */
  emitAnalytics(data) {
    this.io.to('analytics:dashboard').emit('analytics:update', data);
  }

  /**
   * Emit blockchain events
   */
  emitBlockchainEvent(event, data) {
    this.io.to('blockchain:events').emit(`blockchain:${event}`, data);
  }

  /**
   * Close WebSocket server
   */
  close() {
    if (this.io) {
      this.io.close();
      console.log('WebSocket server closed');
    }
  }
}

module.exports = new WebSocketService();