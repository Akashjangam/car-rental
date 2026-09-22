// DriveNow Car Rental — MERN Stack Project
const express = require("express");

const {
  createPayment,
  verifyPayment,
  paymentCallback,
  getPaymentStatus,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const { paymentLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// ======================================================
// CREATE RAZORPAY PAYMENT ORDER
// POST /api/payments
// ======================================================

router.post("/", protect, createPayment);

// ======================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payments/verify
// ======================================================

router.post("/verify", protect, paymentLimiter, verifyPayment);


// ======================================================
// RAZORPAY CALLBACK
// POST /api/payments/callback
// ======================================================

router.post("/callback", paymentCallback);

// ======================================================
// GET PAYMENT STATUS
// GET /api/payments/status/:orderId
// ======================================================

router.get("/status/:orderId", protect, getPaymentStatus);

module.exports = router;
