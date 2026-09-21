const Car = require("../models/Car");
const Booking = require("../models/Booking");
const Payment = require("../models/payment");
const { sendBookingCancellationEmail } = require("../services/emailService");
const { refundBookingPayment } = require("./bookingController");


// =====================================================
// CREATE DEALER CAR
// =====================================================

const createDealerCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      numberPlate,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      available,
    } = req.body;

    // Validate required fields
    if (
      !brand ||
      !model ||
      !year ||
      !numberPlate ||
      !pricePerDay ||
      !fuelType ||
      !transmission ||
      !seats
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required car details.",
      });
    }

    // Format number plate
    const formattedNumberPlate = numberPlate.trim().toUpperCase();

    // Check duplicate number plate
    const existingCar = await Car.findOne({
      numberPlate: formattedNumberPlate,
    });

    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    // Cloudinary image URL
    const image = req.file ? req.file.path : "";

    // Create car
    const car = await Car.create({
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      numberPlate: formattedNumberPlate,
      pricePerDay: Number(pricePerDay),
      fuelType,
      transmission,
      seats: Number(seats),

      available:
        available === undefined
          ? true
          : available === "true" || available === true,

      // Automatically assign logged-in dealer
      dealer: req.user._id,

      image,
    });

    return res.status(201).json({
      success: true,
      message: "Car added successfully.",
      car,
    });
  } catch (error) {
    console.error("Create dealer car error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add car.",
      error: error.message,
    });
  }
};

// =====================================================
// GET DEALER CARS
// =====================================================

const getDealerCars = async (req, res) => {
  try {
    const cars = await Car.find({
      dealer: req.user._id,
    })
      .populate("dealer", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Get dealer cars error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer cars.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE DEALER CAR
// =====================================================

const getDealerCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.user._id,
    }).populate("dealer", "name email role");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found.",
      });
    }

    return res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    console.error("Get dealer car error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch car.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE DEALER CAR
// =====================================================

const updateDealerCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      numberPlate,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      available,
    } = req.body;

    // Find only the dealer's own car
    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.user._id,
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or you do not have permission to edit it.",
      });
    }

    // =================================================
    // UPDATE CAR DETAILS
    // =================================================

    if (brand !== undefined && brand.trim() !== "") {
      car.brand = brand.trim();
    }

    if (model !== undefined && model.trim() !== "") {
      car.model = model.trim();
    }

    if (year !== undefined && year !== "") {
      car.year = Number(year);
    }

    // =================================================
    // UPDATE NUMBER PLATE
    // =================================================

    if (numberPlate !== undefined && numberPlate.trim() !== "") {
      const formattedNumberPlate = numberPlate.trim().toUpperCase();

      // Check whether another car already has this plate
      const existingCar = await Car.findOne({
        numberPlate: formattedNumberPlate,
        _id: {
          $ne: req.params.id,
        },
      });

      if (existingCar) {
        return res.status(400).json({
          success: false,
          message: "A car with this number plate already exists.",
        });
      }

      car.numberPlate = formattedNumberPlate;
    }

    if (pricePerDay !== undefined && pricePerDay !== "") {
      car.pricePerDay = Number(pricePerDay);
    }

    if (fuelType !== undefined) {
      car.fuelType = fuelType;
    }

    if (transmission !== undefined) {
      car.transmission = transmission;
    }

    if (seats !== undefined && seats !== "") {
      car.seats = Number(seats);
    }

    // =================================================
    // UPDATE AVAILABILITY
    // =================================================

    if (available !== undefined) {
      car.available = available === "true" || available === true;
    }

    // =================================================
    // UPDATE IMAGE
    // =================================================

    if (req.file) {
      car.image = req.file.path;
    }

    // Do NOT change dealer ownership
    await car.save();

    return res.status(200).json({
      success: true,
      message: "Car updated successfully.",
      car,
    });
  } catch (error) {
    console.error("Update dealer car error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update car.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE DEALER CAR
// =====================================================

const deleteDealerCar = async (req, res) => {
  try {
    // Only delete a car belonging to the logged-in dealer
    const car = await Car.findOneAndDelete({
      _id: req.params.id,
      dealer: req.user._id,
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or you do not have permission to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car deleted successfully.",
    });
  } catch (error) {
    console.error("Delete dealer car error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete car.",
      error: error.message,
    });
  }
};

// =====================================================
// GET DEALER ANALYTICS
// =====================================================

const getDealerAnalytics = async (req, res) => {
  try {
    const dealerId = req.user._id;

    // -------------------------------------------------
    // GET ALL CARS BELONGING TO THIS DEALER
    // -------------------------------------------------

    const dealerCars = await Car.find({
      dealer: dealerId,
    }).select("_id");

    const totalCars = dealerCars.length;

    const carIds = dealerCars.map((car) => car._id);

    // -------------------------------------------------
    // DEALER HAS NO CARS
    // -------------------------------------------------

    if (carIds.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalCars: 0,
          totalBookings: 0,
          completedBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          activeBookings: 0,
          totalEarnings: 0,
          refundedAmount: 0,
        },
      });
    }

    // -------------------------------------------------
    // GET BOOKINGS FOR DEALER'S CARS
    // -------------------------------------------------

    const bookings = await Booking.find({
      car: {
        $in: carIds,
      },
    }).select(
      "_id car totalAmount status paymentStatus createdAt startDate endDate",
    );

    // -------------------------------------------------
    // BOOKING STATISTICS
    // -------------------------------------------------

    const totalBookings = bookings.length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed",
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed",
    ).length;

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending",
    ).length;

    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "cancelled",
    ).length;

    const activeBookings = bookings.filter(
      (booking) =>
        booking.status === "pending" || booking.status === "confirmed",
    ).length;

    // -------------------------------------------------
    // GET PAYMENT RECORDS
    // -------------------------------------------------

    const bookingIds = bookings.map((booking) => booking._id);

    const payments = await Payment.find({
      booking: {
        $in: bookingIds,
      },
    }).select(
      "booking amount status refundStatus refundAmount refundId refundedAt",
    );

    // -------------------------------------------------
    // TOTAL EARNINGS
    // -------------------------------------------------

    const successfulPayments = payments.filter(
      (payment) => payment.status === "success",
    );

    const nonCancelledBookingIds = new Set(
      bookings
        .filter((booking) => booking.status !== "cancelled")
        .map((booking) => booking._id.toString()),
    );

    const earningPayments = successfulPayments.filter(
      (payment) =>
        payment.booking &&
        nonCancelledBookingIds.has(payment.booking.toString()),
    );

    const totalEarnings = earningPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );

    // -------------------------------------------------
    // ACTUAL REFUNDED AMOUNT
    // -------------------------------------------------

    const processedRefunds = payments.filter(
      (payment) => payment.refundStatus === "processed",
    );

    const refundedAmount = processedRefunds.reduce(
      (total, payment) => total + Number(payment.refundAmount || 0),
      0,
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      analytics: {
        totalCars,
        totalBookings,
        completedBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        activeBookings,
        totalEarnings,
        refundedAmount,
      },
    });
  } catch (error) {
    console.error("Get dealer analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer analytics.",
      error: error.message,
    });
  }
};

