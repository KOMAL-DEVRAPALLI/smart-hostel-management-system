import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; // ✅ FIXED

import connectDB from "./config/db.js";

import paymentRoutes from "./routes/paymentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// ================= CONNECT DB =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "*", // later restrict
}));
app.use(express.json());

// ================= CREATE SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 👉 VERY IMPORTANT (so routes can use it)
app.set("io", io);

// ================= TEST ROUTE =================
app.get("/test", (req, res) => {
  res.send("API working");
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/payment", paymentRoutes);

// ================= SERVER =================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});