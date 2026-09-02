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

    // BOOKING DATES
    startDate: {
      type: Date,
      required: true,
    },

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
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    // PAYMENT STATUS
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },

    // PAYMENT DETAILS
    paymentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// VALIDATE BOOKING DATES
// ==========================================

bookingSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }
});

// ==========================================
// EXPORT MODEL
// ==========================================

module.exports = mongoose.model("Booking", bookingSchema);
