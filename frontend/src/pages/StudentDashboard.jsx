import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { apiGet, apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import { FaBed, FaMoneyBillWave, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const StudentDashboard = () => {

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const [roomNumber, setRoomNumber] = useState("Not Assigned");
  const [fees, setFees] = useState([]);
  const [pendingFees, setPendingFees] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Filter only actionable fees
  const actionableFees = fees.filter(
    (f) => f.status === "unpaid" || f.status === "overdue"
  );

  // 🔥 Razorpay Payment
  const handlePayment = async (fee) => {
    if (paying) return;

    try {
      setPaying(true);

      const order = await apiRequest(
        API.PAYMENT.ORDER,
        "POST",
        { amount: fee.amount }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Hostel Fees",
        order_id: order.id,

        handler: async function (response) {
          await apiRequest(API.PAYMENT.VERIFY, "POST", {
            ...response,
            feeId: fee._id,
          });

          toast.success("Payment successful 🎉");
          loadData();
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error("Payment failed ❌");
    } finally {
      setPaying(false);
    }
  };

  // 🔄 Load data
  const loadData = async () => {
    try {
      setLoading(true);

      const [student, feeData, complaints] = await Promise.all([
        apiGet(API.STUDENTS.ME),
        apiGet(API.FEES.ALL),
        apiGet(API.COMPLAINTS.ALL),
      ]);

      setFees(
        feeData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );

      if (student) {
        setUserName(student.name);
        if (student?.roomId?.roomNumber) {
          setRoomNumber(student.roomId.roomNumber);
        }
      }

      const pending = feeData.filter(
        (f) => f.status === "unpaid" || f.status === "overdue"
      );
      setPendingFees(pending.length);

      const open = complaints.filter((c) => c.status === "open");
      setOpenComplaints(open.length);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>

      <h2>Welcome, {userName || "User"} 👋</h2>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* ===== CARDS ===== */}
          <div style={cardContainer}>
            <Card title="Room" value={roomNumber} color="#3b82f6" icon={<FaBed />} />
            <Card title="Pending Fees" value={pendingFees} color="#f59e0b" icon={<FaMoneyBillWave />} />
            <Card title="Open Complaints" value={openComplaints} color="#ef4444" icon={<FaExclamationCircle />} />
          </div>

          {/* ===== FEES ===== */}
          <div style={feeContainer}>
            <h3>My Fees</h3>

            {actionableFees.length === 0 ? (
              <div style={emptyState}>
                <h4>No Pending Fees 🎉</h4>
                <p>You are all clear!</p>
              </div>
            ) : (
              actionableFees.map((fee) => (
                <div
                  key={fee._id}
                  style={{
                    ...feeCard,
                    borderLeft:
                      fee.status === "overdue"
                        ? "4px solid #ef4444"
                        : "4px solid transparent",
                  }}
                >
                  <div>
                    <strong>{fee.month.toUpperCase()}</strong> — ₹{fee.amount}
                    <br />
                    <span style={getStatusStyle(fee.status)}>
                      {fee.status}
                    </span>
                  </div>

                  <button
                    style={payButton}
                    onClick={() => {
                      setSelectedFee(fee);
                      setShowModal(true);
                    }}
                  >
                    Pay Now
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ===== MODAL ===== */}
      {showModal && selectedFee && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Confirm Payment</h3>

            <p><strong>Month:</strong> {selectedFee.month}</p>
            <p><strong>Amount:</strong> ₹ {selectedFee.amount}</p>
            <p><strong>Due:</strong> {new Date(selectedFee.dueDate).toLocaleDateString()}</p>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              
              <button
                style={cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  setSelectedFee(null);
                }}
              >
                Cancel
              </button>

              <button
                style={confirmBtn}
                disabled={paying}
                onClick={() => {
                  handlePayment(selectedFee);
                  setShowModal(false);
                  setSelectedFee(null);
                }}
              >
                {paying ? "Processing..." : "Confirm & Pay"}
              </button>

            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
};

/* ===== COMPONENT ===== */

const Card = ({ title, value, color, icon }) => (
  <div style={{ ...cardStyle, background: color }}>
    {icon}
    <h3>{title}</h3>
    <p style={numberStyle}>{value}</p>
  </div>
);

/* ===== STYLES ===== */

const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const cardStyle = {
  padding: "25px",
  borderRadius: "12px",
  color: "white",
  textAlign: "center",
};

const numberStyle = {
  fontSize: "28px",
  fontWeight: "bold",
};

const feeContainer = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
};

const feeCard = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px",
  borderBottom: "1px solid #eee",
  alignItems: "center",
};

const payButton = {
  background: "#22c55e",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
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
};

const cancelBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const confirmBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
};

const emptyState = {
  textAlign: "center",
  padding: "20px",
  color: "#6b7280",
};

const getStatusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  background:
    status === "paid"
      ? "#dcfce7"
      : status === "overdue"
      ? "#fee2e2"
      : "#fef3c7",
});

export default StudentDashboard;