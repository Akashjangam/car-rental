const express = require("express");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  createAdminMember,
  deleteAdminMember,
  getAdminBookings,
  updateAdminBookingStatus,
} = require("../controllers/adminController");

const router = express.Router();

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get("/dashboard", protect, admin, getAdminDashboard);

// ==========================================
// ADMIN MEMBERS / USERS
// ==========================================

router.get("/users", protect, admin, getAllUsers);

router.put("/users/:id/role", protect, admin, updateUserRole);

router.post("/members", protect, admin, createAdminMember);

router.delete("/members/:id", protect, admin, deleteAdminMember);

// ==========================================
// ADMIN BOOKINGS
// ==========================================

router.get("/bookings", protect, admin, getAdminBookings);

router.put("/bookings/:id/status", protect, admin, updateAdminBookingStatus);

module.exports = router;
