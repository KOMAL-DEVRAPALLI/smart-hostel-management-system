import Fee from "../models/feeModel.js";
import Student from "../models/studentModel.js";

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

/* ================= GENERATE SINGLE FEE ================= */

export const generateFee = async (req, res) => {
  try {

    const { studentId, month, amount } = req.body;

    // ✅ VALIDATION FIRST
    if (!studentId || !month || !amount) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be positive"
      });
    }

    const selectedMonth = month.toLowerCase();

    // ✅ FIXED BUG (IMPORTANT)
    if (monthMap[selectedMonth] === undefined) {
      return res.status(400).json({
        message: "Invalid month name"
      });
    }

    const normalizedMonth = selectedMonth;

    /* ===== DUE DATE LOGIC ===== */

    const now = new Date();
    let year = now.getFullYear();

    let monthIndex = monthMap[selectedMonth] + 1;

    if (monthIndex === 12) {
      monthIndex = 0;
      year += 1;
    }

    const dueDate = new Date(year, monthIndex, 5);

    /* ===== CHECK STUDENT ===== */

    const student = await Student.findOne({
      _id: studentId,
      status: "active"
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    /* ===== PREVENT DUPLICATE ===== */

    const existingFee = await Fee.findOne({
      studentId,
      month: normalizedMonth
    });

    if (existingFee) {
      return res.status(400).json({
        message: "Fee already exists for this month"
      });
    }

    /* ===== CREATE ===== */

    const fee = await Fee.create({
      studentId,
      month: normalizedMonth,
      amount,
      status: "unpaid",
      dueDate
    });

    res.status(201).json({
      message: "Fee generated",
      data: fee
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate fee"
      });
    }

    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= BULK GENERATE ================= */

export const generateBulkFees = async (req, res) => {
  try {

    const { month, amount } = req.body;

    // ✅ VALIDATION FIRST
    if (!month || amount === undefined) {
      return res.status(400).json({
        message: "Month and amount required"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    const selectedMonth = month.toLowerCase();

    // ✅ FIXED BUG
    if (monthMap[selectedMonth] === undefined) {
      return res.status(400).json({
        message: "Invalid month"
      });
    }

    const normalizedMonth = selectedMonth;

    /* ===== DUE DATE ===== */

    const now = new Date();
    let year = now.getFullYear();

    let monthIndex = monthMap[selectedMonth] + 1;

    if (monthIndex === 12) {
      monthIndex = 0;
      year += 1;
    }

    const dueDate = new Date(year, monthIndex, 5);

    /* ===== GET STUDENTS ===== */

    const students = await Student.find({ status: "active" });

    let createdCount = 0;

    for (let student of students) {

      const existing = await Fee.findOne({
        studentId: student._id,
        month: normalizedMonth
      });

      if (!existing) {
        await Fee.create({
          studentId: student._id,
          month: normalizedMonth,
          amount,
          status: "unpaid",
          dueDate
        });

        createdCount++;
      }
    }
  
    
    
    res.status(200).json({
      message: `${createdCount} fees generated successfully`
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ================= GET FEES ================= */

export const getFees = async (req, res) => {
  try {

    const today = new Date();

    // ✅ AUTO UPDATE OVERDUE
   try {
  await Fee.updateMany(
    {
      status: "unpaid",
      dueDate: { $lt: new Date() }
    },
    {
      $set: { status: "overdue" }
    }
  );
} catch (err) {
  console.error("UPDATE OVERDUE ERROR:", err);
}

    let fees;

    if (req.user.role === "student") {

      const student = await Student.findOne({
        userId: req.user.id
      });

      if (!student) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      fees = await Fee.find({
        studentId: student._id
      }).populate("studentId");

    } else {

      fees = await Fee.find()
        .populate("studentId");
    }

    res.status(200).json(fees);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching fees"
    });
  }
};

/* ================= UPDATE STATUS ================= */

export const updateFeeStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status, transactionId } = req.body;

    const fee = await Fee.findById(id).populate("studentId");

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found"
      });
    }

    // ✅ ADMIN CAN UPDATE ANY
    if (req.user.role === "admin") {
      fee.status = status;
    }

    // ✅ STUDENT CAN ONLY PAY THEIR OWN FEE
    else if (req.user.role === "student") {

      const student = await Student.findOne({
        userId: req.user.id
      });

      if (!student || fee.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }

      // student can only mark as paid
      fee.status = "paid";
      fee.transactionId = transactionId;
    }

    else {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await fee.save();

    res.status(200).json({
      message: "Payment successful",
      data: fee
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
    } = req.body;

    // 🔥 CRITICAL LINE (this is probably missing or wrong)
   const updated = await Fee.findByIdAndUpdate(
  feeId,
  {
    $set: {
      status: "paid",
      paymentId: razorpay_payment_id,
    }
  },
  { new: true }
);

    console.log("UPDATED FEE:", updated);

    res.json({ success: true, updated });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};