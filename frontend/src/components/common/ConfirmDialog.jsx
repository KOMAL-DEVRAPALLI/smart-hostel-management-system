import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  width: "320px",
  textAlign: "center",
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
};

const buttonRow = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "space-between"
};

const cancelBtn = {
  padding: "8px 14px",
  border: "none",
  background: "#9ca3af",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer"
};

const confirmBtn = {
  padding: "8px 14px",
  border: "none",
  background: "#dc2626",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer"
};

const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel
}) => {

  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        <h3>{title}</h3>
        <p>{message}</p>

        <div style={buttonRow}>

          <button
            style={cancelBtn}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            style={confirmBtn}
            onClick={onConfirm}
          >
            Confirm
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;