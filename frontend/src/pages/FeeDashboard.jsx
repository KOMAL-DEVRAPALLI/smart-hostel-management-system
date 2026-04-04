import React, { useEffect, useState } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import {
  tableStyle,
  thStyle,
  tdStyle,
  buttonDanger,
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
    const data = await apiGet("/api/students");
    setStudents(data);
  };

  const fetchFees = async () => {
    const data = await apiGet("/api/fees");
    setFees(data);
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

      await apiRequest("/api/fees", "POST", {
        studentId,
        month,
        amount
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

      await apiRequest("/fees/bulk-generate", "POST", {
        month: bulkMonth.trim().toLowerCase(),
        amount: bulkAmount.trim().toLowerCase()
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

  /* ===== MARK PAID ===== */

  const markPaid = async (id) => {
    try {
      await apiRequest(`/fees/${id}`, "PATCH", { status: "paid" });
      toast.success("Marked as paid");
      fetchFees();
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ===== SORT + FILTER ===== */

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

  const getStatusStyle = (status) => {

    if (status === "paid") {
      return {
        background: "#dcfce7",
        color: "#166534",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px"
      };
    }

    if (status === "overdue") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold"
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "12px"
    };
  };

  /* ===== UI ===== */

  return (
    <MainLayout>

      <div style={pageWrapper}>

        <h2>Fee Management</h2>

        {/* ===== STATS ===== */}
        <div style={statsContainer}>
          <div style={{ ...statCard, background: "#3b82f6" }}>Total: {total}</div>
          <div style={{ ...statCard, background: "#22c55e" }}>Paid: {paid}</div>
          <div style={{ ...statCard, background: "#f59e0b" }}>Unpaid: {unpaid}</div>
          <div style={{ ...statCard, background: "#ef4444" }}>Overdue: {overdue}</div>
        </div>

        {/* ===== FORMS ===== */}
        {role === "admin" && (
          <div style={formWrapper}>

            <div style={formCard}>
              <h3>Bulk Fee</h3>

              <input style={inputStyle} placeholder="Month"
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
              />

              <input style={inputStyle} placeholder="Amount"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />

              <button style={buttonPrimary} onClick={handleBulkGenerate}>
                Generate All
              </button>
            </div>

            <div style={formCard}>
              <h3>Single Fee</h3>

              <select style={inputStyle}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <input style={inputStyle} placeholder="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />

              <input style={inputStyle} placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button style={buttonPrimary} onClick={handleAddFee}>
                Generate Fee
              </button>
            </div>

          </div>
        )}

        {/* ===== TABLE ===== */}
        <div style={tableCard}>

          <h3>Fee Records</h3>

          <select style={inputStyle}
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

                  <tr>
                    <td colSpan="6" style={groupHeader}>
                      👤 {student}
                    </td>
                  </tr>

                  {studentFees.map((fee, index) => (

                    <tr key={fee._id} style={getRowStyle(index)}>

                      <td style={{ ...tdStyle, paddingLeft: "20px" }}></td>

                      <td style={tdStyle}>
                        {fee.month.charAt(0).toUpperCase() + fee.month.slice(1)}
                      </td>

                      <td style={tdStyle}>₹ {fee.amount}</td>

                      <td style={tdStyle}>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>

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

/* ===== STYLES ===== */

const pageWrapper = { maxWidth: "1200px", margin: "0 auto" };

const statsContainer = { display: "flex", gap: "15px", marginBottom: "20px" };

const statCard = { flex: 1, padding: "15px", borderRadius: "10px", color: "white", textAlign: "center" };

const formWrapper = { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" };

const formCard = {
  flex: 1,
  minWidth: "300px",
  padding: "20px",
  borderRadius: "10px",
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #ccc" };

const tableCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  marginTop: "20px"
};

const groupHeader = {
  background: "#f1f5f9",
  fontWeight: "600",
  padding: "12px",
  borderLeft: "4px solid #3b82f6"
};

const getRowStyle = (index) => ({
  background: index % 2 === 0 ? "#ffffff" : "#f9fafb"
});

export default FeeDashboard;