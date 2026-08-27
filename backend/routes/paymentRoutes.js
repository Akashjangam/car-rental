const express = require("express");

const {
  createPayment,
  getMyPayments,
  getAllPayments,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// GET ALL PAYMENTS - ADMIN
router.get("/admin/all", protect, admin, getAllPayments);

// GET MY PAYMENTS
router.get("/my-payments", protect, getMyPayments);

// CREATE PAYMENT
router.post("/", protect, createPayment);

module.exports = router;