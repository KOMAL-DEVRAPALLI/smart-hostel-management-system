import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

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

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
// console.log("ENV CHECK:", process.env.RAZORPAY_KEY_ID);

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
console.log("PAYMENT ROUTES LOADED");
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});