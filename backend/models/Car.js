const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    // CAR DETAILS

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
      min: 0,
    },

    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid" , "CNG"],
    },

    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic"],
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },


    // AVAILABILITY
  

    available: {
      type: Boolean,
      default: true,
    },

   
    // CAR IMAGE
 

    image: {
      type: String,
      default: "",
    },

    // DEALER


    // Admin-added cars:
    // dealer can be empty.

    // Dealer-added cars:
    // backend automatically stores the
    // logged-in dealer's user ID.


    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Car", carSchema);
