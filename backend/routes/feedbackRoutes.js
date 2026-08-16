const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const {
  createFeedback,
  getFeedback,
  deleteFeedback,
  exportCSV,
  getStats,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/create", createFeedback);

router.get("/", adminAuth, getFeedback);

router.get("/stats", adminAuth, getStats);

router.delete("/:id", adminAuth, deleteFeedback);

router.get("/export", adminAuth, exportCSV);

module.exports = router;
