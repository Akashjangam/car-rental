// DriveNow Car Rental — MERN Stack Project
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const Payment = require("../models/payment");
const { getRazorpayInstance } = require("../config/razorpay");

const { sendBookingCancellationEmail } = require("../services/emailService");

/* ======================================================
   ADMIN - DASHBOARD
====================================================== */

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDealers,
      totalAdmins,
      totalCars,
      totalBookings,
      pendingBookings,
      successfulPayments,
      paidBookings,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
      }),

      User.countDocuments({
        role: "dealer",
      }),

      User.countDocuments({
        role: "admin",
      }),

      Car.countDocuments(),

      Booking.countDocuments(),

      Booking.countDocuments({
        status: "pending",
      }),

      Booking.countDocuments({
        paymentStatus: "paid",
      }),

      Booking.find({
        paymentStatus: "paid",
      }).select("totalAmount totalPrice amount"),
    ]);

    const totalRevenue = paidBookings.reduce((total, booking) => {
      const amount =
        Number(
          booking.totalAmount || booking.totalPrice || booking.amount || 0,
        ) || 0;

      return total + amount;
    }, 0);

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalDealers,
        totalAdmins,
        totalCars,
        totalBookings,
        pendingBookings,
        successfulPayments,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - GET ALL USERS
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
      message: "Failed to load users.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - UPDATE USER ROLE
====================================================== */

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const allowedRoles = ["user", "dealer", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles are user, dealer, and admin.",
      });
    }

    const currentUserId = req.user?._id;

    if (String(currentUserId) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - CREATE MEMBER
====================================================== */

const createAdminMember = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (!["user", "dealer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only user or dealer accounts can be created here.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Create admin member error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create member.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - DELETE MEMBER
====================================================== */

const deleteAdminMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID.",
      });
    }

    const currentUserId = req.user?._id;

    if (String(currentUserId) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const member = await User.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete member.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - ACTIVATE / CANCEL MEMBERSHIP
====================================================== */

const updateAdminMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const currentUserId = req.user?._id;

    if (String(currentUserId) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own membership status.",
      });
    }

    const member = await User.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    member.isActive = isActive;

    await member.save();

    return res.status(200).json({
      success: true,

      message: isActive
        ? "Membership activated successfully."
        : "Membership cancelled successfully.",

      user: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        isActive: member.isActive,
      },
    });
  } catch (error) {
    console.error("Update member status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update membership status.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - GET ALL BOOKINGS
====================================================== */

const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
      )
      .sort({
        createdAt: -1,
      });

    const bookingIds = bookings.map((booking) => booking._id);

    const payments = await Payment.find({
      booking: {
        $in: bookingIds,
      },
    }).sort({
      createdAt: -1,
    });

    const paymentMap = new Map();

    payments.forEach((payment) => {
      const bookingId = payment.booking?.toString();

      if (bookingId && !paymentMap.has(bookingId)) {
        paymentMap.set(bookingId, payment);
      }
    });

    const bookingsWithPayments = bookings.map((booking) => {
      const payment = paymentMap.get(booking._id.toString());

      return {
        ...booking.toObject(),

        payment: payment
          ? {
              _id: payment._id,

              orderId: payment.orderId,

              transactionId: payment.transactionId,

              amount: payment.amount,

              status: payment.status,

              paymentMethod: payment.paymentMethod,

              responseCode: payment.responseCode,

              responseMessage: payment.responseMessage,

              refundStatus: payment.refundStatus || "not_requested",

              refundId: payment.refundId || "",

              refundAmount: Number(payment.refundAmount || 0),

              refundedAt: payment.refundedAt || null,

              createdAt: payment.createdAt,

              updatedAt: payment.updatedAt,
            }
          : null,

        refundStatus: payment?.refundStatus || "not_requested",

        refundId: payment?.refundId || "",

        refundAmount: Number(payment?.refundAmount || 0),
      };
    });

    return res.status(200).json({
      success: true,
      count: bookingsWithPayments.length,
      bookings: bookingsWithPayments,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load bookings.",
      error: error.message,
    });
  }
};

/* ======================================================
   ADMIN - REFUND PAYMENT
====================================================== */

