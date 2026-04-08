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
    const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const [expandedStudent, setExpandedStudent] = useState(null);
    const [userId, setUserId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");

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
const toggleStudent = (studentId) => {
  setExpandedStudent((prev) =>
    prev === studentId ? null : studentId
  );
};
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
  /* ===== BULK BILL ===== */

  const handleBulkGenerate = async () => {
    if (!bulkMonth || !bulkAmount) {
      toast.error("Month and amount required");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: bulkMonth.trim().toLowerCase(),
        amount: Number(bulkAmount) // ✅ FIXED
      });

      toast.success("Bulk bills generated");

      setBulkMonth("");
      setBulkAmount("");

      fetchFees()

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
 /* ===== SINGLE BILL ===== */

  const handleAddBill = async () => {
    if (!userId || !month || !amount) {
      toast.error("All fields required");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.ALL, "POST", {
        studentId: userId,
        month,
        amount
      });

      toast.success("Bill generated");

      setUserId("");
      setMonth("");
      setAmount("");

      fetchBills();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
  <MainLayout>
    <div style={wrapper}>

      <p style={{ color: "#666" }}>
        Manage student fee records and payments
      </p>

      {/* ===== STATS ===== */}
      <div style={stats}>
        <div style={{ ...statCard, background: "#3b82f6" }}>Total: {total}</div>
        <div style={{ ...statCard, background: "#22c55e" }}>Paid: {paid}</div>
        <div style={{ ...statCard, background: "#f59e0b" }}>Unpaid: {unpaid}</div>
        <div style={{ ...statCard, background: "#ef4444" }}>Overdue: {overdue}</div>
      </div>
 {/* ===== FORMS ===== */}
        {role === "admin" && (
          <div style={forms}>

            <div style={box}>
              <h3>Bulk Billing</h3>

              <input
                style={input}
                placeholder="Month"
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
              />

              <input
                style={input}
                placeholder="Amount"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />

              <button style={btn} onClick={handleBulkGenerate}>
                Generate Bills
              </button>
            </div>

            <div style={box}>
              <h3>Single Billing</h3>

              <select
                style={input}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <input
                style={input}
                placeholder="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />

              <input
                style={input}
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button style={btn} onClick={handleAddBill}>
                Generate Bill
              </button>
            </div>

          </div>
        )}
      {/* ================= ADMIN VIEW ================= */}
      {role === "admin" && (
        <div style={sectionCard}>
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

          {Object.keys(groupedFees).length === 0 ? (
            <p>No records found</p>
          ) : (
            Object.entries(groupedFees).map(([studentId, student]) => {
              const isOpen = expandedStudent === studentId;

              return (
                <div
                  key={studentId}
                  style={{
                    ...studentCard,
                    background: isOpen ? "#f1f5f9" : "#fff",
                    transition: "0.3s"
                  }}
                >

                  {/* HEADER */}
                  <div
                    onClick={() => toggleStudent(studentId)}
                    style={clickableHeader}
                  >
                    <h3 style={studentHeader}>{student.name}</h3>

                    <span
                      style={{
                        transition: "0.3s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                      }}
                    >
                      ▼
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div
                    style={{
                 maxHeight: isOpen ? "500px" : "0px",
overflowY: "auto",
                      transition: "all 0.3s ease"
                    }}
                  >
                 <div style={{
  ...feeRow,
  fontWeight: "600",
  background: "#f1f5f9",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "8px"
}}>
  <span>Month</span>
  <span>Amount</span>
  <span>Status</span>
  <span>Action</span>
</div>
                    <div style={{ marginTop: 10 }}>
                      {student.fees.map((fee) => (
  <div key={fee._id} style={feeRow}>
    <div style={feeRow}>
      <span style={{ fontWeight: "600" }}>{fee.month}</span>

      <span>₹ {fee.amount}</span>

      <span style={statusStyle(fee.status)}>
        {fee.status}
      </span>

      <button
        style={
          fee.status?.toLowerCase() === "paid"
            ? dangerBtn
            : primaryBtn
        }
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
  </div>
))}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= STUDENT VIEW ================= */}
      {role !== "admin" && (
        <div style={studentCard}>
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
              </div>
            ))
          )}
        </div>
      )}

    </div>
  </MainLayout>
);

}

/* ===== STYLES ===== */
const clickableHeader = {
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  alignItems: "center",
  padding: "10px 0",
  transition: "0.2s"
};
const feeRow = {
  display: "grid",
 gridTemplateColumns: "1.5fr 1fr 1fr auto",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #eee",

};
const wrapper = { maxWidth: "1200px", margin: "0 auto" };
const forms = { display: "flex", gap: 20, flexWrap: "wrap" };

const box = {
  flex: 1,
  minWidth: 300,
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  marginTop: 20
};

const stats = { display: "flex", gap: 10, marginBottom: 20 };

const card = {
  flex: 1,
  padding: 15,
  borderRadius: 10,
  color: "#fff",
  textAlign: "center"
};
const sectionCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20
};
const studentHeader = {
  marginBottom: 10,
  fontSize: "18px",
  fontWeight: "600"
};
const container = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px"
};
const feeItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #eee"
};

const statCard = {
  flex: 1,
  padding: 20,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  textAlign: "center",
  fontWeight: "600"
};
const input = {
  padding: 10,
  marginBottom: 10,
  width: "100%"
};
const primaryBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

const dangerBtn = {
  background: "#ef4444",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
};
const studentCard = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};
const btn = {
  background: "#16a34a",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: 6
};

const statusStyle = (status) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: "12px",
  width: "fit-content",
  textAlign: "center"
});

const cardItem = {
  padding: "8px 12px",
  marginBottom: 6,
  background: "#f9fafb",
  borderRadius: 8,
};
export default FeeDashboard;