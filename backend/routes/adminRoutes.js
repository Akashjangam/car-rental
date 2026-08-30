const express = require("express");

const {
  getAdminDashboard,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Protect all admin routes
router.use(protect, admin);

// Dashboard
router.get(
  "/dashboard",
  getAdminDashboard
);

// Get all bookings
router.get(
  "/bookings",
  getAllBookings
);

// Update booking status
router.put(
  "/bookings/:id",
  updateBookingStatus
);

module.exports = router;