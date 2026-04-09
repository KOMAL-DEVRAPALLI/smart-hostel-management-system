import { useState } from "react";
import { apiRequest } from "../services/api";
import { API } from "../services/apiRoutes";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";
import { FaUserPlus } from "react-icons/fa";
import {
  inputStyle,
  buttonPrimary
} from "../styles/uiStyles";

const AddStudentPage = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, phone, email, password } = formData;

    if (!name || !phone || !email || !password) {
      toast.error("All fields are required");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone must be 10 digits");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // ✅ CENTRALIZED API
      await apiRequest(API.STUDENTS.ALL, "POST", formData);

      toast.success("Student added successfully");
      setFormData("")
      navigate("/students");

    } catch (error) {
      console.error(error); // ✅ DON'T HIDE ERRORS
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>

      <div style={styles.card}>

        <button
          style={styles.backBtn}
          onClick={() => navigate("/students")}
        >
          ← Back to Students
        </button>

        <h2 style={styles.title}>
          <FaUserPlus style={{ marginRight: "8px" }} />
          Add Student
        </h2>

        <hr />

        <form onSubmit={handleSubmit}>

          <input
            style={inputStyle}
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            style={{
              ...buttonPrimary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Student"}
          </button>

        </form>

      </div>

    </MainLayout>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginTop: "20px",
    maxWidth: "420px"
  },
  backBtn: {
    background: "#e5e7eb",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "12px"
  },
  title: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px"
  }
};

export default AddStudentPage;