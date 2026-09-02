const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

/* ======================================================
   CREATE BOOKING
   POST /api/bookings
====================================================== */

router.post(
  "/",
  protect,
  createBooking,
);


/* ======================================================
   GET MY BOOKINGS
   GET /api/bookings/my-bookings
====================================================== */

router.get(
  "/my-bookings",
  protect,
  getMyBookings,
);


/* ======================================================
   GET SINGLE BOOKING
   GET /api/bookings/:id
====================================================== */

router.get(
  "/:id",
  protect,
  getBookingById,
);


/* ======================================================
   CANCEL BOOKING
   PUT /api/bookings/:id/cancel
====================================================== */

router.put(
  "/:id/cancel",
  protect,
  cancelBooking,
);


module.exports = router;