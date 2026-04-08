import Student from "../models/studentModel.js";
import Fee from "../models/feeModel.js";
import Room from "../models/roomModel.js";

export const getDashboardData = async (req, res) => {
  try {
    // ===== BASIC STATS =====
    const totalStudents = await Student.countDocuments();
    const totalFees = await Fee.countDocuments();
    const paidFees = await Fee.countDocuments({ status: "Paid" });
    const unpaidFees = await Fee.countDocuments({ status: "Unpaid" });

    // ===== MONTHLY FEE COLLECTION =====
    const monthlyFees = await Fee.aggregate([
      {
        $group: {
          _id: "$month", // e.g. "Jan", "Feb"
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ===== ROOM OCCUPANCY =====
    const roomData = await Room.find().select("roomNumber capacity occupiedCount");

    // ===== SMART INSIGHTS =====
    const insights = [];

    if (unpaidFees > 5) {
      insights.push("⚠️ High number of unpaid fees");
    }

    if (roomData.some(r => r.occupiedCount >= r.capacity)) {
      insights.push("⚠️ Some rooms are fully occupied");
    }

    if (paidFees > unpaidFees) {
      insights.push("✅ Most students have paid their fees");
    }

    // ===== RESPONSE =====
    res.json({
      totalStudents,
      totalFees,
      paidFees,
      unpaidFees,
      monthlyFees,
      roomData,
      insights,
    });

  } catch (error) {
    res.status(500).json({ error: "Dashboard data error" });
  }
};