const Booking = require("../models/Booking");

// ========================================
// ADMIN DASHBOARD
// ========================================

const getAdminDashboard = async (
  req,
  res
) => {
  try {

    const totalBookings =
      await Booking.countDocuments();

    res.status(200).json({
      success: true,
      totalBookings,
    });

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET ALL BOOKINGS
// ========================================

const getAllBookings = async (
  req,
  res
) => {
  try {

    const bookings =
      await Booking.find()
        .populate(
          "user",
          "name email"
        )
        .populate(
          "car",
          "brand model year pricePerDay image"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {

    console.error(
      "Get admin bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// UPDATE BOOKING STATUS
// ========================================

const updateBookingStatus = async (
  req,
  res
) => {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "car",
          "brand model year pricePerDay image"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      booking,
    });

  } catch (error) {

    console.error(
      "Update booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAllBookings,
  updateBookingStatus,
};