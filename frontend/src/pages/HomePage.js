import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎓 Campus Complaint System</h1>
        <p style={styles.subtitle}>
          Submit and track your campus complaints easily
        </p>
        <div style={styles.buttonGroup}>
          <button
            style={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            style={styles.registerBtn}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "400px",
  },
  title: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "30px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  loginBtn: {
    padding: "12px 30px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  registerBtn: {
    padding: "12px 30px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default HomePage;