import React from 'react';

function ResultText({ resultText }) {
  return (
    <div style={styles.resultText}>
      {resultText.map((result, index) => (
        <div key={index}>{result}</div>
      ))}
    </div>
  );
}

export default ResultText;

const styles = {
  resultText: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
    margin: "10px 0",
    height: "100px",
    textAlign: "center",
  },
};
