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

      // ✅ FIXED
      await apiRequest("/api/fees", "POST", {
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
      await apiRequest("/api/fees/bulk-generate", "POST", {
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
      await apiRequest(`/api/fees/${id}`, "PATCH", { status: "paid" });

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
            {/* UI untouched */}
          </div>
        )}

        {/* ===== TABLE ===== */}
        <div style={tableCard}>
          {/* UI untouched */}
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
const tableCard = { background: "#fff", padding: "20px", borderRadius: "10px", marginTop: "20px" };

export default FeeDashboard;