import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { apiGet, apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import { FaBed, FaMoneyBillWave, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const StudentDashboard = () => {

  const [loading, setLoading] = useState(true);

  const [roomNumber, setRoomNumber] = useState("Not Assigned");
  const [fees, setFees] = useState([]);
  const [pendingFees, setPendingFees] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);

  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paying, setPaying] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [student, feeData, complaints] = await Promise.all([
        apiGet("/api/students/me"), // keep this if not in API file
        apiGet(API.FEES.ALL),
        apiGet(API.COMPLAINTS.ALL)
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
        f => f.status === "unpaid" || f.status === "overdue"
      );
      setPendingFees(pending.length);

      const open = complaints.filter(c => c.status === "open");
      setOpenComplaints(open.length);

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* ===== PAYMENT ===== */

  const handlePayment = async () => {

    if (!paymentMethod) {
      toast.error("Select payment method");
      return;
    }

    try {
      setPaying(true);

      const transactionId = `TXN-${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;

      await apiRequest(API.FEES.ALL + `/${selectedFee._id}`, "PATCH", {
        status: "paid",
        transactionId
      });

      setFees(prev =>
        prev.map(f =>
          f._id === selectedFee._id
            ? { ...f, status: "paid", transactionId }
            : f
        )
      );

      toast.success("Payment Successful");

      setSelectedFee(null);
      setPaymentMethod("");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setPaying(false);
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

            {fees.length === 0 ? (
              <div style={emptyState}>
                <h4>No Fees Yet</h4>
                <p>Your fee records will appear here once generated</p>
              </div>
            ) : (
              fees.map(fee => (
                <div key={fee._id} style={feeCard}>

                  <div>
                    <strong>{fee.month.toUpperCase()}</strong> — ₹{fee.amount}
                    <br />

                    <span style={getStatusStyle(fee.status)}>
                      {fee.status}
                    </span>

                    {fee.transactionId && (
                      <div style={{ fontSize: "12px", color: "gray" }}>
                        TXN: {fee.transactionId}
                      </div>
                    )}
                  </div>

                  {(fee.status === "unpaid" || fee.status === "overdue") && (
                    <button
                      style={payButton}
                      onClick={() => setSelectedFee(fee)}
                    >
                      Pay Now
                    </button>
                  )}

                </div>
              ))
            )}

          </div>
        </>
      )}

      {/* ===== MODAL ===== */}
      {selectedFee && (
        <div style={modalOverlay} onClick={() => setSelectedFee(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>

            <h3>Complete Payment</h3>

            <p>Amount: ₹ {selectedFee.amount}</p>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select Method</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>

            <br /><br />

            <button
              style={{ ...payButton, opacity: paying ? 0.7 : 1 }}
              onClick={handlePayment}
              disabled={paying}
            >
              {paying ? "Processing Payment..." : "Confirm Payment"}
            </button>

            <button
              style={cancelButton}
              onClick={() => setSelectedFee(null)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </MainLayout>
  );
};