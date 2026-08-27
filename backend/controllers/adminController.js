const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");

// GET ADMIN DASHBOARD STATISTICS
const getAdminStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();

    const availableCars = await Car.countDocuments({
      available: true,
    });

    const totalUsers = await User.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "Pending",
    });

    const confirmedBookings = await Booking.countDocuments({
      status: "Confirmed",
    });

    const completedBookings = await Booking.countDocuments({
      status: "Completed",
    });

    // Revenue from confirmed/completed bookings
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          status: {
            $in: ["Confirmed", "Completed"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCars,
        availableCars,
        totalUsers,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAdminStats,
};