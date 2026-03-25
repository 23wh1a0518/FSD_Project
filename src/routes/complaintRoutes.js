const express = require("express");
const router = express.Router();

//const authMiddleware = require("../middleware/authMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateStatus
} = require("../controllers/complaintController");

router.post("/", createComplaint);

router.get("/my", getMyComplaints);

router.get("/", getAllComplaints);

router.put("/:id", updateStatus);

module.exports = router;