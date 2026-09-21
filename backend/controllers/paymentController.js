const crypto = require("crypto");

const Payment = require("../models/payment");
const Booking = require("../models/Booking");
const { getRazorpayInstance } = require("../config/razorpay");

const { sendBookingConfirmationEmail } = require("../services/emailService");


/* =====================================================
   CREATE RAZORPAY PAYMENT ORDER
===================================================== */

const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* ---------- Ownership Check ---------- */

    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this booking",
      });
    }

    /* ---------- Booking Status Checks ---------- */

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be paid",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be paid",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    /* ---------- Amount ---------- */

    const amount = Number(
      booking.totalAmount || booking.totalPrice || booking.amount || 0,
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    /* ---------- Get Razorpay Instance ---------- */

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (configErr) {
      return res.status(500).json({
        success: false,
        message: configErr.message || "Razorpay is not configured on the server",
      });
    }

    /* ---------- Convert INR to Paise ---------- */

    const amountInPaise = Math.round(amount * 100);

    /* ---------- Create Razorpay Order ---------- */

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",

      receipt: `DN_${booking._id.toString().slice(-12)}`,

      notes: {
        bookingId: booking._id.toString(),

        userId: req.user._id.toString(),
      },
    });

    /* ---------- Save Payment ---------- */

    const payment = await Payment.create({
      booking: booking._id,

      user: req.user._id,

      orderId: razorpayOrder.id,

      amount,

      status: "pending",

      paymentMethod: "Razorpay",
    });

    return res.status(201).json({
      success: true,

      message: "Razorpay order created successfully",

      keyId: process.env.RAZORPAY_KEY_ID,

      order: {
        id: razorpayOrder.id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,
      },

      payment: {
        id: payment._id,

        orderId: payment.orderId,

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
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to create payment order",

      error: error.message,
    });
  }
};

/* =====================================================
   VERIFY RAZORPAY PAYMENT
===================================================== */

const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    /* ---------- Validate Request ---------- */

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    /* ---------- Find Booking ---------- */

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* ---------- Ownership Check ---------- */

    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this payment",
      });
    }

    /* ---------- Booking Status Checks ---------- */

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be paid",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }

    /* ---------- Find Payment ---------- */

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,

      booking: booking._id,

      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    /* =================================================
       VERIFY RAZORPAY SIGNATURE
    ================================================= */

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    /* ---------- Signature Failed ---------- */

    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";

      payment.responseCode = "SIGNATURE_MISMATCH";

      payment.responseMessage = "Payment signature verification failed";

      await payment.save();

      booking.paymentStatus = "failed";

      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    /* =================================================
       PAYMENT SUCCESS
    ================================================= */

    payment.status = "success";

    payment.transactionId = razorpay_payment_id;

    payment.paymentMethod = "Razorpay";

    payment.responseCode = "SUCCESS";

    payment.responseMessage = "Payment verified successfully";

    await payment.save();

    /* ---------- Update Booking ---------- */

    booking.paymentStatus = "paid";

    booking.status = "confirmed";

    booking.paymentId = razorpay_payment_id;

    booking.paymentDocId = payment._id;

    await booking.save();


    /* =================================================
       GET COMPLETE BOOKING FOR EMAIL
    ================================================= */

    const bookingForEmail = await Booking.findById(booking._id)
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
      )
      .populate("user", "name email");

    if (!bookingForEmail) {
      console.error("Booking could not be loaded for confirmation email.");
    } else {
      console.log("========== CONFIRMATION EMAIL DEBUG ==========");

      console.log("Booking ID:", bookingForEmail._id?.toString());

      console.log("Customer:", bookingForEmail.user);

      console.log("Car:", bookingForEmail.car);

      console.log("Pickup:", bookingForEmail.startDate);

      console.log("Return:", bookingForEmail.endDate);

      console.log("Total amount:", bookingForEmail.totalAmount);

      console.log("Payment status:", bookingForEmail.paymentStatus);

      console.log("Booking status:", bookingForEmail.status);

      console.log("Razorpay payment ID:", payment.transactionId);

      console.log("==============================================");
    }

    /* =================================================
       SEND BOOKING CONFIRMATION EMAIL
    ================================================= */

    if (bookingForEmail && bookingForEmail.user && bookingForEmail.user.email) {
      console.log(
        `Sending confirmation email to ${bookingForEmail.user.email}...`,
      );

      /*
        IMPORTANT:

        Pass the populated booking directly.

        The email service expects:

        booking.user
        booking.car
        booking._id
        booking.startDate
        booking.endDate
        booking.totalAmount
        booking.paymentStatus
        booking.status

        Payment is passed separately.
      */

      await sendBookingConfirmationEmail(bookingForEmail, payment);

      console.log("CONFIRMATION EMAIL FUNCTION FINISHED.");
    } else {
      console.log("CONFIRMATION EMAIL NOT SENT.");

      console.log("Reason: Customer email not found.");
    }

    /* =================================================
       SUCCESS RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      message: "Payment verified successfully",

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
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      success: false,

      message: "Payment verification failed",

      error: error.message,
    });
  }
};

/* =====================================================
   RAZORPAY CALLBACK
===================================================== */

const paymentCallback = async (req, res) => {
  try {
    console.log("Razorpay callback received");

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

/* =====================================================
   GET PAYMENT STATUS
===================================================== */

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

    /* ---------- Ownership Check ---------- */

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

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  createPayment,
  verifyPayment,
  paymentCallback,
  getPaymentStatus,
};
