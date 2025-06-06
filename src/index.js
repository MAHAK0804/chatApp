import dotenv from "dotenv";
dotenv.config();

import express, { json, urlencoded } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import "./config/passportConfig.js";
import dbConnect from "./config/db.js";

import session from "express-session";
import passport from "passport";
import Message from "./models/Message.js";
import router from "./routes/router.js";
import User from "./models/userModels.js";
import mongoose from "mongoose";
import { sendPushNotification } from "./utils/senNoti.js";

// Connect to MongoDB
dbConnect();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const onlineUsers = new Map();
const io = new Server(server, {
  cors: {
    origin: ["http://192.168.1.4:8081"],
    credentials: true,
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  // ✅ Mark user as online
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is ONLINE`);
    io.emit("user-online", userId);
  });

  // ✅ Mark user as offline on manual signal
  socket.on("user-offline", (userId) => {
    onlineUsers.delete(userId);
    console.log(`User ${userId} is OFFLINE`);
    io.emit("user-offline", userId);
  });

  socket.on("join_room", async (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);

    // Send existing messages from MongoDB
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("load_messages", messages);
  });

  socket.on("send_message", async (payload) => {
    try {
      const { room, message, sender, receiverId } = payload;
      console.log("Received payload in send_message:", payload);

      const newMessage = await Message.create({ room, message, sender });
      console.log("sendMessage->>>>>>", newMessage);
      console.log("receiverId:", receiverId);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        console.error("Invalid receiverId:", receiverId);
        return;
      }

      const receiverUser = await User.findById(receiverId);
      console.log("message receiver", receiverUser);

      if (receiverUser?.fcmToken) {
        await sendPushNotification(receiverUser.fcmToken, {
          title: "New Message",
          body: `${sender} sent you a message.`,
          data: { room },
        });
      }

      io.to(room.trim()).emit("receive_message", {
        sender,
        message,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error("Error in send_message:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware
const corsOptions = {
  origin: ["http://localhost:8081"],
  credentials: true,
};
app.use(json());
app.use("/uploads", express.static("uploads"));

app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 }, // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use("/api", router);
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