// =====================================================
// GET DEALER BOOKINGS
// =====================================================

const getDealerBookings = async (req, res) => {
  try {
    const dealerId = req.user._id;

    // -------------------------------------------------
    // GET DEALER'S CARS
    // -------------------------------------------------

    const dealerCars = await Car.find({
      dealer: dealerId,
    }).select("_id brand model year numberPlate image pricePerDay");

    const carIds = dealerCars.map((car) => car._id);

    // -------------------------------------------------
    // NO CARS
    // -------------------------------------------------

    if (carIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    // -------------------------------------------------
    // GET BOOKINGS FOR DEALER'S CARS
    // -------------------------------------------------

    const bookings = await Booking.find({
      car: {
        $in: carIds,
      },
    })
      .populate("user", "name email")
      .populate("car", "brand model year numberPlate image pricePerDay")
      .sort({ createdAt: -1 });

    // -------------------------------------------------
    // GET PAYMENT INFORMATION
    // -------------------------------------------------

    const bookingIds = bookings.map((booking) => booking._id);

    const payments = await Payment.find({
      booking: {
        $in: bookingIds,
      },
    }).select("booking amount status paymentMethod refundStatus refundAmount");

    // -------------------------------------------------
    // COMBINE BOOKING + PAYMENT DATA
    // -------------------------------------------------

    const bookingsWithPayment = bookings.map((booking) => {
      const payment = payments.find(
        (item) =>
          item.booking && item.booking.toString() === booking._id.toString(),
      );

      return {
        _id: booking._id,
        user: booking.user,
        car: booking.car,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,

        payment: payment
          ? {
              amount: payment.amount,
              status: payment.status,
              paymentMethod: payment.paymentMethod,
              refundStatus: payment.refundStatus,
              refundAmount: payment.refundAmount,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: bookingsWithPayment.length,
      bookings: bookingsWithPayment,
    });
  } catch (error) {
    console.error("Get dealer bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer bookings.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE DEALER BOOKING STATUS
// =====================================================

const updateDealerBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    // Find booking and populate its car
    const booking = await Booking.findById(id).populate(
      "car",
      "dealer brand model",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Car must exist
    if (!booking.car) {
      return res.status(404).json({
        success: false,
        message: "Car associated with this booking was not found.",
      });
    }

    // Make sure the car belongs to the logged-in dealer
    if (
      !booking.car.dealer ||
      booking.car.dealer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking.",
      });
    }

    // Completed booking cannot be changed
    if (booking.status === "completed" && status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be changed.",
      });
    }

    // Cancelled booking cannot be changed
    if (booking.status === "cancelled" && status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be changed.",
      });
    }

    // If dealer cancels a paid booking, refund customer payment
    if (status === "cancelled" && booking.paymentStatus === "paid") {
      try {
        await refundBookingPayment(booking);
      } catch (refundError) {
        console.error("Dealer booking cancellation refund failed:", refundError);
        return res.status(400).json({
          success: false,
          message:
            refundError.message ||
            "Payment refund failed. Booking was not cancelled.",
          refundFailed: true,
        });
      }
    }

    // Update status
    booking.status = status;

    await booking.save();

    // Send cancellation email if cancelled
    if (status === "cancelled") {
      try {
        const bookingForEmail = await Booking.findById(booking._id)
          .populate(
            "car",
            "brand model year numberPlate pricePerDay fuelType transmission seats image",
          )
          .populate("user", "name email");

        if (bookingForEmail) {
          await sendBookingCancellationEmail(bookingForEmail);
        }
      } catch (emailError) {
        console.error("Failed to send dealer cancellation email:", emailError);
      }
    }


    // Return updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("car", "brand model year numberPlate image pricePerDay");

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update dealer booking status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createDealerCar,
  getDealerCars,
  getDealerCarById,
  updateDealerCar,
  deleteDealerCar,
  getDealerAnalytics,
  getDealerBookings,
  updateDealerBookingStatus,
};

