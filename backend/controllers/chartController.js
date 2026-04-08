import Student from "../models/studentModel.js";
import Fee from "../models/feeModel.js";
import Room from "../models/roomModel.js";

export const getDashboardData = async (req, res) => {
  try {
    // ===== BASIC STATS =====
    const totalStudents = await Student.countDocuments();
    const totalFees = await Fee.countDocuments();
  const paidFees = await Fee.countDocuments({
  status: { $in: ["paid", "Paid"] }
});

const unpaidFees = await Fee.countDocuments({
  status: { $in: ["unpaid", "Unpaid"] }
});

    // ===== MONTHLY FEE COLLECTION =====
   const monthsOrder = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const monthlyFeesRaw = await Fee.aggregate([
  {
    $group: {
      _id: "$month",
      total: { $sum: "$amount" }
    }
  }
]);

const monthlyFees = monthsOrder.map(month => {
  const found = monthlyFeesRaw.find(
    m => m._id?.toLowerCase() === month.toLowerCase()
  );

  return {
    _id: month,
    total: found ? found.total : 0
  };
});

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