import React from 'react';

function ButtonContainer({
  onMeasure,
  handleReset,
  handleSubmit,
  isOpenEnabled,
  isSendEnabled,
  measurementRound,
  maxMeasurementRound
}) {
  return (
    <div style={styles.buttonContainer}>
      {/* Close Button */}
      <button
        style={{
          ...styles.button,
          backgroundColor: !isOpenEnabled && measurementRound <= maxMeasurementRound && !isSendEnabled ? "#a8d8ff" : "#d3d3d3",
          cursor: !isOpenEnabled && measurementRound <= maxMeasurementRound && !isSendEnabled ? "pointer" : "not-allowed",
        }}
        onClick={() => !isOpenEnabled && onMeasure("close")}
        disabled={isOpenEnabled || measurementRound > maxMeasurementRound || isSendEnabled}
      >
        측정(Close)
      </button>

      {/* Open Button */}
      <button
        style={{
          ...styles.button,
          backgroundColor: isOpenEnabled && measurementRound <= maxMeasurementRound && !isSendEnabled ? "#a8d8ff" : "#d3d3d3",
          cursor: isOpenEnabled && measurementRound <= maxMeasurementRound && !isSendEnabled ? "pointer" : "not-allowed",
        }}
        onClick={() => isOpenEnabled && onMeasure("open")}
        disabled={!isOpenEnabled || measurementRound > maxMeasurementRound || isSendEnabled}
      >
        측정(Open)
      </button>

      {/* Reset Button */}
      <button style={styles.button} onClick={handleReset}>
        리셋(Reset)
      </button>

      {/* Send Button */}
      <button
        style={{
          ...styles.resultButton,
          backgroundColor: isSendEnabled ? "#a8d8ff" : "#d3d3d3",
          cursor: isSendEnabled ? "pointer" : "not-allowed",
        }}
        disabled={!isSendEnabled}
        onClick={handleSubmit}
      >
        전송(Send)
      </button>
    </div>
  );
}

export default ButtonContainer;

const styles = {
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    marginBottom: "20px",
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
