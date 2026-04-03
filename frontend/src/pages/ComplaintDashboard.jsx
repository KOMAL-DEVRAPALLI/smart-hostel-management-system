import { useState, useEffect } from "react";
import { apiGet, apiRequest } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import toast from "react-hot-toast";

function ComplaintDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/api/complaints/${id}`);
      setComplaints(data);
    } catch (error) {
      toast.error(error.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  /* ===== HANDLE INPUT ===== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ===== ADD COMPLAINT ===== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("All fields required");
      return;
    }

    if (form.description.length < 10) {
      toast.error("Description too short");
      return;
    }

    try {
      setSubmitting(true);

      const newComplaint = await apiRequest("/complaints", "POST", form);

      // ✅ Optimistic update (NO refetch)
      setComplaints([newComplaint, ...complaints]);

      toast.success("Complaint submitted");

      setForm({ title: "", description: "" });

    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ===== RESOLVE ===== */

  const resolveComplaint = async (id) => {
    try {
      await apiRequest(`/complaints/${id}`, "PATCH", {
        status: "resolved"
      });

      // ✅ Update locally instead of refetch
      setComplaints(prev =>
        prev.map(c =>
          c._id === id ? { ...c, status: "resolved" } : c
        )
      );

      toast.success("Complaint resolved");

    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ===== STATUS STYLE ===== */

  const getStatusStyle = (status) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    background: status === "open" ? "#fef3c7" : "#dcfce7",
    color: status === "open" ? "#92400e" : "#166534"
  });

  return (
    <MainLayout>

      <div style={pageWrapper}>

        <h2>Complaint Management</h2>

        {/* ===== LIST ===== */}
        <div style={card}>

          <h3>Complaint List</h3>

          {loading ? (
            <p>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p>No complaints found</p>
          ) : (
            <table style={tableStyle}>

              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                  {role === "admin" && <th style={thStyle}>Action</th>}
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} style={rowStyle}>

                    <td style={tdStyle}>{c.title}</td>
                    <td style={tdStyle}>{c.description}</td>

                    <td style={tdStyle}>
                      <span style={getStatusStyle(c.status)}>
                        {c.status}
                      </span>
                    </td>

                    {role === "admin" && (
                      <td style={tdStyle}>
                        {c.status === "open" ? (
                          <button
                            style={resolveBtn}
                            onClick={() => resolveComplaint(c._id)}
                          >
                            Resolve
                          </button>
                        ) : (
                          <span style={{ color: "green" }}>✔</span>
                        )}
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>

        {/* ===== FORM ===== */}
        {role === "student" && (
          <div style={card}>

            <h3>Raise Complaint</h3>

            <form onSubmit={handleSubmit}>

              <input
                name="title"
                placeholder="Enter title"
                style={inputStyle}
                value={form.title}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Describe your issue"
                style={{ ...inputStyle, height: "80px" }}
                value={form.description}
                onChange={handleChange}
              />

              <button
                type="submit"
                style={{
                  ...submitBtn,
                  opacity: submitting ? 0.7 : 1
                }}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>

            </form>

          </div>
        )}

      </div>

    </MainLayout>
  );
}

/* ===== STYLES (same, slightly cleaned) ===== */

const pageWrapper = {
  maxWidth: "1100px",
  margin: "0 auto"
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const submitBtn = {
  background: "#3b82f6",
  color: "#fff",
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const resolveBtn = {
  background: "#22c55e",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ddd"
};

const tdStyle = {
  padding: "10px"
};

const rowStyle = {
  borderBottom: "1px solid #eee"
};

export default ComplaintDashboard;