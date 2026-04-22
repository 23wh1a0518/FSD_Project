import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showComments, setShowComments] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
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
      const data = res.data.data;
      setComplaints(data);
      setStats({
        total: data.length,
        pending: data.filter((c) => c.status === "Pending").length,
        inProgress: data.filter((c) => c.status === "In Progress").length,
        resolved: data.filter((c) => c.status === "Resolved").length,
      });
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

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/complaints/${complaintId}/status`,
        { status: newStatus }
      );
      fetchComplaints({ search, status: statusFilter, category: categoryFilter });
    } catch (err) {
      setError("Failed to update status.");
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

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${complaintId}`);
      fetchComplaints({ search, status: statusFilter, category: categoryFilter });
    } catch (err) {
      setError("Failed to delete complaint.");
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>🛡️ Admin Dashboard</h2>
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
                        backgroundColor: notif.isRead ? "#fff" : "#e3f2fd",
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
          <span style={styles.welcomeText}>Welcome, {user?.name || "Admin"}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #2196F3" }}>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Complaints</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #FF9800" }}>
            <h3 style={styles.statNumber}>{stats.pending}</h3>
            <p style={styles.statLabel}>Pending</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #2196F3" }}>
            <h3 style={styles.statNumber}>{stats.inProgress}</h3>
            <p style={styles.statLabel}>In Progress</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #4CAF50" }}>
            <h3 style={styles.statNumber}>{stats.resolved}</h3>
            <p style={styles.statLabel}>Resolved</p>
          </div>
        </div>

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
          <button
            style={styles.searchBtn}
            onClick={() =>
              fetchComplaints({ search, status: statusFilter, category: categoryFilter })
            }
          >
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

        <h3 style={styles.sectionTitle}>
          All Complaints ({complaints.length})
        </h3>

        {error && <p style={styles.error}>{error}</p>}

        {complaints.length === 0 ? (
          <div style={styles.empty}>
            <p>No complaints found!</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <React.Fragment key={complaint._id}>
                    <tr style={styles.tableRow}>
                      <td style={styles.td}>
                        <strong>{complaint.title}</strong>
                        <p style={styles.tdDesc}>{complaint.description}</p>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>
                          {complaint.category || "General"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {complaint.studentName || complaint.userId?.name || "N/A"}
                      </td>
                      <td style={styles.td}>
                        <select
                          style={{
                            ...styles.statusSelect,
                            borderColor: getStatusColor(complaint.status),
                            color: getStatusColor(complaint.status),
                          }}
                          value={complaint.status}
                          onChange={(e) =>
                            handleStatusChange(complaint._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        {complaint.averageRating > 0
                          ? `${complaint.averageRating.toFixed(1)} ⭐ (${complaint.ratings?.length || 0})`
                          : "No ratings"}
                      </td>
                      <td style={styles.td}>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button
                            style={styles.commentToggleBtn}
                            onClick={() =>
                              setShowComments({
                                ...showComments,
                                [complaint._id]: !showComments[complaint._id],
                              })
                            }
                          >
                            💬 {complaint.comments?.length || 0}
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDelete(complaint._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {showComments[complaint._id] && (
                      <tr>
                        <td colSpan="7" style={styles.commentsRow}>
                          <strong style={{ fontSize: "13px" }}>
                            Comments ({complaint.comments?.length || 0}):
                          </strong>
                          {complaint.comments?.length === 0 ? (
                            <p style={styles.noComments}>No comments yet.</p>
                          ) : (
                            complaint.comments?.map((c, i) => (
                              <div key={i} style={styles.commentItem}>
                                <strong>{c.userName}:</strong> {c.text}
                              </div>
                            ))
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#1565C0",
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  headerTitle: { color: "white", margin: 0, fontSize: "22px" },
  headerRight: { display: "flex", alignItems: "center", gap: "15px" },
  welcomeText: { color: "white", fontSize: "15px" },
  logoutBtn: {
    padding: "8px 18px",
    backgroundColor: "white",
    color: "#1565C0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    overflowY: "auto",
  },
  notifTitle: {
    padding: "15px",
    margin: 0,
    borderBottom: "1px solid #eee",
    color: "#333",
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
    cursor: "pointer",
  },
  content: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "25px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statNumber: { margin: 0, fontSize: "28px", color: "#333" },
  statLabel: { margin: "5px 0 0", fontSize: "13px", color: "#888" },
  filterBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    flex: 1,
    minWidth: "200px",
  },
  filterSelect: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  searchBtn: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  clearBtn: {
    padding: "10px 20px",
    backgroundColor: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  sectionTitle: { color: "#333", margin: "0 0 15px" },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "#f8f9fa" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    borderBottom: "2px solid #eee",
  },
  tableRow: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#333", verticalAlign: "top" },
  tdDesc: { margin: "4px 0 0", fontSize: "12px", color: "#888", maxWidth: "200px" },
  categoryBadge: {
    padding: "3px 10px",
    backgroundColor: "#e3f2fd",
    color: "#1565C0",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "2px solid",
    backgroundColor: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionBtns: { display: "flex", gap: "8px", flexWrap: "wrap" },
  commentToggleBtn: {
    padding: "5px 10px",
    backgroundColor: "#f0f2f5",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  deleteBtn: {
    padding: "5px 10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    border: "1px solid #ef9a9a",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  commentsRow: {
    padding: "12px 20px",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #eee",
  },
  noComments: { color: "#999", fontSize: "13px", margin: "5px 0 0" },
  commentItem: {
    padding: "6px 10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "6px",
    marginTop: "6px",
    fontSize: "13px",
  },
  empty: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
    backgroundColor: "white",
    borderRadius: "10px",
  },
  error: { color: "red", textAlign: "center" },
};

export default AdminDashboard;