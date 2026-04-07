import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Fee from "../models/feeModel.js";
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
// console.log("BODY:", req.body);
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
  // console.log("RAZORPAY ERROR:", err);   // 👈 ADD THIS
  res.status(500).json({ message: "Order failed", error: err.message });
}
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
    } = req.body;

    // 🔐 Step 1: Generate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // ❌ Step 2: If invalid → reject
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    // ✅ Step 3: Update DB
    const updated = await Fee.findByIdAndUpdate(
      feeId,
      {
        $set: {
          status: "paid",
          paymentId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Fee not found",
      });
    }

    // 🔥 Step 4: Emit AFTER success
    const io = req.app.get("io");

    io.emit("paymentSuccess", {
      message: "Payment successful",
      feeId: feeId,
    });

    res.json({ success: true, updated });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};