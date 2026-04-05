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
import { API } from "../services/apiRoutes";

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
    } catch (err) {
      toast.error("Failed to fetch students")
    }
  };

  const fetchFees = async () => {
    try {
      const data = await apiGet(API.FEES.ALL);
      setFees(data);
    } catch (err) {
      toast.error("Failed to fetch fees");
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

      // ✅ FIXED
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

      // ✅ FIXED
      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: bulkMonth.trim().toLowerCase(),
        amount: Number(bulkAmount)
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
      // ✅ FIXED
      await apiRequest(`${API.FEES.ALL}/${id}`, "PATCH", { status: "paid" });

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

  

  /* ===== STATS ===== */

  const total = fees.length;
  const paid = fees.filter(f => f.status === "paid").length;
  const unpaid = fees.filter(f => f.status === "unpaid").length;
  const overdue = fees.filter(f => f.status === "overdue").length;
<input
  style={input}
  type="month"
  value={month}
  onChange={(e) => setMonth(e.target.value)}
/>

  /* ===== UI ===== */

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

        {/* ===== FORMS ===== */}
        {role === "admin" && (
          <div style={forms}>

            <div style={box}>
              <h3>Bulk Billing</h3>

              <input
                style={input}
                type="month"
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
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select User</option>
                {students.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <input
                style={input}
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <input
                style={input}
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button style={btn} onClick={handleAddFee}>
                Generate Bill
              </button>
            </div>

          </div>
        )}

        {/* ===== TABLE ===== */}
        <div style={box}>

          <h3>Billing Records</h3>

          <select style={input} value={filter} onChange={(e) => setFilter(e.target.value)}>
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
                <th style={th}>Due Date</th>
                <th style={th}>Status</th>
                {role === "admin" && <th style={th}>Action</th>}
              </tr>
            </thead>

            <tbody>
  {Object.entries(groupedFees).map(([student, records]) => (
    <React.Fragment key={student}>
      
      {/* Student Header */}
      <tr>
        <td colSpan="6" style={{ fontWeight: "bold", background: "#f3f4f6" }}>
          {student}
        </td>
      </tr>

      {/* Student Records */}
      {records.map(b => (
        <tr key={b._id}>
          <td style={td}></td>
          <td style={td}>{b.month}</td>
          <td style={td}>₹ {b.amount}</td>
          <td style={td}>
            {new Date(b.dueDate).toLocaleDateString()}
          </td>
          <td style={td}>
            <span style={statusStyle(b.status)}>
              {b.status}
            </span>
          </td>

          {role === "admin" && (
            <td style={td}>
              {b.status !== "paid" && (
                <button style={btnSmall} onClick={() => markPaid(b._id)}>
                  Mark Paid
                </button>
              )}
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
export default FeeDashboard;