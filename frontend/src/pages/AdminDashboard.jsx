import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { apiGet, apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import {
  FaUsers,
  FaBed,
  FaMoneyBillWave,
  FaExclamationCircle
} from "react-icons/fa";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie
} from "recharts";
import { ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [chartData, setChartData] = useState(null);

  const [stats, setStats] = useState({
    students: 0,
    rooms: 0,
    unpaid: 0,
    complaints: 0
  });

  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      setLoading(true);

      // ✅ USING CENTRALIZED API ROUTES
      const [students, rooms, fees, complaints] = await Promise.all([
        apiGet(API.STUDENTS.ALL),
        apiGet(API.ROOMS.ALL),
        apiGet(API.FEES.ALL),
        apiGet(API.COMPLAINTS.ALL)
      ]);

      const activeRooms = rooms.filter(r => r.status === "active").length;
      const unpaidFees = fees.filter(f => f.status === "unpaid").length;
      const openComplaints = complaints.filter(c => c.status === "open").length;

      setStats({
        students: students.length,
        rooms: activeRooms,
        unpaid: unpaidFees,
        complaints: openComplaints
      });

      generateInsights(rooms, fees, complaints);
const dashboard = await apiGet(API.DASHBOARD.ALL)
setChartData(dashboard)
    } catch (error) {
      console.error(error); // ✅ DON'T HIDE ERRORS
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* ===== SMART INSIGHTS ===== */

  const generateInsights = (rooms, fees, complaints) => {
    const list = [];

    const overdue = fees.filter(f => f.status === "overdue");
    if (overdue.length > 0) {
      list.push(`⚠️ ${overdue.length} overdue fees`);
    }

    const highOccupancy = rooms.filter(
      r => r.capacity && (r.occupiedCount / r.capacity) >= 0.85
    );

    if (highOccupancy.length > 0) {
      list.push(`⚠️ ${highOccupancy.length} rooms near full capacity`);
    }

    const open = complaints.filter(c => c.status === "open");
    if (open.length > 5) {
      list.push(`🚨 High complaint load (${open.length})`);
    }

    if (list.length === 0) {
      list.push("✅ All systems running smoothly");
    }

    setInsights(list);
  };

  /* ===== ACTIONS ===== */

  const confirmAutoAllocate = async () => {
    try {
      setLoadingAction(true);

      const res = await apiRequest(API.STUDENTS.AUTO_ALLOCATE, "POST");

      toast.success(res.message || "Auto allocation completed");
      loadStats();

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingAction(false);
      setConfirmOpen(false);
    }
  };

  const handleGenerateAllFees = async () => {
    try {
      const currentMonth = new Date().toLocaleString("default", {
        month: "long"
      });

      await apiRequest(API.FEES.BULK_GENERATE, "POST", {
        month: currentMonth,
        amount: 5000
      });

      toast.success("Fee generated");
      loadStats();

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <MainLayout>
      <div style={headerSection}>
        <h1 style={pageTitle}>Admin Dashboard</h1>
        <p style={subtitle}>
          Overview of hostel management system
        </p>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* ===== STATS ===== */}
          <div style={cardContainer}>
            <StatCard title="Total Students" value={stats.students} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" icon={<FaUsers size={28} />} />
            <StatCard title="Active Rooms" value={stats.rooms} gradient="linear-gradient(135deg, #22c55e, #16a34a)" icon={<FaBed size={28} />} />
            <StatCard title="Unpaid Fees" value={stats.unpaid} gradient="linear-gradient(135deg, #f59e0b, #d97706)" icon={<FaMoneyBillWave size={28} />} />
            <StatCard title="Open Complaints" value={stats.complaints} gradient="linear-gradient(135deg, #ef4444, #dc2626)" icon={<FaExclamationCircle size={28} />} />
          </div>

            {chartData && (
  <div style={{ marginTop: "30px", background: "#fff", padding: "20px", borderRadius: "10px" }}>
    <h3>Monthly Fee Collection</h3>

    <ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData.monthlyFees}>
      <XAxis dataKey="_id" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" stroke="#3b82f6" />
    </LineChart>
    </ResponsiveContainer>
  </div>
)}
{chartData && (
  <div style={{ marginTop: "30px", background: "#fff", padding: "20px", borderRadius: "10px" }}>
    <h3>Fee Status</h3>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[
            { name: "Paid", value: Number(chartData.paidFees || 0) },
            { name: "Unpaid", value: Number(chartData.unpaidFees || 0) }
          ]}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#3b82f6"
          label
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)}
          {/* ===== INSIGHTS ===== */}
          <div style={insightContainer}>
            <h3>Smart Insights</h3>
            {insights.map((item, index) => (
              <div key={index} style={insightCard}>
                {item}
              </div>
            ))}
          </div>

          {/* ===== ACTIONS ===== */}
          <div style={actionContainer}>
            <h3>⚡ Smart Actions</h3>

            <div style={actionButtons}>
              <button
                style={actionBtn}
                onClick={() => setConfirmOpen(true)}
                disabled={loadingAction}
              >
                {loadingAction ? "Processing..." : "Auto Allocate All Students"}
              </button>

              <button
                style={actionBtn}
                onClick={handleGenerateAllFees}
              >
                Generate Monthly Fees
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Auto Allocate Students"
        message="Are you sure you want to allocate all students automatically?"
        onConfirm={confirmAutoAllocate}
        onCancel={() => setConfirmOpen(false)}
      />
    </MainLayout>
  );
};

/* ===== COMPONENT ===== */

const StatCard = ({ title, value, gradient, icon }) => (
  <div style={{ ...cardStyle, background: gradient }}>
    <div style={iconWrapper}>{icon}</div>
    <h3 style={cardTitle}>{title}</h3>
    <p style={numberStyle}>{value}</p>
  </div>
);

/* ===== STYLES ===== */

const actionContainer = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px"
};

const actionButtons = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap"
};

const actionBtn = {
  background: "#3b82f6",
  color: "#fff",
  padding: "10px 15px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const headerSection = { marginBottom: "25px" };

const pageTitle = { margin: 0, fontSize: "28px", fontWeight: "700" };

const subtitle = { marginTop: "5px", color: "#6b7280" };

const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px"
};

const cardStyle = {
  padding: "25px",
  borderRadius: "12px",
  color: "white",
  textAlign: "center"
};

const iconWrapper = {
  background: "rgba(255,255,255,0.2)",
  padding: "12px",
  borderRadius: "50%"
};

const cardTitle = { margin: 0, fontSize: "16px" };

const numberStyle = { fontSize: "32px", fontWeight: "bold" };

const insightContainer = {
  marginTop: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px"
};

const insightCard = {
  background: "#fef2f2",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px"
};

export default AdminDashboard;