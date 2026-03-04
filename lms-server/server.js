const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
console.log("📡 User Socket Map:", userSocketMap);

// Utility to get a user's socketId
const getReceiverSocketId = (receiverId) => {
  console.log("receiverId21 server", receiverId);
  return userSocketMap[receiverId]?.socketId || null;
};

// Socket.IO logic
io.on("connection", (socket) => {
  const userId =
    socket.handshake.auth?.userId || socket.handshake.query?.userId;
  console.log("🟢 User connected:", userId);
  console.log("🟢 socketId:", socket.id);
  if (userId) {
    // Disconnect previous socket if exists
    if (
      userSocketMap[userId]?.socketId &&
      userSocketMap[userId].socketId !== socket.id
    ) {
      const oldSocketId = userSocketMap[userId].socketId;
      io.to(oldSocketId).disconnectSockets(true);
    }

    // Store or update socket info (initially name may be unknown)
    userSocketMap[userId] = {
      socketId: socket.id,
      name: "Unknown",
    };
  }

  // Send back the socket ID
  socket.emit("me", socket.id);

  // When user joins and sends their full data
  socket.on("join", (user) => {
    if (!user || !user.id) {
      console.warn("[⚠️] Invalid user data on join");
      return;
    }

    // Update userSocketMap with name
    userSocketMap[user.id] = {
      socketId: socket.id,
      name: user.name,
    };

    console.log("✅ User joined:", user.name, "-", user.id);

    // Emit updated list of online users
    const onlineUsers = Object.entries(userSocketMap).map(
      ([userId, value]) => ({
        userId,
        name: value.name,
        socketId: value.socketId,
      }),
    );

    io.emit("getOnlineUsers", onlineUsers);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, value] of Object.entries(userSocketMap)) {
      if (value.socketId === socket.id) {
        console.log("🔴 User disconnected:", userId);
        delete userSocketMap[userId];
        break;
      }
    }

    // Emit updated list
    io.emit("contentRef", Object.keys(userSocketMap));
  });
});

// Export modules
module.exports = { app, server, io, getReceiverSocketId };
