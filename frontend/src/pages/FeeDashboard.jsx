import React, { useEffect, useState } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { API } from "../services/apiRoutes";
import {io} from "socket.io-client"
console.log("🔥 SOCKET CODE LOADED");

 const socket = io("https://backend-qlmf.onrender.com", {
  transports: ["websocket"]
});
const FeeDashboard = () => {
 
  const [filter, setFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");
  const convertMonth = (value) => {
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    if (!value) return "";

    const index = parseInt(value.split("-")[1], 10) - 1;
    return months[index];
  };
  /* ================= FETCH ================= */

  const fetchStudents = async () => {
    try {
      const data = await apiGet(API.STUDENTS.ALL);
      setStudents(data);
    } catch {
      toast.error("Failed to fetch students");
    }
  };

  const fetchFees = async () => {
    try {
      const data = await apiGet(API.FEES.ALL);
      setFees(data);
    } catch {
      toast.error("Failed to fetch fees");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchStudents();
    } fetchFees();
  }, []);
useEffect(() => {
  socket.on("paymentSuccess", (data) => {
    toast.success(data.message);
  });

  return () => {
    socket.off("paymentSuccess");
  };
}, []);
useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ CONNECTED:", socket.id);
  });

  socket.on("paymentSuccess", (data) => {
    console.log("🔥 EVENT RECEIVED:", data);
    toast.success(data.message);
  });

  return () => {
    socket.off("paymentSuccess");
  };
}, []);
  /* ================= ADD SINGLE ================= */

  const handleAddFee = async () => {
    if (!studentId || !month || !amount) {
      toast.error("All fields required");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.ALL, "POST", {
        studentId,
        month: convertMonth(month),
        amount: Number(amount),
      });

      toast.success("Fee generated");

      setStudentId("");
      setMonth("");
      setAmount("");

      fetchFees();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK ================= */

  const handleBulkGenerate = async () => {
    if (!bulkMonth || !bulkAmount) {
      toast.error("Month and amount required");
      return;
    }

    if (Number(bulkAmount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: convertMonth(bulkMonth),
        amount: Number(bulkAmount),
      });

      toast.success("Bulk fees generated");

      setBulkMonth("");
      setBulkAmount("");

      fetchFees();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= MARK PAID ================= */

  const markPaid = async (id) => {
    try {
      await apiRequest(`${API.FEES.ALL}/${id}`, "PATCH", {
        status: "paid",
      });

      toast.success("Marked as paid");
      fetchFees();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ================= FILTER ================= */

  const filteredFees = fees.filter((f) =>
    filter === "all" ? true : f.status === filter
  );

  /* ================= GROUP ================= */

  const groupedFees = filteredFees.reduce((acc, fee) => {
    const name = fee.studentId?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(fee);
    return acc;
  }, {});

  /* ================= STATS ================= */

  const total = fees.length;
  const paid = fees.filter((f) => f.status === "paid").length;
  const unpaid = fees.filter((f) => f.status === "unpaid").length;
  const overdue = fees.filter((f) => f.status === "overdue").length;
  const handlePayment = async (fee) => {
    try {
      // console.log("PAYMENT CLICKED", fee);

      const order = await apiRequest(
        API.PAYMENT.ORDER,
        "POST",
        { amount: fee.amount }
      );

      // console.log("ORDER:", order);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Hostel Fees",
        order_id: order.id,
        handler: async function (response) {
          // console.log("STEP1: PAYMENT SUCCESS RESPONSE", response);

          try {
            // console.log("STEP1: Sending verify request...");

            await apiRequest(API.PAYMENT.VERIFY, "POST", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fee._id,
            });
            // console.log("STEP1: Verify done");

            // console.log("TOKEN:", localStorage.getItem("token")); // 🔥 ADD THIS

            await fetchFees();
            // toast.success("Payment successful 🎉")
          } catch (err) {
            console.error("STEP1: VERIFY ERROR:", err);
            toast.error("Payment failed")
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  /* ================= UI ================= */

  return (
   <MainLayout>
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    <h2>Billing & Payments</h2>

    {/* STATS */}
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <div style={card("#16a34a")}>Total: {total}</div>
      <div style={card("#22c55e")}>Paid: {paid}</div>
      <div style={card("#f59e0b")}>Unpaid: {unpaid}</div>
      <div style={card("#ef4444")}>Overdue: {overdue}</div>
    </div>

    {/* ADMIN FORMS */}
    {role === "admin" && (
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={box}>
          <h3>Bulk Billing</h3>
          <input type="month" style={input} value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} />
          <input style={input} placeholder="Amount" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} />
          <button style={btn} onClick={handleBulkGenerate}>Generate Bills</button>
        </div>

        <div style={box}>
          <h3>Single Billing</h3>
          <select style={input} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select User</option>
            {students.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>

          <input type="month" style={input} value={month} onChange={(e) => setMonth(e.target.value)} />
          <input style={input} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={btn} onClick={handleAddFee}>Generate Bill</button>
        </div>
      </div>
    )}

    {/* RECORDS */}
    <div style={box}>
      <h3>Billing Records</h3>

      <select style={input} value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
        <option value="overdue">Overdue</option>
      </select>

      {/* ================= ADMIN TABLE ================= */}
      {role === "admin" ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Month</th>
              <th style={th}>Amount</th>
              <th style={th}>Due Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedFees).map(([student, records]) => (
              <React.Fragment key={student}>
                <tr>
                  <td colSpan="5" style={groupHeader}>{student}</td>
                </tr>

                {records.map((b) => (
                  <tr key={b._id}>
                    <td></td>
                    <td style={td}>{b.month}</td>
                    <td style={{ fontWeight: "600" }}>₹ {b.amount}</td>
                    <td style={td}>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td style={td}>
                      <span style={statusStyle(b.status)}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        /* ================= STUDENT CARDS ================= */
        <div style={{ display: "grid", gap: "15px", marginTop: "10px" }}>
          {fees.map((b) => (
            <div key={b._id} style={cardBox}>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, textTransform: "capitalize" }}>{b.month}</h3>
                <span style={statusStyle(b.status)}>{b.status}</span>
              </div>

              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                ₹ {b.amount}
              </p>

              <p style={{ color: "#6b7280" }}>
                Due: {new Date(b.dueDate).toLocaleDateString()}
              </p>

              <button
                onClick={() => {
                  setSelectedFee(b);
                  setShowModal(true);
                }}
                disabled={b.status === "paid" || loading}
                style={payBtn(b.status)}
              >
                {b.status === "paid"
                  ? "Paid ✅"
                  : loading
                  ? "Processing..."
                  : "Pay Now"}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>

    {loading && <p>Processing...</p>}
  </div>

  {/* ================= PAYMENT MODAL ================= */}
  {showModal && selectedFee && (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h3>Confirm Payment</h3>

        <p><strong>Month:</strong> {selectedFee.month}</p>
        <p><strong>Amount:</strong> ₹ {selectedFee.amount}</p>
        <p><strong>Due:</strong> {new Date(selectedFee.dueDate).toLocaleDateString()}</p>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button style={cancelBtn} onClick={() => setShowModal(false)}>
            Cancel
          </button>

          <button
            style={confirmBtn}
            onClick={() => {
              handlePayment(selectedFee);
              setShowModal(false);
            }}
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  )}
</MainLayout>
  );
};

/* ================= STYLES ================= */
const cardBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  border: "1px solid #eee",
};
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "320px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const cancelBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const confirmBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};
const payBtn = (status) => ({
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "600",
  background: status === "paid" ? "#16a34a" : "#2563eb",
  color: "#fff",
  cursor: status === "paid" ? "not-allowed" : "pointer",
});

const card = (bg) => ({
  flex: 1,
  padding: 15,
  borderRadius: 10,
  color: "#fff",
  textAlign: "center",
  background: bg,
});

const box = {
  flex: 1,
  minWidth: 300,
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  marginTop: 20,
};

const input = {
  padding: 10,
  marginBottom: 10,
  width: "100%",
};

const btn = {
  background: "#16a34a",
  color: "#fff",
  padding: "10px",
  border: "none",
  borderRadius: 6,
};

const btnSmall = {
  background: "#22c55e",
  color: "#fff",
  padding: "6px 10px",
  border: "none",
  borderRadius: 6,
};

const th = { textAlign: "left", padding: 10 };
const td = { padding: 10 };

const groupHeader = {
  fontWeight: "bold",
  background: "#f3f4f6",
  padding: 10,
};

const statusStyle = (status) => ({
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "capitalize",
  background:
    status === "paid"
      ? "#dcfce7"
      : status === "overdue"
        ? "#fee2e2"
        : "#fef3c7",
  color:
    status === "paid"
      ? "#166534"
      : status === "overdue"
        ? "#991b1b"
        : "#92400e",
});

export default FeeDashboard;