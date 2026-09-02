const Booking = require("../models/Booking");
const Car = require("../models/Car");

/* ======================================================
   CREATE BOOKING
====================================================== */

const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, pickupDate, returnDate } = req.body;

    const bookingStartDate = startDate || pickupDate;

    const bookingEndDate = endDate || returnDate;

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "Car ID is required",
      });
    }

    if (!bookingStartDate || !bookingEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(bookingStartDate);
    const end = new Date(bookingEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Pickup date cannot be in the past",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!car.available) {
      return res.status(400).json({
        success: false,
        message: "This car is currently unavailable",
      });
    }

    /* --------------------------------------------------
       CHECK DATE OVERLAP
    -------------------------------------------------- */

    const overlappingBooking = await Booking.findOne({
      car: carId,

      status: {
        $in: ["pending", "confirmed"],
      },

      startDate: {
        $lt: end,
      },

      endDate: {
        $gt: start,
      },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "This car is already booked for the selected dates",
      });
    }

    /* --------------------------------------------------
       CALCULATE RENTAL DAYS
    -------------------------------------------------- */

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil((end - start) / millisecondsPerDay);

    const totalAmount = rentalDays * car.pricePerDay;

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate(
        "car",
        "brand model year pricePerDay fuelType transmission seats image",
      )
      .populate("user", "name email");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/* ======================================================
   GET MY BOOKINGS
====================================================== */

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate(
        "car",
        "brand model year pricePerDay fuelType transmission seats image",
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load bookings",
    });
  }
};

/* ======================================================
   GET SINGLE BOOKING
====================================================== */

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id,
    })
      .populate(
        "car",
        "brand model year pricePerDay fuelType transmission seats image",
      )
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load booking",
    });
  }
};

/* ======================================================
   CANCEL BOOKING
====================================================== */

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
