import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBed,
  FaExclamationCircle,
  FaHome,
  FaMoneyBill
} from "react-icons/fa";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

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