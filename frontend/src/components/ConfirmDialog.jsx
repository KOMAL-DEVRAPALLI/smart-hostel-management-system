import React from "react";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>

        <h3 style={{ marginBottom: "10px" }}>{title}</h3>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>

          <button style={cancelBtn} onClick={onCancel}>
            Cancel
          </button>

          <button style={confirmBtn} onClick={onConfirm}>
            Confirm
          </button>

        </div>

      </div>
    </div>
  );
};

/* ===== STYLES ===== */

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "350px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const cancelBtn = {
  background: "#e5e7eb",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

const confirmBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default ConfirmDialog;