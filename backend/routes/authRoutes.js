// DriveNow Car Rental — MERN Stack Project
const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// REGISTER
// POST /api/auth/register

router.post("/register", authLimiter, registerUser);

// LOGIN
// POST /api/auth/login

router.post("/login", authLimiter, loginUser);

// FORGOT PASSWORD
// POST /api/auth/forgot-password

router.post("/forgot-password", passwordResetLimiter, forgotPassword);


// RESET PASSWORD
// POST /api/auth/reset-password/:token

router.post("/reset-password/:token", resetPassword);

// PROFILE
// GET /api/auth/profile

router.get("/profile", protect, getProfile);

module.exports = router;
