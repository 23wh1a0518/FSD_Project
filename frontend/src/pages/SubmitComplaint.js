import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubmitComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/complaints",
        formData
      );
      setSuccess("Complaint submitted successfully!");
      setTimeout(() => navigate("/student-dashboard"), 2000);
    } catch (err) {
      setError("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📋 Submit Complaint</h2>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <input
          style={styles.input}
          type="text"
          name="title"
          placeholder="Complaint Title"
          value={formData.title}
          onChange={handleChange}
        />
        <select
          style={styles.input}
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Academic">Academic</option>
          <option value="Hostel">Hostel</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          style={styles.textarea}
          name="description"
          placeholder="Describe your complaint..."
          value={formData.description}
          onChange={handleChange}
          rows={5}
        />
        <button style={styles.btn} onClick={handleSubmit}>
          Submit Complaint
        </button>
        <button style={styles.backBtn} onClick={() => navigate("/student-dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "10px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
  },
  btn: {
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  backBtn: {
    padding: "12px",
    backgroundColor: "#gray",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: "14px",
  },
  success: {
    color: "green",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default SubmitComplaint;