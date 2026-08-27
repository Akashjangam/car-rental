const express = require("express");

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);

router.get("/my-bookings", protect, getMyBookings);

router.get("/", protect, admin, getAllBookings);

router.put("/:id/cancel", protect, cancelBooking);

// Admin: Update booking status
router.put("/:id/status", protect, admin, updateBookingStatus);

module.exports = router;