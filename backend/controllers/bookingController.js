const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Payment = require("../models/payment");
const { getRazorpayInstance } = require("../config/razorpay");

const { sendBookingCancellationEmail } = require("../services/emailService");

/* =========================================================
   REFUND BOOKING PAYMENT
========================================================= */

const refundBookingPayment = async (booking) => {
  try {
    console.log("========================================");
    console.log("BOOKING REFUND REQUEST");
    console.log("Booking ID:", booking._id.toString());
    console.log("========================================");

    const razorpay = getRazorpayInstance();


    /* ---------- Find successful payment ---------- */

    const payment = await Payment.findOne({
      booking: booking._id,
      status: "success",
    });

    if (!payment) {
      throw new Error(
        "Paid booking payment record was not found. Refund cannot be processed.",
      );
    }

    console.log("Payment ID:", payment._id.toString());
    console.log("Razorpay Payment ID:", payment.transactionId);
    console.log("Payment amount:", payment.amount);

    /* ---------- Check Razorpay payment ID ---------- */

    if (!payment.transactionId) {
      throw new Error(
        "Razorpay payment ID is missing. Refund cannot be processed.",
      );
    }

    /* =====================================================
       CHECK IF REFUND ALREADY EXISTS
    ===================================================== */

    let refundsResponse;

    try {
      refundsResponse = await razorpay.payments.fetchMultipleRefund(
        payment.transactionId,
      );
    } catch (error) {
      console.error(
        "Failed to check existing Razorpay refunds:",
        error.message,
      );

      throw new Error("Unable to verify existing Razorpay refund status.");
    }

    const refunds = refundsResponse?.items || [];

    console.log("Existing Razorpay refunds:", refunds.length);

    /* ---------- Find an existing refund ---------- */

    if (refunds.length > 0) {
      const latestRefund = refunds[0];

      console.log("Existing refund found:", latestRefund.id);

      console.log("Existing refund status:", latestRefund.status);

      /* ---------- Already processed ---------- */

      if (latestRefund.status === "processed") {
        payment.refundStatus = "processed";
        payment.refundId = latestRefund.id;
        payment.refundAmount = Number(latestRefund.amount || 0) / 100;
        payment.refundedAt = latestRefund.created_at
          ? new Date(latestRefund.created_at * 1000)
          : new Date();

        await payment.save();

        console.log("Refund was already processed. Local payment updated.");

        return {
          payment,
          refund: latestRefund,
          alreadyRefunded: true,
        };
      }

      /* ---------- Refund pending/processing ---------- */

      if (
        latestRefund.status === "pending" ||
        latestRefund.status === "initiated" ||
        latestRefund.status === "processing"
      ) {
        payment.refundStatus = "pending";
        payment.refundId = latestRefund.id;
        payment.refundAmount = Number(latestRefund.amount || 0) / 100;

        await payment.save();

        throw new Error(
          "A Razorpay refund is already in progress for this payment. Please wait for it to complete.",
        );
      }

      /* ---------- Failed refund ---------- */

      if (latestRefund.status === "failed") {
        console.log("Previous refund failed. A new refund will be attempted.");
      }
    }

    /* =====================================================
       CALCULATE FULL REFUND AMOUNT
    ===================================================== */

    const refundAmount = Number(payment.amount || booking.totalAmount || 0);

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw new Error("Invalid payment amount. Refund cannot be processed.");
    }

    const amountInPaise = Math.round(refundAmount * 100);

    console.log("Refund amount:", refundAmount);

    console.log("Refund amount in paise:", amountInPaise);

    /* =====================================================
       CREATE RAZORPAY REFUND
    ===================================================== */

    payment.refundStatus = "pending";
    await payment.save();

    console.log("Creating Razorpay refund...");

    let refund;

    try {
      refund = await razorpay.payments.refund(payment.transactionId, {
        amount: amountInPaise,
        speed: "normal",
        notes: {
          bookingId: booking._id.toString(),
          reason: "Booking cancelled by customer",
        },
        receipt: `refund_${booking._id.toString().slice(-20)}`,
      });
    } catch (refundError) {
      console.error("Razorpay refund creation failed:", refundError.message);

      /*
       * Razorpay can return an error if the payment was already
       * refunded between our check and refund creation.
       *
       * Check Razorpay one more time before declaring failure.
       */

      try {
        const latestRefunds = await razorpay.payments.fetchMultipleRefund(
          payment.transactionId,
        );

        const latestItems = latestRefunds?.items || [];

        if (latestItems.length > 0) {
          const latestRefund = latestItems[0];

          if (
            latestRefund.status === "processed" ||
            latestRefund.status === "pending" ||
            latestRefund.status === "initiated" ||
            latestRefund.status === "processing"
          ) {
            payment.refundStatus =
              latestRefund.status === "processed" ? "processed" : "pending";

            payment.refundId = latestRefund.id;

            payment.refundAmount = Number(latestRefund.amount || 0) / 100;

            if (latestRefund.status === "processed") {
              payment.refundedAt = latestRefund.created_at
                ? new Date(latestRefund.created_at * 1000)
                : new Date();
            }

            await payment.save();

            if (latestRefund.status === "processed") {
              return {
                payment,
                refund: latestRefund,
                alreadyRefunded: true,
              };
            }

            throw new Error(
              "A Razorpay refund is already in progress for this payment.",
            );
          }
        }
      } catch (syncError) {
        /*
         * If this is our own refund-in-progress message,
         * preserve it. Otherwise use the original error.
         */
        if (
          syncError.message &&
          syncError.message.includes("refund is already in progress")
        ) {
          throw syncError;
        }
      }

      payment.refundStatus = "failed";
      payment.responseCode = refundError.code || "REFUND_FAILED";
      payment.responseMessage = refundError.message || "Razorpay refund failed";

      await payment.save();

      throw new Error(
        `Razorpay refund failed: ${
          refundError.message || "Unknown refund error"
        }`,
      );
    }

    /* =====================================================
       SAVE REFUND DETAILS
    ===================================================== */

    payment.refundStatus =
      refund.status === "processed" ? "processed" : "pending";

    payment.refundId = refund.id;

    payment.refundAmount = Number(refund.amount || 0) / 100;

    if (refund.status === "processed") {
      payment.refundedAt = refund.created_at
        ? new Date(refund.created_at * 1000)
        : new Date();
    }

    payment.responseCode = "REFUND_CREATED";

    payment.responseMessage = "Razorpay refund created successfully";

    await payment.save();

    console.log("Razorpay refund created:", refund.id);

    console.log("Refund status:", refund.status);

    console.log("Refund amount:", Number(refund.amount || 0) / 100);

    console.log("========================================");

    return {
      payment,
      refund,
      alreadyRefunded: false,
    };
  } catch (error) {
    console.error("Refund booking payment error:", error.message);

    throw error;
  }
};

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

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Automatically cancel any expired unpaid pending bookings for this vehicle
    await Booking.updateMany(
      {
        car: carId,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: { $lte: thirtyMinutesAgo },
      },
      {
        $set: { status: "cancelled" },
      },
    );

    const overlappingBooking = await Booking.findOne({
      car: carId,
      status: {
        $in: ["pending", "confirmed"],
      },
      $or: [
        { status: "confirmed" },
        { status: "pending", paymentStatus: "paid" },
        {
          status: "pending",
          paymentStatus: "unpaid",
          createdAt: { $gt: thirtyMinutesAgo },
        },
      ],
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
   CUSTOMER CANCELLATION + AUTOMATIC REFUND
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
       PAID BOOKING
       REFUND FIRST
    ===================================================== */

    let refundResult = null;

    if (booking.paymentStatus === "paid") {
      console.log("PAID BOOKING DETECTED.");

      console.log("Starting automatic Razorpay refund...");

      try {
        refundResult = await refundBookingPayment(booking);

        console.log("Refund completed successfully.");
      } catch (refundError) {
        console.error("Refund failed:", refundError.message);

        /*
         * IMPORTANT:
         * Do NOT cancel the booking if the refund
         * could not be processed.
         */

        return res.status(400).json({
          success: false,
          message:
            refundError.message ||
            "Payment refund failed. Booking was not cancelled.",
          refundFailed: true,
        });
      }
    }

    /* =====================================================
       CANCEL BOOKING
       Only happens after successful refund for paid bookings
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

    if (refundResult?.refund) {
      console.log("Refund ID:", refundResult.refund.id);

      console.log("Refund status:", refundResult.refund.status);

      console.log(
        "Refund amount:",
        Number(refundResult.refund.amount || 0) / 100,
      );
    }

    console.log("==============================================");

    /* =====================================================
       SEND CANCELLATION EMAIL
    ===================================================== */

    if (bookingForEmail && bookingForEmail.user && bookingForEmail.user.email) {
      console.log("CALLING CANCELLATION EMAIL FUNCTION...");

      /*
       * Pass the populated booking directly.
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

    const wasPaid = booking.paymentStatus === "paid";

    let responseMessage;

    if (wasPaid) {
      if (
        refundResult?.refund?.status === "processed" ||
        refundResult?.alreadyRefunded
      ) {
        responseMessage =
          "Booking cancelled and payment refunded successfully.";
      } else {
        responseMessage =
          "Booking cancelled successfully. Your payment refund has been initiated.";
      }
    } else {
      responseMessage = "Booking cancelled successfully.";
    }

    return res.status(200).json({
      success: true,
      message: responseMessage,

      refund: refundResult?.refund
        ? {
            id: refundResult.refund.id,
            status: refundResult.refund.status,
            amount: Number(refundResult.refund.amount || 0) / 100,
          }
        : null,

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
  refundBookingPayment,
};