const refundBookingPayment = async (bookingId) => {
  try {
    const payment = await Payment.findOne({
      booking: bookingId,
      status: "success",
    });

    if (!payment) {
      return {
        success: true,
        refunded: false,
        message: "No successful payment found for this booking.",
      };
    }

    if (payment.refundStatus === "processed") {
      console.log("Payment already marked as refunded in database.");

      return {
        success: true,
        refunded: true,
        alreadyRefunded: true,
        refundId: payment.refundId,
        refundAmount: payment.refundAmount,
        refundStatus: payment.refundStatus,
      };
    }

    if (!payment.transactionId) {
      return {
        success: false,
        refunded: false,
        message: "Razorpay payment ID is missing.",
      };
    }

    /* ---------------------------------------------
       Check existing Razorpay refunds
    --------------------------------------------- */

    console.log("Checking existing Razorpay refunds...");

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (configErr) {
      return {
        success: false,
        refunded: false,
        message: configErr.message || "Razorpay is not configured on the server",
      };
    }

    try {
      const refundsResponse = await razorpay.payments.fetchMultipleRefund(
        payment.transactionId,
      );

      const refunds = Array.isArray(refundsResponse?.items)
        ? refundsResponse.items
        : [];

      console.log("Existing refunds found:", refunds.length);

      const existingRefund = refunds.find(
        (refund) =>
          refund.status === "processed" || refund.status === "pending",
      );

      if (existingRefund) {
        const existingRefundAmount = Number(existingRefund.amount || 0) / 100;

        payment.refundStatus =
          existingRefund.status === "processed" ? "processed" : "pending";

        payment.refundId = existingRefund.id || "";

        payment.refundAmount = existingRefundAmount;

        if (existingRefund.status === "processed") {
          payment.refundedAt = new Date();
        }

        await payment.save();

        console.log("==========================================");

        console.log("EXISTING RAZORPAY REFUND FOUND");

        console.log("Refund ID:", existingRefund.id);

        console.log("Refund Status:", existingRefund.status);

        console.log("Refund Amount:", existingRefundAmount);

        console.log("==========================================");

        return {
          success: existingRefund.status === "processed",

          refunded: existingRefund.status === "processed",

          alreadyRefunded: true,

          refundId: payment.refundId,

          refundStatus: payment.refundStatus,

          refundAmount: payment.refundAmount,
        };
      }
    } catch (fetchRefundError) {
      console.log("Existing refund lookup failed:", fetchRefundError.message);
    }

    /* ---------------------------------------------
       Validate amount
    --------------------------------------------- */

    const refundAmount = Number(payment.amount || 0);

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      return {
        success: false,
        refunded: false,
        message: "Invalid payment amount for refund.",
      };
    }

    const amountInPaise = Math.round(refundAmount * 100);

    /* ---------------------------------------------
       Mark pending
    --------------------------------------------- */

    payment.refundStatus = "pending";

    await payment.save();

    console.log("==========================================");

    console.log("RAZORPAY REFUND START");

    console.log("Booking ID:", bookingId.toString());

    console.log("Payment ID:", payment.transactionId);

    console.log("Refund Amount:", refundAmount);

    console.log("Amount in Paise:", amountInPaise);

    console.log("==========================================");

    /* ---------------------------------------------
       Create Razorpay refund
    --------------------------------------------- */

    const refund = await razorpay.payments.refund(payment.transactionId, {
      amount: amountInPaise,

      speed: "normal",

      notes: {
        bookingId: bookingId.toString(),

        reason: "Booking cancelled by administrator",
      },

      receipt: `refund_${bookingId.toString().slice(-20)}`,
    });

    /* ---------------------------------------------
       Save refund information
    --------------------------------------------- */

    payment.refundStatus =
      refund.status === "processed" ? "processed" : "pending";

    payment.refundId = refund.id || "";

    payment.refundAmount = Number(refund.amount || amountInPaise) / 100;

    if (refund.status === "processed") {
      payment.refundedAt = new Date();
    }

    await payment.save();

    console.log("==========================================");

    console.log("RAZORPAY REFUND SUCCESS");

    console.log("Refund ID:", refund.id);

    console.log("Refund Status:", refund.status);

    console.log("Refund Amount:", payment.refundAmount);

    console.log("==========================================");

    return {
      success: true,
      refunded: true,

      refundId: payment.refundId,

      refundStatus: payment.refundStatus,

      refundAmount: payment.refundAmount,
    };
  } catch (error) {
    console.error("==========================================");

    console.error("RAZORPAY REFUND FAILED");

    console.error(error);

    const errorDescription =
      error?.error?.description || error?.description || error?.message || "";

    console.error("Refund error message:", errorDescription || "Unknown error");

    console.error("==========================================");

    /* ---------------------------------------------
       Already fully refunded
    --------------------------------------------- */

    if (
      String(errorDescription).toLowerCase().includes("fully refunded already")
    ) {
      try {
        const payment = await Payment.findOne({
          booking: bookingId,
          status: "success",
        });

        if (payment) {
          payment.refundStatus = "processed";

          payment.refundAmount = Number(payment.amount || 0);

          payment.refundedAt = new Date();

          await payment.save();

          console.log(
            "Payment marked as processed because Razorpay confirmed it was already fully refunded.",
          );

          return {
            success: true,
            refunded: true,
            alreadyRefunded: true,

            refundId: payment.refundId || "",

            refundStatus: payment.refundStatus,

            refundAmount: payment.refundAmount,
          };
        }
      } catch (syncError) {
        console.error("Refund synchronization error:", syncError.message);
      }
    }

    /* ---------------------------------------------
       Mark failed
    --------------------------------------------- */

    try {
      await Payment.findOneAndUpdate(
        {
          booking: bookingId,
        },
        {
          refundStatus: "failed",
        },
      );
    } catch (dbError) {
      console.error("Failed to update refund failure status:", dbError.message);
    }

    return {
      success: false,
      refunded: false,

      message:
        error?.error?.description ||
        error?.message ||
        "Razorpay refund failed.",
    };
  }
};

