const Payment = require("../models/payment");
const Booking = require("../models/Booking");

// =================================
// CREATE MOCK PAYMENT
// =================================
const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking belongs to logged-in user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this booking",
      });
    }

    // Check if successful payment already exists
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: "Success",
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking",
      });
    }

    // Create successful mock payment
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      paymentMethod: paymentMethod || "Card",
      transactionId: `TXN-${Date.now()}`,
      status: "Success",
    });

    // Confirm booking after successful payment
    booking.status = "Confirmed";
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      payment,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// GET MY PAYMENTS
// =================================
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    })
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model image pricePerDay",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// GET ALL PAYMENTS - ADMIN
// =================================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: {
          path: "car",
          select: "brand model image pricePerDay",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getAllPayments,
};