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

// Connect to MongoDB
dbConnect();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://192.168.1.4:8081"],
    credentials: true,
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", async (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);

    // Send existing messages from MongoDB
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("load_messages", messages);
  });

  socket.on("send_message", async ({ room, message, sender, receiverId }) => {
    const newMessage = await Message.create({ room, message, sender });

    const receiverUser = await User.findById(receiverId);
    if (receiverUser?.expoPushToken) {
      await sendPushNotification(receiverUser.expoPushToken, {
        title: "New Message",
        body: `${sender} sent you a message.`,
        data: { room }, // optional
      });
    }

    io.to(room).emit("receive_message", {
      sender,
      message,
      timestamp: newMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
io.on("connection", (socket) => {
  socket.on("join_video", ({ userId }) => {
    socket.join(userId);
  });

  socket.on("offer", (data) => {
    io.to(data.target).emit("offer", data);
  });

  socket.on("answer", (data) => {
    io.to(data.target).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.target).emit("ice-candidate", data);
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
