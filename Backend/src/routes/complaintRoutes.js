const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

// ✅ GET all complaints with search & filter
router.get("/", async (req, res) => {
  try {
    const { search, status, category } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ data: complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST submit new complaint
router.post("/", async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT update status — creates notification for student
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Create notification for the student
    const notification = new Notification({
      userId: complaint.userId,
      message: `Your complaint "${complaint.title}" status changed to: ${status}`,
      isRead: false,
    });
    await notification.save();

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST rate a complaint — creates notification for admin
router.post("/:id/rate", async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Add or update rating
    const existingIndex = complaint.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (existingIndex > -1) {
      complaint.ratings[existingIndex].rating = rating;
    } else {
      complaint.ratings.push({ userId, rating });
    }

    // Calculate average
    const total = complaint.ratings.reduce((sum, r) => sum + r.rating, 0);
    complaint.averageRating = total / complaint.ratings.length;
    await complaint.save();

    // Notify ALL admins
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin._id,
        message: `Complaint "${complaint.title}" received a ${rating}⭐ rating.`,
        isRead: false,
      });
      await notification.save();
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST add comment — creates notification for admin
router.post("/:id/comment", async (req, res) => {
  try {
    const { userId, userName, text } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.comments.push({ userId, userName, text, createdAt: new Date() });
    await complaint.save();

    // Notify ALL admins
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin._id,
        message: `${userName} commented on "${complaint.title}": "${text}"`,
        isRead: false,
      });
      await notification.save();
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET notifications for a user (student or admin)
router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST mark notification as read
router.post("/notifications/read", async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE a complaint
router.delete("/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;