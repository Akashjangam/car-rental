const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// ==========================================
// CREATE DEMO PAYMENT
// ==========================================

const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check ownership
    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this booking",
      });
    }

    // Cancelled booking
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be paid",
      });
    }

    // Already paid
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    // Get booking amount
    const amount =
      booking.totalAmount || booking.totalPrice || booking.amount || 0;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    // Generate unique IDs
    const orderId = `DN_ORDER_${Date.now()}`;

    const transactionId = `DN_TXN_${Date.now()}_${Math.floor(
      Math.random() * 100000,
    )}`;

    // Create payment
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      orderId,
      transactionId,
      amount,
      status: "success",
      paymentMethod: "Demo",
    });

    // Update booking
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = payment._id.toString();

    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Demo payment successful",

      payment: {
        id: payment._id,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
      },

      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
};

// ==========================================
// PAYMENT CALLBACK
// ==========================================

const paymentCallback = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Payment callback received",
    });
  } catch (error) {
    console.error("Payment callback error:", error);

    return res.status(500).json({
      success: false,
      message: "Callback failed",
    });
  }
};

// ==========================================
// GET PAYMENT STATUS
// ==========================================

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const payment = await Payment.findOne({
      orderId,
    }).populate(
      "booking",
      "startDate endDate totalAmount status paymentStatus",
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check ownership
    if (payment.user && payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this payment",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  paymentCallback,
  getPaymentStatus,
};
