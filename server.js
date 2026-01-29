const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const hostname = 'localhost';
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || 3001; // Dedicated port for Socket.IO
const NEXTJS_PORT = process.env.PORT || 3000; // Next.js app will run on this port

const expressApp = express();
const server = http.createServer(expressApp);
const NEXTJS_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_VERCEL_URL
  : `http://${hostname}:${NEXTJS_PORT}`;

const io = new Server(server, {
  cors: {
    origin: [NEXTJS_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const userSocketMap = new Map(); // Store userId -> socketId

expressApp.use(express.json());

// Custom endpoint for Next.js API routes to trigger Socket.IO emissions
expressApp.post('/socket-emit', (req, res) => {
  const { event, room, data, recipientSocketId, recipientUserId } = req.body;
  if (!event) {
    return res.status(400).json({ message: 'Event name is required.' });
  }

  if (room) {
    io.to(room).emit(event, data);
    console.log(`Socket.IO emitted '${event}' to room '${room}' with data:`, data);
  } else if (recipientSocketId) {
    io.to(recipientSocketId).emit(event, data);
    console.log(`Socket.IO emitted '${event}' to recipient '${recipientSocketId}' with data:`, data);
  } else if (recipientUserId) {
    const targetSocketId = userSocketMap.get(recipientUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit(event, data);
      console.log(`Socket.IO emitted '${event}' to user '${recipientUserId}' (socket: ${targetSocketId}) with data:`, data);
    } else {
      console.log(`User '${recipientUserId}' not connected, cannot emit '${event}'.`);
    }
  }
  else {
    io.emit(event, data);
    console.log(`Socket.IO emitted '${event}' to all clients with data:`, data);
  }
  res.status(200).json({ message: 'Event emitted.' });
});

io.on('connection', (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);

  socket.on('authenticateUser', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}. Map size: ${userSocketMap.size}`);
  });

  socket.on('joinAuctionRoom', (auctionId) => {
    console.log(`Client ${socket.id} joining auction room: ${auctionId}`);
    socket.join(auctionId);
  });

  socket.on('leaveAuctionRoom', (auctionId) => {
    console.log(`Client ${socket.id} leaving auction room: ${auctionId}`);
    socket.leave(auctionId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
    // Remove user from map if they were authenticated
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected. Map size: ${userSocketMap.size}`);
        break;
      }
    }
  });
});

server.listen(SOCKET_IO_PORT, (err) => {
  if (err) throw err;
  console.log(`> Socket.IO server ready on http://${hostname}:${SOCKET_IO_PORT}`);
  console.log(`> Next.js app should be running separately on http://${hostname}:${NEXTJS_PORT}`);
});