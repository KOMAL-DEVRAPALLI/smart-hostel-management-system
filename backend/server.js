import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import studentRoutes from "./routes/studentRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();


// ================= CONNECT DB =================

connectDB();


// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());


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


// ================= SERVER =================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});