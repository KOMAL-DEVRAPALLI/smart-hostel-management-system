import Fee from "../models/feeModel.js";
import Student from "../models/studentModel.js";
import { io } from "../server.js"; // 🔥 IMPORTANT

/* ================= MONTH MAP ================= */

const monthMap = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

/* ================= UPDATE STATUS ================= */

export const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const fee = await Fee.findById(id).populate("studentId");

    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // ADMIN
    if (req.user.role === "admin") {
      fee.status = status;
    }

    // STUDENT
    else if (req.user.role === "student") {
      const student = await Student.findOne({ userId: req.user.id });

      if (!student || fee.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      fee.status = "paid";
      fee.transactionId = transactionId;
    }

    else {
      return res.status(403).json({ message: "Not authorized" });
    }

    await fee.save();

    // 🔥 SOCKET EVENT
    io.emit("paymentSuccess", {
      message: `💰 ${fee.studentId.name} paid ₹${fee.amount} for ${fee.month}`
    });

    res.status(200).json({
      message: "Payment successful",
      data: fee
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= VERIFY PAYMENT ================= */

export const verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
    } = req.body;

    const updated = await Fee.findByIdAndUpdate(
      feeId,
      {
        $set: {
          status: "paid",
          paymentId: razorpay_payment_id,
        }
      },
      { new: true }
    ).populate("studentId");

    console.log("UPDATED FEE:", updated);

    // 🔥 SOCKET EVENT
    io.emit("paymentSuccess", {
      message: `💰 ${updated.studentId.name} paid ₹${updated.amount} (${updated.month})`
    });

    res.json({ success: true, updated });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};