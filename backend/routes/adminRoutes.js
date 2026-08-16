const express = require("express");

const router = express.Router();

const {
  adminLogin,
} = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

const adminLoginLimiter = require("../middleware/adminLoginLimiter");

// Admin login
router.post("/login", adminLoginLimiter, adminLogin);

// Verify admin token
router.get("/verify", adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin token is valid",
    admin: req.admin,
  });
});

module.exports = router;
