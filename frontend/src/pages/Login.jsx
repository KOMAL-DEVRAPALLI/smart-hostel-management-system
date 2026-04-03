import { useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

const LoginPage = () => {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      setError("All fields required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Invalid email format");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const data = await apiRequest("/auth/login", "POST", form);

      // ⚠️ For demo project only
      localStorage.setItem("token", data.token);

      const decoded = jwtDecode(data.token);
      localStorage.setItem("role", decoded.role);

      toast.success("Login successful");

      navigate(decoded.role === "admin" ? "/admin" : "/student");

    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>

      <div style={cardStyle}>

        <h2 style={titleStyle}>Hostel Management</h2>
        <p style={subtitleStyle}>Login to continue</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleLogin}>

          <input
            name="email"
            style={inputStyle}
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
};

/* ===== STYLES ===== */

const pageStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #3b82f6, #1e40af)"
};

const cardStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "16px",
  width: "350px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  textAlign: "center"
};

const titleStyle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700"
};

const subtitleStyle = {
  marginTop: "5px",
  marginBottom: "25px",
  fontSize: "14px",
  color: "#6b7280"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #d1d5db"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "600"
};

const errorStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "8px",
  borderRadius: "6px",
  marginBottom: "15px",
  fontSize: "13px"
};

export default LoginPage;