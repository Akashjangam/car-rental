const express = require("express");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// User routes
router.post("/", protect, createBooking);

router.get(
  "/my-bookings",
  protect,
  getMyBookings
);

router.put(
  "/:id/cancel",
  protect,
  cancelBooking
);

// Admin
router.get(
  "/",
  protect,
  admin,
  getAllBookings
);

module.exports = router;