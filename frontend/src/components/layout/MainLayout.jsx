import { NavLink, useNavigate } from "react-router-dom";
import { FaUsers, FaBed, FaMoneyBillWave, FaExclamationCircle , FaHome, FaMoneyBill} from "react-icons/fa";

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

        <h3 style={{ marginBottom: "20px" }}>
          Hostel Admin
        </h3>

        {/* Dashboard */}
        <NavLink
          to={role === "admin" ? "/admin" : "/student"}
          style={navStyle}
        >
          <FaHome/>  Dashboard
        </NavLink>
    <hr style={{ margin: "20px 0", opacity: 0.2 }} />

        {/* Admin Only Links */}
        {role === "admin" && (
          <>
            <NavLink to="/students" style={navStyle}>
             <FaUsers/>  Students
            </NavLink>
<hr style={{ margin: "20px 0", opacity: 0.2 }} />
            <NavLink to="/rooms" style={navStyle}>
              <FaBed/>  Rooms
            </NavLink>
          </>
        )}

<hr style={{ margin: "20px 0", opacity: 0.2 }} />
        {/* Shared Links */}
        <NavLink to="/fees" style={navStyle}>
        <FaMoneyBill/>  {role === "admin" ? "Fees" : " My Fees"}
        </NavLink>
<hr style={{ margin: "20px 0", opacity: 0.2 }} />
        <NavLink to="/complaints" style={navStyle}>
        <FaExclamationCircle/>  {role === "admin" ? "Complaints" : " My Complaints"}
        </NavLink>


        <button
          onClick={handleLogout}
          style={logoutButton}
        >
          Logout
        </button>

      </div>


      {/* ===== MAIN CONTENT ===== */}
      <div style={contentStyle}>

        {/* Top header */}
        <div style={headerStyle}>
          <h2>Hostel Management System</h2>
        </div>

        <div style={{ padding: "20px" }}>
          {children}
        </div>

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
  overflowY: "auto"
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

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "10px",
  borderRadius: "6px",
  color: "white",
  background: isActive ? "#2563eb" : "#1e293b"
});

const logoutButton = {
  marginTop: "auto",
  padding: "10px",
  background: "#dc2626",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer"
};

export default MainLayout;