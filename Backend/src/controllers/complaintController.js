const Complaint = require("../models/Complaint");
const User = require("../models/User");

// Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, studentId } = req.body;
    const complaint = new Complaint({
      title,
      description,
      category,
      studentId
    });
    await complaint.save();
    res.json({
      message: "Complaint submitted successfully",
      complaint
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

// Get all complaints with search & filter
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 });

    const count = await Complaint.countDocuments(filter);

    res.json({
      totalComplaints: count,
      data: complaints
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update status + send notification
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Send notification to student
    if (complaint.studentId) {
      await User.findByIdAndUpdate(complaint.studentId, {
        $push: {
          notifications: {
            message: `Your complaint "${complaint.title}" status changed to ${status}`,
            complaintId: complaint._id,
            isRead: false
          }
        }
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete Complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Rate Complaint
exports.rateComplaint = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if user already rated
    const existingRating = complaint.ratings.find(
      (r) => r.userId === userId
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
    } else {
      // Add new rating
      complaint.ratings.push({ userId, rating });
    }

    // Calculate average rating
    const total = complaint.ratings.reduce((sum, r) => sum + r.rating, 0);
    complaint.averageRating = total / complaint.ratings.length;

    await complaint.save();
    res.json({ message: "Rating submitted", complaint });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { userId, userName, text } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: { userId, userName, text }
        }
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Comment added", complaint });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get Notifications
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.notifications.reverse());
  } catch (error) {
    res.status(500).json(error);
  }
};

// Mark Notification as Read
exports.markNotificationRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = user.notifications.id(notificationId);
    if (notification) {
      notification.isRead = true;
      await user.save();
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json(error);
  }
};