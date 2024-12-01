import React from 'react';

function Button({
  title,
  label,
  enable = true,
  onClick
}) {
  return (
    <div style={styles.buttonContainer}>
      {/* Close Button */}
      <button
        style={{
          ...styles.button,
          backgroundColor: enable ? "#a8d8ff" : "#d3d3d3",
        //   cursor: enable ? "pointer" : "not-allowed",
        }}
        onClick={onClick}
        disabled={!enable}
      >
         {label}
      </button>

    </div>
  );
}

export default Button;

const styles = {
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
  },
  button: {
    padding: "10px 10px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#a8d8ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  resultButton: {
    padding: "10px 10px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#a8d8ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
