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

  const role = localStorage.getItem("role");

  console.log("🔥 FeeDashboard mounted");
  console.log("ROLE:", role);

  // ================= SOCKET =================
  useEffect(() => {
    socketRef.current = io("https://backend-qlmf.onrender.com", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ CONNECTED:", socketRef.current.id);
    });

    socketRef.current.on("paymentSuccess", (data) => {
      toast.success(data.message);
      fetchFees();
    });

    return () => socketRef.current.disconnect();
  }, []);

  // ================= FETCH =================
  const fetchFees = async () => {
    try {
      const data = await apiGet(API.FEES.ALL);
      console.log("📦 FEES DATA:", data);
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
  }, []);

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
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        toast.error("Payment failed");
      });

      rzp.open();

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // ================= FILTER =================
  const filteredFees =
    filter === "all"
      ? fees
      : fees.filter((f) => f.status === filter);

  const unpaidFees = fees.filter(
    (f) => f.status === "unpaid" || f.status === "overdue"
  );

  // ================= UI =================
  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2>Billing & Payments</h2>

        {/* ================= ADMIN VIEW ================= */}
        {role === "admin" && (
          <div>
            <h3>All Fees</h3>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>

            {filteredFees.length === 0 ? (
              <p>No fees found</p>
            ) : (
              filteredFees.map((fee) => (
                <div key={fee._id} style={cardBox}>
                  <h4>{fee.studentId?.name}</h4>
                  <p>{fee.month}</p>
                  <p>₹ {fee.amount}</p>
                  <p>Status: {fee.status}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= STUDENT VIEW ================= */}
        {role !== "admin" && (
          <div style={{ display: "grid", gap: "15px" }}>
            {unpaidFees.length === 0 ? (
              <p>No pending fees 🎉</p>
            ) : (
              unpaidFees.map((fee) => (
                <div key={fee._id} style={cardBox}>
                  <h3>{fee.month}</h3>
                  <p>₹ {fee.amount}</p>

                  <button
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
};

export default FeeDashboard;