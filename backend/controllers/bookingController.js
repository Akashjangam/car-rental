const Booking = require("../models/Booking");
const Car = require("../models/Car");

const { sendBookingCancellationEmail } = require("../services/emailService");

/* =========================================================
   CREATE BOOKING
========================================================= */

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
        message: "Pickup date/time and return date/time are required",
      });
    }

    const start = new Date(bookingStartDate);

    const end = new Date(bookingEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup or return date/time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Return date/time must be after pickup date/time",
      });
    }

    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Pickup date/time cannot be in the past",
      });
    }

    /* ---------- Find car ---------- */

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

    /* ---------- Check overlapping bookings ---------- */

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
      return res.status(409).json({
        success: false,
        message:
          "This car is not available for the selected pickup and return time.",
      });
    }

    /* ---------- Calculate rental days ---------- */

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil(
      (end.getTime() - start.getTime()) / millisecondsPerDay,
    );

    const totalAmount = rentalDays * car.pricePerDay;

    /* ---------- Create booking ---------- */

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
    });

    /* ---------- Populate booking ---------- */

    const populatedBooking = await Booking.findById(booking._id)
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
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

/* =========================================================
   GET MY BOOKINGS
========================================================= */

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
      )
      .populate("user", "name email")
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

/* =========================================================
   GET BOOKING BY ID
========================================================= */

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
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
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

/* =========================================================
   CANCEL BOOKING
========================================================= */

const cancelBooking = async (req, res) => {
  try {
    console.log("========================================");

    console.log("CANCEL BOOKING REQUEST RECEIVED");

    console.log("Booking ID:", req.params.id);

    console.log("User ID:", req.user?._id?.toString());

    console.log("========================================");

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    /* ---------- Find booking ---------- */

    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!booking) {
      console.log("Booking not found.");

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("Booking found:", booking._id.toString());

    console.log("Current status:", booking.status);

    console.log("Current payment status:", booking.paymentStatus);

    /* ---------- Already cancelled ---------- */

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    /* ---------- Completed ---------- */

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    /* ---------- Check status ---------- */

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled because its current status is "${booking.status}".`,
      });
    }

    /* =====================================================
       UPDATE BOOKING
    ===================================================== */

    booking.status = "cancelled";

    await booking.save();

    console.log("Booking cancelled successfully:", booking._id.toString());

    /* =====================================================
       GET POPULATED BOOKING FOR EMAIL
    ===================================================== */

    const bookingForEmail = await Booking.findById(booking._id)
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
      )
      .populate("user", "name email");

    console.log("========== CANCELLATION EMAIL DEBUG ==========");

    console.log("Booking ID:", bookingForEmail?._id?.toString());

    console.log("User:", bookingForEmail?.user);

    console.log("Customer email:", bookingForEmail?.user?.email);

    console.log("Car:", bookingForEmail?.car);

    console.log("Payment status:", bookingForEmail?.paymentStatus);

    console.log("Total amount:", bookingForEmail?.totalAmount);

    console.log("Pickup:", bookingForEmail?.startDate);

    console.log("Return:", bookingForEmail?.endDate);

    console.log("==============================================");

    /* =====================================================
       SEND CANCELLATION EMAIL
    ===================================================== */

    if (bookingForEmail && bookingForEmail.user && bookingForEmail.user.email) {
      console.log("CALLING CANCELLATION EMAIL FUNCTION...");

      /*
        IMPORTANT:
        Pass the populated booking directly.

        Do NOT do:

        {
          user: bookingForEmail.user,
          booking: bookingForEmail
        }

        because emailService expects:

        booking.user
        booking.car
        booking._id
        booking.totalAmount
        booking.startDate
        booking.endDate
        booking.paymentStatus
      */

      await sendBookingCancellationEmail(bookingForEmail);

      console.log("CANCELLATION EMAIL FUNCTION FINISHED.");
    } else {
      console.log("CANCELLATION EMAIL NOT SENT.");

      console.log("Reason: Customer email not found.");
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      message:
        "Booking cancelled successfully. A cancellation email has been sent to your registered email address.",

      booking: bookingForEmail || booking,
    });
  } catch (error) {
    console.error("========================================");

    console.error("CANCEL BOOKING ERROR:");

    console.error(error);

    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
