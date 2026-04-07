import React, { useEffect, useState, useRef } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { API } from "../services/apiRoutes";
import { io } from "socket.io-client";

const FeeDashboard = () => {

  const socketRef = useRef(null);

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  console.log("🔥 FeeDashboard mounted");
  console.log("ROLE:", role);

  // ================= SOCKET =================
 useEffect(() => {
  const socket = io("https://backend-qlmf.onrender.com", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ CONNECTED:", socket.id);
  });

  socket.on("paymentSuccess", async (data) => {
    toast.success(data.message);
    await fetchFees();
  });

  return () => {
    socket.off("paymentSuccess");
    socket.disconnect();
  };
}, []);
  // ================= FETCH =================
  const fetchFees = async () => {
    try {
      const data = await apiGet(API.FEES.ALL);
      console.log("📦 FEES DATA:", data);
        if (!Array.isArray(data)) {
  throw new Error("Invalid data");
}
      setFees(data);
    
    } catch {
      toast.error("Failed to fetch fees");
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiGet(API.STUDENTS.ALL);
      setStudents(data);
    } catch {
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    console.log("🔥 useEffect running");

    fetchFees();

    if (role === "admin") {
      fetchStudents();
    }
  }, [role]);

  // ================= PAYMENT =================
  const handlePayment = async (fee) => {
    try {
      setLoadingId(fee._id);

      const order = await apiRequest(API.PAYMENT.ORDER, "POST", {
        amount: fee.amount,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Hostel Fees",
        order_id: order.id,

        handler: async (response) => {
          await apiRequest(API.PAYMENT.VERIFY, "POST", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            feeId: fee._id,
          });
          setLoadingId(null);
        },
      };
 if (!window.Razorpay) {
  toast.error("Payment system not loaded");
  setLoadingId(null); // 🔥 missing
  return;
}
      const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
  toast.error("Payment failed");
  setLoadingId(null);
});

      rzp.open();

    } catch (err) {
  console.error(err);
  toast.error("Payment failed. Try again");
  setLoadingId(null); // 🔥 important
}
  };
    // ================= FILTER =================
const filteredFees =
  filter === "all"
    ? fees
    : fees.filter((f) => f.status?.toLowerCase() === filter);
  const unpaidFees = fees.filter(
    (f) => ["unpaid", "overdue"].includes(f.status?.toLowerCase())
  );

 const groupedFees = filteredFees.reduce((acc, fee) => {
  const studentId = fee.studentId?._id || "unknown";
  const studentName = fee.studentId?.name || "Unknown";

  if (!acc[studentId]) {
    acc[studentId] = {
      name: studentName,
      fees: []
    };
  }

  acc[studentId].fees.push(fee);

  return acc;
}, {});
 /* ===== STATS ===== */
   const total = fees.length;
const paid = fees.filter(b => b.status?.toLowerCase() === "paid").length;
const unpaid = fees.filter(b => b.status?.toLowerCase() === "unpaid").length;
const overdue = fees.filter(b => b.status?.toLowerCase() === "overdue").length;

const handleStatusToggle = async (fee) => {
  try {
    setLoadingId(fee._id);

    const newStatus =
      fee.status?.toLowerCase() === "paid" ? "unpaid" : "paid";

    await apiRequest(API.FEES.UPDATE_STATUS, "PATCH", {
      feeId: fee._id,
      status: newStatus,
    });

    toast.success(`Marked as ${newStatus}`);

    await fetchFees(); // refresh UI
  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  } finally {
    setLoadingId(null);
  }
};
  // ================= UI =================
  return (
   <MainLayout>
  <div style={wrapper}>

    <h2>Billing & Payments</h2>

    {/* ===== STATS ===== */}
    <div style={stats}>
      <div style={{ ...card, background: "#16a34a" }}>Total: {total}</div>
      <div style={{ ...card, background: "#22c55e" }}>Paid: {paid}</div>
      <div style={{ ...card, background: "#f59e0b" }}>Unpaid: {unpaid}</div>
      <div style={{ ...card, background: "#ef4444" }}>Overdue: {overdue}</div>
    </div>

    {/* ================= ADMIN VIEW ================= */}
    {role === "admin" && (
      <div style={box}>
        <h3>All Fees</h3>

        <select
          style={input}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>

    {Object.values(groupedFees).map((student) => (
  <div key={student.name} style={box}>
    <h3>{student.name}</h3>

    {student.fees.map((fee) => (
      <div key={fee._id} style={cardItem}>
        <p><strong>Month:</strong> {fee.month}</p>
        <p><strong>Amount:</strong> ₹ {fee.amount}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span style={statusStyle(fee.status)}>
            {fee.status}
          </span>
        </p>
      </div>
    ))}
  </div>

))}

      </div>
    )}

    {/* ================= STUDENT VIEW ================= */}
    {role !== "admin" && (
      <div style={box}>
        <h3>Your Pending Fees</h3>

        {unpaidFees.length === 0 ? (
          <p>No pending fees 🎉</p>
        ) : (
          unpaidFees.map((fee) => (
            <div key={fee._id} style={cardItem}>
              <h4>{fee.month}</h4>

              <p><strong>Amount:</strong> ₹ {fee.amount}</p>

              <button
                style={btn}
                disabled={loadingId === fee._id}
                onClick={() => handlePayment(fee)}
              >
                {loadingId === fee._id ? "Processing..." : "Pay Now"}
              </button>
              <button
  style={btn}
  disabled={loadingId === fee._id}
  onClick={() => handleStatusToggle(fee)}
>
  {loadingId === fee._id
    ? "Updating..."
    : fee.status?.toLowerCase() === "paid"
    ? "Mark as Unpaid"
    : "Mark as Paid"}
</button>
            </div>
          ))
        )}
      </div>
    )}

  </div>
</MainLayout>
  );
};

/* ===== STYLES ===== */

const wrapper = { maxWidth: "1200px", margin: "0 auto" };

const stats = { display: "flex", gap: 10, marginBottom: 20 };

const card = {
  flex: 1,
  padding: 15,
  borderRadius: 10,
  color: "#fff",
  textAlign: "center"
};

const forms = { display: "flex", gap: 20, flexWrap: "wrap" };

const box = {
  flex: 1,
  minWidth: 300,
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  marginTop: 20
};

const input = {
  padding: 10,
  marginBottom: 10,
  width: "100%"
};

const btn = {
  background: "#16a34a",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: 6
};

const btnSmall = {
  background: "#22c55e",
  color: "#fff",
  padding: "6px 10px",
  border: "none",
  borderRadius: 6
};

const table = { width: "100%", borderCollapse: "collapse" };

const th = { textAlign: "left", padding: 10 };

const td = { padding: 10 };

const statusStyle = (status) => ({
  background:
    status === "paid"
      ? "#dcfce7"
      : status === "overdue"
      ? "#fee2e2"
      : "#fef3c7",
  padding: "4px 10px",
  borderRadius: 20
});
const cardItem = {
  padding: 15,
  marginBottom: 10,
  borderRadius: 10,
  background: "#f9fafb",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};
export default FeeDashboard;