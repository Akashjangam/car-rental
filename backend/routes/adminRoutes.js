const express = require("express");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  createAdminMember,
  deleteAdminMember,
  updateAdminMemberStatus,
  getAdminBookings,
  updateAdminBookingStatus,
  syncBookingRefund,
} = require("../controllers/adminController");

const router = express.Router();

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get("/dashboard", protect, admin, getAdminDashboard);

// ======================================================
// ADMIN USERS
// ======================================================

router.get("/users", protect, admin, getAllUsers);

// ======================================================
// ADMIN UPDATE USER ROLE
// ======================================================

router.put("/users/:id/role", protect, admin, updateUserRole);

// ======================================================
// ADMIN CREATE MEMBER
// ======================================================

router.post("/members", protect, admin, createAdminMember);

// ======================================================
// ADMIN DELETE MEMBER
// ======================================================

router.delete("/members/:id", protect, admin, deleteAdminMember);

// ======================================================
// ADMIN ACTIVATE / CANCEL MEMBERSHIP
// ======================================================

router.put("/members/:id/status", protect, admin, updateAdminMemberStatus);

// ======================================================
// ADMIN BOOKINGS
// ======================================================

router.get("/bookings", protect, admin, getAdminBookings);

// ======================================================
// ADMIN SYNC REFUND
// ======================================================

router.post("/bookings/:id/refund-sync", protect, admin, syncBookingRefund);

// ======================================================
// ADMIN UPDATE BOOKING STATUS
// ======================================================

router.put("/bookings/:id/status", protect, admin, updateAdminBookingStatus);

module.exports = router;
