const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// REGISTER
// POST /api/auth/register
// ========================================

router.post("/register", registerUser);

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

router.post("/login", loginUser);

// ========================================
// PROFILE
// GET /api/auth/profile
// ========================================

router.get("/profile", protect, getProfile);

module.exports = router;
