const express = require("express");

const {
  createPayment,
  paymentCallback,
  getPaymentStatus,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create payment
// POST /api/payments
router.post("/", protect, createPayment);

// Paytm callback
// POST /api/payments/callback
router.post("/callback", paymentCallback);

// Payment status
// GET /api/payments/status/:orderId
router.get("/status/:orderId", protect, getPaymentStatus);

module.exports = router;