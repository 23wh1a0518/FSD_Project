const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },
  ratings: [
    {
      userId: { type: String },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: { type: Number, default: 0 },
  comments: [
    {
      userId: { type: String },
      userName: { type: String },
      text: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);