/* ======================================================
   ADMIN - SYNC EXISTING REFUND
====================================================== */

const syncBookingRefund = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("==========================================");

    console.log("SYNC REFUND REQUEST RECEIVED");

    console.log("Booking ID:", id);

    console.log("Admin:", req.user?._id?.toString());

    console.log("==========================================");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      status: "success",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Successful payment not found for this booking.",
      });
    }

    if (!payment.transactionId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment ID is missing.",
      });
    }

    console.log("==========================================");

    console.log("SYNCING RAZORPAY REFUND");

    console.log("Booking ID:", booking._id.toString());

    console.log("Payment ID:", payment.transactionId);

    console.log("==========================================");

    /* ---------------------------------------------
       Get refunds from Razorpay
    --------------------------------------------- */

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (configErr) {
      return res.status(500).json({
        success: false,
        message: configErr.message || "Razorpay is not configured on the server.",
      });
    }

    const refundsResponse = await razorpay.payments.fetchMultipleRefund(
      payment.transactionId,
    );

    const refunds = Array.isArray(refundsResponse?.items)
      ? refundsResponse.items
      : [];

    console.log("Razorpay refunds found:", refunds.length);

    /* ---------------------------------------------
       No refunds
    --------------------------------------------- */

    if (refunds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Razorpay refund found for this payment.",
      });
    }

    /* ---------------------------------------------
       Find processed/pending refund
    --------------------------------------------- */

    const refund = refunds.find(
      (item) => item.status === "processed" || item.status === "pending",
    );

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "No processed or pending refund found.",
      });
    }

    /* ---------------------------------------------
       Save refund details
    --------------------------------------------- */

    payment.refundStatus =
      refund.status === "processed" ? "processed" : "pending";

    payment.refundId = refund.id || "";

    payment.refundAmount = Number(refund.amount || 0) / 100;

    if (refund.status === "processed") {
      payment.refundedAt = new Date();
    }

    await payment.save();

    console.log("==========================================");

    console.log("REFUND SYNC SUCCESS");

    console.log("Refund ID:", payment.refundId);

    console.log("Refund Status:", payment.refundStatus);

    console.log("Refund Amount:", payment.refundAmount);

    console.log("==========================================");

    return res.status(200).json({
      success: true,

      message: "Refund information synchronized successfully.",

      refund: {
        refundId: payment.refundId,

        refundStatus: payment.refundStatus,

        refundAmount: payment.refundAmount,

        refundedAt: payment.refundedAt,
      },
    });
  } catch (error) {
    console.error("==========================================");

    console.error("REFUND SYNCHRONIZATION ERROR");

    console.error(error);

    console.error("==========================================");

    return res.status(500).json({
      success: false,

      message: "Failed to synchronize refund information.",

      error: error?.error?.description || error?.message || "Unknown error",
    });
  }
};

