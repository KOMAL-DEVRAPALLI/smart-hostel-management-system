import React, { useEffect, useState } from "react";
import { apiGet, apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import MainLayout from "../components/layout/MainLayout";
import {
  tableStyle,
  thStyle,
  tdStyle,
  buttonPrimary
} from "../styles/uiStyles";
import toast from "react-hot-toast";

const FeeDashboard = () => {

  const [filter, setFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  const [bulkMonth, setBulkMonth] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  /* ===== FETCH ===== */

  const fetchStudents = async () => {
    try {
      const data = await apiGet(API.STUDENTS.ALL);
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load students");
    }
  };

  const fetchFees = async () => {
    try {
      const data = await apiGet(API.FEES.ALL);
      setFees(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load fees");
    }
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  /* ===== ADD SINGLE ===== */

  const handleAddFee = async () => {
    if (!studentId || !month || !amount) {
      toast.error("All fields required");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.ALL, "POST", {
        studentId,
        month,
        amount: Number(amount)
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

  /* ===== BULK ===== */

  const handleBulkGenerate = async () => {
    if (!bulkMonth || !bulkAmount) {
      toast.error("Month and amount required");
      return;
    }

    try {
      setLoading(true);

      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: bulkMonth.trim().toLowerCase(),
        amount: Number(bulkAmount)
      });

      toast.success("Bulk fees generated");

      setBulkMonth("");
      setBulkAmount("");

      fetchFees();

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== MARK PAID ===== */

  const markPaid = async (id) => {
    try {
      await apiRequest(
        `${API.FEES.ALL}/${id}`,
        "PATCH",
        { status: "paid" }
      );

      toast.success("Marked as paid");
      fetchFees();

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  /* ===== FILTER ===== */

  const sortedFees = [...fees].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredFees = sortedFees.filter(f =>
    filter === "all" ? true : f.status === filter
  );

  /* ===== GROUP ===== */

  const groupedFees = filteredFees.reduce((acc, fee) => {
    const name = fee.studentId?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(fee);
    return acc;
  }, {});

  /* ===== STATS ===== */

  const total = fees.length;
  const paid = fees.filter(f => f.status === "paid").length;
  const unpaid = fees.filter(f => f.status === "unpaid").length;
  const overdue = fees.filter(f => f.status === "overdue").length;

  /* ===== STATUS STYLE ===== */

  const getStatusStyle = (status) => ({
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
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
    fontWeight: status === "overdue" ? "bold" : "normal"
  });

  return (
    <MainLayout>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <h2>Fee Management</h2>

        {/* ===== STATS ===== */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <div style={{ flex: 1, background: "#3b82f6", color: "white", padding: "15px" }}>Total: {total}</div>
          <div style={{ flex: 1, background: "#22c55e", color: "white", padding: "15px" }}>Paid: {paid}</div>
          <div style={{ flex: 1, background: "#f59e0b", color: "white", padding: "15px" }}>Unpaid: {unpaid}</div>
          <div style={{ flex: 1, background: "#ef4444", color: "white", padding: "15px" }}>Overdue: {overdue}</div>
        </div>

        {/* ===== FORMS ===== */}
        {role === "admin" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

            {/* BULK */}
            <div>
              <h3>Bulk Fee</h3>

              <input placeholder="Month"
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
              />

              <input placeholder="Amount"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />

              <button onClick={handleBulkGenerate}>
                Generate All
              </button>
            </div>

            {/* SINGLE */}
            <div>
              <h3>Single Fee</h3>

              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <input placeholder="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />

              <input placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button onClick={handleAddFee}>
                Generate Fee
              </button>
            </div>

          </div>
        )}

        {/* ===== TABLE ===== */}
        <div style={{ marginTop: "20px" }}>

          <h3>Fee Records</h3>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Month</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Status</th>
                {role === "admin" && <th style={thStyle}>Action</th>}
              </tr>
            </thead>

            <tbody>
              {Object.entries(groupedFees).map(([student, studentFees]) => (
                <React.Fragment key={student}>
                  {studentFees.map((fee) => (
                    <tr key={fee._id}>
                      <td style={tdStyle}>{student}</td>
                      <td style={tdStyle}>{fee.month}</td>
                      <td style={tdStyle}>₹ {fee.amount}</td>
                      <td style={tdStyle}>{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td style={tdStyle}>
                        <span style={getStatusStyle(fee.status)}>
                          {fee.status}
                        </span>
                      </td>

                      {role === "admin" && (
                        <td style={tdStyle}>
                          <button
                            style={buttonPrimary}
                            onClick={() => markPaid(fee._id)}
                          >
                            Mark Paid
                          </button>
                        </td>
                      )}

                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

        </div>

      </div>

    </MainLayout>
  );
};

export default FeeDashboard;