import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchComplaints();
    fetchNotifications();
  }, []);

  const fetchComplaints = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);

      const res = await axios.get(
        `http://localhost:5000/api/complaints?${params.toString()}`
      );
      setComplaints(res.data.data);
    } catch (err) {
      setError("Failed to fetch complaints.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/complaints/notifications/${user._id}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.log("Failed to fetch notifications");
    }
  };

  const handleSearch = () => {
    fetchComplaints({ search, status: statusFilter, category: categoryFilter });
  };

  const handleRating = async (complaintId, rating) => {
    try {
      await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/rate`,
        { userId: user._id, rating }
      );
      fetchComplaints({ search, status: statusFilter, category: categoryFilter });
    } catch (err) {
      setError("Failed to submit rating.");
    }
  };

  const handleAddComment = async (complaintId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/comment`,
        {
          userId: user._id,
          userName: user.name,
          text: commentText[complaintId]
        }
      );
      setCommentText({ ...commentText, [complaintId]: "" });
      fetchComplaints({ search, status: statusFilter, category: categoryFilter });
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/complaints/notifications/read",
        { userId: user._id, notificationId }
      );
      fetchNotifications();
    } catch (err) {
      console.log("Failed to mark notification as read");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "#FF9800";
    if (status === "In Progress") return "#2196F3";
    if (status === "Resolved") return "#4CAF50";
    return "#999";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderStars = (complaint) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => handleRating(complaint._id, star)}
        style={{
          cursor: "pointer",
          fontSize: "20px",
          color: star <= Math.round(complaint.averageRating) ? "#FFD700" : "#ccc"
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>🎓 Student Dashboard</h2>
        <div style={styles.headerRight}>
          {/* Notification Bell */}
          <div style={styles.bellWrapper}>
            <span
              style={styles.bell}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </span>
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <h4 style={styles.notifTitle}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={styles.noNotif}>No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      style={{
                        ...styles.notifItem,
                        backgroundColor: notif.isRead ? "#fff" : "#e3f2fd"
                      }}
                    >
                      <p style={styles.notifText}>{notif.message}</p>
                      {!notif.isRead && (
                        <button
                          style={styles.markReadBtn}
                          onClick={() => handleMarkRead(notif._id)}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <span style={styles.welcomeText}>
            Welcome, {user?.name || "Student"}!
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Search & Filter Bar */}
        <div style={styles.filterBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="🔍 Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            style={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Academic">Academic</option>
            <option value="Hostel">Hostel</option>
            <option value="Transport">Transport</option>
            <option value="Other">Other</option>
          </select>
          <button style={styles.searchBtn} onClick={handleSearch}>
            Search
          </button>
          <button
            style={styles.clearBtn}
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setCategoryFilter("");
              fetchComplaints();
            }}
          >
            Clear
          </button>
        </div>

        <div style={styles.topBar}>
          <h3 style={styles.sectionTitle}>
            My Complaints ({complaints.length})
          </h3>
          <button
            style={styles.submitBtn}
            onClick={() => navigate("/submit-complaint")}
          >
            + Submit New Complaint
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {complaints.length === 0 ? (
          <div style={styles.empty}>
            <p>No complaints found!</p>
          </div>
        ) : (
          <div style={styles.complaintsGrid}>
            {complaints.map((complaint) => (
              <div key={complaint._id} style={styles.card}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{complaint.title}</h4>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(complaint.status)
                    }}
                  >
                    {complaint.status}
                  </span>
                </div>

                <p style={styles.cardCategory}>
                  📁 {complaint.category || "General"}
                </p>
                <p style={styles.cardDescription}>{complaint.description}</p>
                <p style={styles.cardDate}>
                  🕒 {new Date(complaint.createdAt).toLocaleDateString()}
                </p>

                {/* Star Rating */}
                <div style={styles.ratingSection}>
                  <span style={styles.ratingLabel}>Rate: </span>
                  {renderStars(complaint)}
                  <span style={styles.avgRating}>
                    {complaint.averageRating > 0
                      ? ` Avg: ${complaint.averageRating.toFixed(1)} ⭐`
                      : " No ratings yet"}
                  </span>
                </div>

                {/* Comments Section */}
                <div style={styles.commentsSection}>
                  <button
                    style={styles.toggleCommentBtn}
                    onClick={() =>
                      setShowComments({
                        ...showComments,
                        [complaint._id]: !showComments[complaint._id]
                      })
                    }
                  >
                    💬 Comments ({complaint.comments?.length || 0})
                  </button>

                  {showComments[complaint._id] && (
                    <div style={styles.commentsList}>
                      {complaint.comments?.length === 0 ? (
                        <p style={styles.noComments}>No comments yet</p>
                      ) : (
                        complaint.comments?.map((comment, index) => (
                          <div key={index} style={styles.commentItem}>
                            <strong>{comment.userName}: </strong>
                            <span>{comment.text}</span>
                          </div>
                        ))
                      )}
                      <div style={styles.addComment}>
                        <input
                          style={styles.commentInput}
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText[complaint._id] || ""}
                          onChange={(e) =>
                            setCommentText({
                              ...commentText,
                              [complaint._id]: e.target.value
                            })
                          }
                        />
                        <button
                          style={styles.commentBtn}
                          onClick={() => handleAddComment(complaint._id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#4CAF50",
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  headerTitle: { color: "white", margin: 0, fontSize: "22px" },
  headerRight: { display: "flex", alignItems: "center", gap: "15px" },
  welcomeText: { color: "white", fontSize: "15px" },
  logoutBtn: {
    padding: "8px 18px",
    backgroundColor: "white",
    color: "#4CAF50",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  bellWrapper: { position: "relative" },
  bell: { fontSize: "24px", cursor: "pointer", position: "relative" },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "11px",
    fontWeight: "bold"
  },
  notificationDropdown: {
    position: "absolute",
    top: "35px",
    right: 0,
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    width: "300px",
    zIndex: 1000,
    maxHeight: "400px",
    overflowY: "auto"
  },
  notifTitle: {
    padding: "15px",
    margin: 0,
    borderBottom: "1px solid #eee",
    color: "#333"
  },
  noNotif: { padding: "15px", color: "#666", textAlign: "center" },
  notifItem: { padding: "12px 15px", borderBottom: "1px solid #eee" },
  notifText: { margin: "0 0 5px 0", fontSize: "13px", color: "#333" },
  markReadBtn: {
    padding: "3px 8px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "11px",
    cursor: "pointer"
  },
  content: { padding: "30px", maxWidth: "1000px", margin: "0 auto" },
  filterBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  searchInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
    minWidth: "200px"
  },
  filterSelect: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px"
  },
  searchBtn: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  clearBtn: {
    padding: "10px 20px",
    backgroundColor: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  sectionTitle: { color: "#333", margin: 0 },
  submitBtn: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer"
  },
  complaintsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  cardTitle: { margin: 0, color: "#333", fontSize: "16px" },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold"
  },
  cardCategory: { color: "#666", fontSize: "13px", margin: "5px 0" },
  cardDescription: { color: "#555", fontSize: "14px", margin: "8px 0" },
  cardDate: { color: "#999", fontSize: "12px", margin: "5px 0" },
  ratingSection: {
    display: "flex",
    alignItems: "center",
    margin: "10px 0",
    gap: "5px"
  },
  ratingLabel: { fontSize: "14px", color: "#555" },
  avgRating: { fontSize: "13px", color: "#666", marginLeft: "5px" },
  commentsSection: { marginTop: "10px" },
  toggleCommentBtn: {
    padding: "6px 12px",
    backgroundColor: "#f0f2f5",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px"
  },
  commentsList: { marginTop: "10px" },
  noComments: { color: "#999", fontSize: "13px" },
  commentItem: {
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    marginBottom: "5px",
    fontSize: "13px"
  },
  addComment: { display: "flex", gap: "8px", marginTop: "10px" },
  commentInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px"
  },
  commentBtn: {
    padding: "8px 15px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px"
  },
  empty: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
    backgroundColor: "white",
    borderRadius: "10px"
  },
  error: { color: "red", textAlign: "center" }
};

export default StudentDashboard;