/* ======================================================
   ADMIN - UPDATE BOOKING STATUS
====================================================== */

const updateAdminBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    /* ---------------------------------------------
         Validate booking ID
      --------------------------------------------- */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    /* ---------------------------------------------
         Validate status
      --------------------------------------------- */

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status. Allowed values are pending, confirmed, completed, and cancelled.",
      });
    }

    /* ---------------------------------------------
         Get booking
      --------------------------------------------- */

    const booking = await Booking.findById(id)
      .populate("user", "name email")
      .populate(
        "car",
        "brand model year numberPlate pricePerDay fuelType transmission seats image",
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /* ---------------------------------------------
         Already cancelled
      --------------------------------------------- */

    if (booking.status === "cancelled" && status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    /* ---------------------------------------------
         Completed cannot be cancelled
      --------------------------------------------- */

    if (booking.status === "completed" && status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled.",
      });
    }

    const previousStatus = booking.status;

    let refundResult = null;

    /* =============================================
         PAID BOOKING CANCELLATION
      ============================================= */

    if (
      status === "cancelled" &&
      previousStatus !== "cancelled" &&
      booking.paymentStatus === "paid"
    ) {
      console.log("Paid booking detected. Starting refund...");

      refundResult = await refundBookingPayment(booking._id);

      if (!refundResult.success) {
        return res.status(400).json({
          success: false,

          message:
            "Booking cancellation was not completed because the payment refund failed.",

          refundError: refundResult.message,
        });
      }

      console.log("Refund handled successfully.");
    }

    /* ---------------------------------------------
         Update booking status
      --------------------------------------------- */

    booking.status = status;

    await booking.save();

    /* ---------------------------------------------
         Log status update
      --------------------------------------------- */

    console.log("==========================================");

    console.log("ADMIN BOOKING STATUS UPDATE");

    console.log("Booking ID:", booking._id.toString());

    console.log("Previous Status:", previousStatus);

    console.log("New Status:", booking.status);

    console.log("Customer Email:", booking.user?.email || "No email");

    console.log("Payment Status:", booking.paymentStatus);

    if (refundResult) {
      console.log("Refund Status:", refundResult.refundStatus);

      console.log("Refund ID:", refundResult.refundId);

      console.log("Refund Amount:", refundResult.refundAmount);
    }

    console.log("==========================================");

    /* =============================================
         SEND CANCELLATION EMAIL
      ============================================= */

    if (status === "cancelled" && previousStatus !== "cancelled") {
      try {
        if (!booking.user?.email) {
          console.log("Customer email not found.");

          console.log("Cancellation email was not sent.");
        } else {
          console.log("Sending admin cancellation email...");

          /*
              IMPORTANT:
              Send the populated booking directly.
              This prevents N/A values in email.
            */

          await sendBookingCancellationEmail(booking);

          console.log(
            "Admin cancellation email sent successfully to:",
            booking.user.email,
          );
        }
      } catch (emailError) {
        /*
            Email failure does NOT undo
            the cancellation.
          */

        console.error("Admin cancellation email failed:");

        console.error(emailError);

        console.error("Email error message:", emailError.message);
      }
    }

    /* ---------------------------------------------
         Response
      --------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        status === "cancelled"
          ? refundResult?.refunded
            ? "Booking cancelled and payment refunded successfully."
            : "Booking cancelled successfully."
          : "Booking status updated successfully.",

      booking,

      refund: refundResult
        ? {
            refunded: refundResult.refunded,

            alreadyRefunded: refundResult.alreadyRefunded || false,

            refundId: refundResult.refundId || "",

            refundStatus: refundResult.refundStatus || "",

            refundAmount: refundResult.refundAmount || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Update admin booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
      error: error.message,
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
  updateAdminMemberStatus,
  getAdminBookings,
  updateAdminBookingStatus,
  syncBookingRefund,
};
