import React, { useEffect, useState, useRef } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { API } from "../services/apiRoutes";
import { io } from "socket.io-client";

const FeeDashboard = () => {


  console.log("🔥 FeeDashboard mounted");
  
  const socketRef = useRef(null);

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
  const [loadingId, setLoadingId] = useState(null);

  const role = localStorage.getItem("role");
console.log("ROLE:", role);
  const convertMonth = (value) => {
    const months = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ];
    if (!value) return "";
    const index = parseInt(value.split("-")[1], 10) - 1;
    return months[index];
  };

  // ================= SOCKET =================
  useEffect(() => {
    console.log("🔥 Initializing socket...");

    socketRef.current = io("https://backend-qlmf.onrender.com", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ CONNECTED:", socketRef.current.id);
    });

    socketRef.current.on("paymentSuccess", (data) => {
      console.log("🔥 EVENT:", data);
      toast.success(data.message);
      fetchFees(); // auto refresh
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("❌ SOCKET ERROR:", err.message);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // ================= FETCH =================
  const fetchStudents = async () => {
    try {
      const data = await apiGet(API.STUDENTS.ALL);
      setStudents(data);
    } catch {
      toast.error("Failed to fetch students");
    }
  };

  const fetchFees = async () => {
  console.log("🔥 fetchFees called");

  const data = await apiGet(API.FEES.ALL);

  console.log("📦 FEES DATA:", data);  // 👈 ADD THIS

  setFees(data);
};

  useEffect(() => {
  console.log("🔥 useEffect running");

  if (role === "admin") {
    console.log("Fetching students...");
    fetchStudents();
  }

  console.log("Fetching fees...");
  fetchFees();
}, []);

  // ================= ADD SINGLE =================
  const handleAddFee = async () => {
    if (!studentId || !month || !amount) {
      return toast.error("All fields required");
    }

    if (Number(amount) <= 0) {
      return toast.error("Invalid amount");
    }

    try {
      await apiRequest(API.FEES.ALL, "POST", {
        studentId,
        month: convertMonth(month),
        amount: Number(amount),
      });

      toast.success("Fee generated");
      setStudentId(""); setMonth(""); setAmount("");
      fetchFees();

    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= BULK =================
  const handleBulkGenerate = async () => {
    if (!bulkMonth || !bulkAmount) {
      return toast.error("All fields required");
    }

    try {
      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: convertMonth(bulkMonth),
        amount: Number(bulkAmount),
      });

      toast.success("Bulk fees generated");
      setBulkMonth(""); setBulkAmount("");
      fetchFees();

    } catch (error) {
      toast.error(error.message);
    }
  };

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
          try {
            await apiRequest(API.PAYMENT.VERIFY, "POST", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fee._id,
            });
          } catch {
            toast.error("Verification failed");
          }
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
  const filteredFees = fees.filter((f) =>
    filter === "all" ? true : f.status === filter
  );

  // ================= GROUP =================
  const groupedFees = filteredFees.reduce((acc, fee) => {
    const name = fee.studentId?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(fee);
    return acc;
  }, {});

  // ================= STATS =================
  const total = fees.length;
  const paid = fees.filter(f => f.status === "paid").length;
  const unpaid = fees.filter(f => f.status !== "paid");

  // ================= UI =================
  return (
    <MainLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2>Billing & Payments</h2>

        {/* STUDENT VIEW */}
        {role !== "admin" && (
          <div style={{ display: "grid", gap: "15px" }}>
            {fees.map((b) => (
              <div key={b._id} style={cardBox}>
                <h3>{b.month}</h3>
                <p>₹ {b.amount}</p>
                <button
                  disabled={loadingId === b._id}
                  onClick={() => handlePayment(b)}
                >
                  {loadingId === b._id ? "Processing..." : "Pay Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FeeDashboard;