import React from 'react';

function Header({ headerText }) {
  return (
    <div style={styles.header}>
      <h1 style={styles.headerText}>{headerText}</h1>
    </div>
  );
}

export default Header;

const styles = {
  header: {
    backgroundColor: "#a8d8ff",
    width: "100%",
    padding: "15px 0",
    textAlign: "center",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  headerText: {
    fontSize: "1rem",
    color: "#ffffff",
    margin: 0,
  },
};
