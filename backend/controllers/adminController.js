const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");

/* ======================================================
   ADMIN DASHBOARD
====================================================== */

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalDealers = await User.countDocuments({
      role: "dealer",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalCars = await Car.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });

    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    /* ==================================================
       TOTAL REVENUE
    ================================================== */

    const revenueResult = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    /* ==================================================
       RESPONSE
    ================================================== */

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalDealers,
        totalAdmins,

        totalMembers: totalUsers + totalDealers + totalAdmins,

        totalCars,

        totalBookings,

        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,

        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};

/* ======================================================
   GET ALL USERS
====================================================== */

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load members",
    });
  }
};

/* ======================================================
   UPDATE USER ROLE
====================================================== */

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const allowedRoles = ["user", "dealer", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    /* Prevent admin from changing own role */

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

/* ======================================================
   CREATE MEMBER
====================================================== */

const createAdminMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    /* Admin can create only user/dealer */

    const allowedRoles = ["user", "dealer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only user or dealer accounts can be created here",
      });
    }

    const normalizedName = name.trim();

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email cannot be empty",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create admin member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create member",
    });
  }
};

/* ======================================================
   DELETE MEMBER
====================================================== */

const deleteAdminMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    /* Prevent admin from deleting own account */

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const member = await User.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete member",
    });
  }
};

/* ======================================================
   GET ALL BOOKINGS
====================================================== */

const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("car", "brand model year pricePerDay")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load bookings",
    });
  }
};

/* ======================================================
   UPDATE BOOKING STATUS
====================================================== */

const updateAdminBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    /* Validate booking ID */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    /* Validate status */

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required",
      });
    }

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    /* Find booking */

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* Update status */

    booking.status = status;

    /*
      Important:
      Do not manually call any mongoose middleware.
      save() will automatically run the schema
      validation middleware.
    */

    await booking.save();

    /* Get updated booking with related data */

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("car", "brand model year pricePerDay");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status",
    });
  }
};

/* ======================================================
   EXPORTS
====================================================== */

module.exports = {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  createAdminMember,
  deleteAdminMember,
  getAdminBookings,
  updateAdminBookingStatus,
};
