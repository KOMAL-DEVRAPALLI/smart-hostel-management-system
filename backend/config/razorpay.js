import pkg from "razorpay";
import dotenv from "dotenv";
dotenv.config();
const Razorpay = pkg;   // 👈 FIX

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// console.log("RAZORPAY INIT:", razorpay); // 👈 DEBUG

export default razorpay;