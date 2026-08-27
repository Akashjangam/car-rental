const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
    },

    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic"],
    },

    seats: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;