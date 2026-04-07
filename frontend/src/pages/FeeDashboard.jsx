import React, { useEffect, useState, useRef } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BillingDashboard = () => {

  const socketRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");

  const role = localStorage.getItem("role");

  // ================= SOCKET =================
  useEffect(() => {
    socketRef.current = io("https://backend-qlmf.onrender.com", {
      transports: ["websocket"],
    });

    socketRef.current.on("paymentSuccess", () => {
      toast.success("Payment updated");
      fetchBills();
    });

    return () => socketRef.current.disconnect();
  }, []);

  // ================= FETCH =================
  const fetchUsers = async () => {
    const data = await apiGet("/students");
    setUsers(data);
  };

  const fetchBills = async () => {
    const data = await apiGet("/fees");
    setBills(data);
  };

  useEffect(() => {
    fetchBills();
    if (role === "admin") fetchUsers();
  }, []);

  // ================= PAYMENT =================
  const handlePayment = async (bill) => {
    try {
      setLoadingId(bill._id);

      const order = await apiRequest("/payment/order", "POST", {
        amount: bill.amount,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Hostel Fees",
        order_id: order.id,

        handler: async (response) => {
          await apiRequest("/payment/verify", "POST", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            feeId: bill._id,
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error("Payment failed");
    } finally {
      setLoadingId(null);
    }
  };

  // ================= GENERATE =================
  const handleAddBill = async () => {
    await apiRequest("/fees", "POST", {
      studentId: userId,
      month,
      amount
    });
    toast.success("Bill generated");
    fetchBills();
  };

  const handleBulkGenerate = async () => {
    await apiRequest("/fees/bulk-generate", "POST", {
      month: bulkMonth,
      amount: Number(bulkAmount)
    });
    toast.success("Bulk generated");
    fetchBills();
  };

  // ================= FILTER =================
  const filtered = bills.filter(b =>
    filter === "all" ? true : b.status === filter
  );

  // ================= STATS =================
  const total = bills.length;
  const paid = bills.filter(b => b.status === "paid").length;
  const unpaid = bills.filter(b => b.status !== "paid").length;
  const overdue = bills.filter(b => b.status === "overdue").length;

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

        {/* ===== ADMIN FORMS ===== */}
        {role === "admin" && (
          <div style={forms}>

            <div style={box}>
              <h3>Bulk Billing</h3>
              <input style={input} placeholder="Month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)} />
              <input style={input} placeholder="Amount" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} />
              <button style={btn} onClick={handleBulkGenerate}>Generate</button>
            </div>

            <div style={box}>
              <h3>Single Billing</h3>
              <select style={input} value={userId} onChange={e => setUserId(e.target.value)}>
                <option>Select User</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <input style={input} placeholder="Month" value={month} onChange={e => setMonth(e.target.value)} />
              <input style={input} placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <button style={btn} onClick={handleAddBill}>Generate</button>
            </div>

          </div>
        )}

        {/* ===== TABLE ===== */}
        <div style={box}>

          <h3>Billing Records</h3>

          <select style={input} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

          <table style={table}>
            <thead>
              <tr>
                <th style={th}>User</th>
                <th style={th}>Month</th>
                <th style={th}>Amount</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td style={td}>{b.studentId?.name}</td>
                  <td style={td}>{b.month}</td>
                  <td style={td}>₹ {b.amount}</td>
                  <td style={td}>
                    <span style={statusStyle(b.status)}>
                      {b.status}
                    </span>
                  </td>

                  <td style={td}>
                    {role !== "admin" && b.status !== "paid" && (
                      <button
                        style={btnSmall}
                        onClick={() => handlePayment(b)}
                        disabled={loadingId === b._id}
                      >
                        {loadingId === b._id ? "Processing..." : "Pay"}
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>
  );
};
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

export default BillingDashboard;