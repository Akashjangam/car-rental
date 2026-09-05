const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // CUSTOMER WHO POSTED THE REVIEW
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // CAR BEING REVIEWED
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    // BOOKING RELATED TO THIS REVIEW
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    // RATING
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // REVIEW COMMENT
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Review", reviewSchema);