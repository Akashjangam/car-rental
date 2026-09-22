// DriveNow Car Rental — MERN Stack Project
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // CUSTOMER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // CAR
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    // BOOKING START
    startDate: {
      type: Date,
      required: true,
    },

    // BOOKING END
    endDate: {
      type: Date,
      required: true,
    },

    // PRICE
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // BOOKING STATUS
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // PAYMENT STATUS
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "paid",
        "failed",
      ],
      default: "unpaid",
    },

    // PAYMENT ID (Razorpay payment ID: pay_xxx)
    paymentId: {
      type: String,
      default: "",
    },

    // PAYMENT DOCUMENT REFERENCE
    paymentDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to optimize booking availability and overlap queries
bookingSchema.index({
  car: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);