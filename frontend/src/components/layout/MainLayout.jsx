import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBed,
  FaExclamationCircle,
  FaHome,
  FaMoneyBill
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FaBell } from "react-icons/fa";
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"], // 👈 IMPORTANT FIX
});
const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [notifications, setNotifications] = useState([]);
const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

useEffect(() => {
  socket.on("connect", () => {
    // console.log("✅ CONNECTED:", socket.id);
  });

  socket.on("paymentSuccess", (data) => {
    setNotifications((prev) => [
      { message: data.message },
      ...prev
    ]);
  });

  socket.on("complaintResolved", (data) => {
    setNotifications((prev) => [
      { message: data.message },
      ...prev
    ]);
  });

  return () => {
    socket.off("paymentSuccess");
    socket.off("complaintResolved");
  };
}, []);
  return (
    <div style={layoutStyle}>

      {/* ===== SIDEBAR ===== */}
      <div style={sidebarStyle}>

        {/* TOP SECTION */}
        <div>
          <h3 style={{ marginBottom: "25px" }}>Hostel Admin</h3>

          <NavLink
            to={role === "admin" ? "/admin" : "/student"}
            style={({ isActive }) => ({
              ...menuItem,
              background: isActive ? "#2563eb" : "#1e293b"
            })}
          >
            <FaHome /> Dashboard
          </NavLink>

          {role === "admin" && (
            <>
              <NavLink
                to="/students"
                style={({ isActive }) => ({
                  ...menuItem,
                  background: isActive ? "#2563eb" : "#1e293b"
                })}
              >
                <FaUsers /> Students
              </NavLink>

              <NavLink
                to="/rooms"
                style={({ isActive }) => ({
                  ...menuItem,
                  background: isActive ? "#2563eb" : "#1e293b"
                })}
              >
                <FaBed /> Rooms
              </NavLink>
            </>
          )}

          <NavLink
            to="/fees"
            style={({ isActive }) => ({
              ...menuItem,
              background: isActive ? "#2563eb" : "#1e293b"
            })}
          >
            <FaMoneyBill /> {role === "admin" ? "Fees" : "My Fees"}
          </NavLink>

          <NavLink
            to="/complaints"
            style={({ isActive }) => ({
              ...menuItem,
              background: isActive ? "#2563eb" : "#1e293b"
            })}
          >
            <FaExclamationCircle />{" "}
            {role === "admin" ? "Complaints" : "My Complaints"}
          </NavLink>
        </div>

        {/* BOTTOM SECTION */}
        <button onClick={handleLogout} style={logoutButton}>
          Logout
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={contentStyle}>
        <div style={headerStyle}>
  <h2>Hostel Management System</h2>

  <div style={{ position: "relative" }}>
    <FaBell
      size={20}
      style={{ cursor: "pointer" }}
      onClick={() => setShowDropdown(!showDropdown)}
    />

    {notifications.length > 0 && (
      <span style={badgeStyle}>{notifications.length}</span>
    )}

    {showDropdown && (
      <div style={dropdownStyle}>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((n, i) => (
            <div key={i} style={notificationItem}>
              {n.message}
            </div>
          ))
        )}
      </div>
    )}
  </div>
</div>

        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const layoutStyle = {
  display: "flex",
  height: "100vh",
  fontFamily: "Arial, sans-serif"
};

const sidebarStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: "220px",
  background: "#0f172a",
  color: "white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflowY: "auto"
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 15px",
  marginBottom: "12px",
  borderRadius: "8px",
  color: "white",
  textDecoration: "none",
  transition: "0.2s"
};
const badgeStyle = {
  position: "absolute",
  top: "-5px",
  right: "-5px",
  background: "red",
  color: "white",
  borderRadius: "50%",
  fontSize: "10px",
  padding: "3px 6px"
};

const dropdownStyle = {
  position: "absolute",
  top: "30px",
  right: 0,
  width: "250px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  padding: "10px",
  zIndex: 100
};

const notificationItem = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  fontSize: "14px"
};
const contentStyle = {
  flex: 1,
  background: "#f1f5f9",
  display: "flex",
  flexDirection: "column",
  marginLeft: "220px",
  padding: "20px"
};

const headerStyle = {
  background: "white",
  padding: "15px 20px",
  borderBottom: "1px solid #e2e8f0"
};

const logoutButton = {
  padding: "12px",
  background: "#dc2626",
  border: "none",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer"
};

export default MainLayout;