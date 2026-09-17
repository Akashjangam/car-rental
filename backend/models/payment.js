const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
      trim: true,
    },

    responseCode: {
      type: String,
      default: "",
      trim: true,
    },

    responseMessage: {
      type: String,
      default: "",
      trim: true,
    },

    refundStatus: {
      type: String,
      enum: ["not_requested", "pending", "processed", "failed"],
      default: "not_requested",
    },

    refundId: {
      type: String,
      default: "",
      trim: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
