const Complaint = require("../models/Complaint");


// Submit Complaint
exports.createComplaint = async (req, res) => {
  try {

    const complaint = new Complaint({
      ...req.body,
      studentId: req.user.id
    });

    await complaint.save();

    res.json(complaint);

  } catch (error) {
    res.status(500).json(error);
  }
};


// Student's complaints
exports.getMyComplaints = async (req, res) => {

  const complaints = await Complaint.find({
    studentId: req.user.id
  });

  res.json(complaints);
};


// Admin sees all complaints
exports.getAllComplaints = async (req, res) => {

  const complaints = await Complaint.find()
    .populate("studentId", "name email");

  res.json(complaints);
};


// Update complaint status
exports.updateStatus = async (req, res) => {

  const { status } = req.body;

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(complaint);
};