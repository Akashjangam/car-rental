// DriveNow Car Rental — MERN Stack Project
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const connectDB = require("./config/db");

// Models
const Booking = require("./models/Booking");

// Routes
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const dealerRoutes = require("./routes/dealerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

/* =====================================================
   CORS
===================================================== */

const envOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  "https://drivenow-carrental.vercel.app",
  "https://drivenow-car-rental-5heb5dpwo-task-manager20.vercel.app",
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow any localhost port during development
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* =====================================================
   BODY PARSING
===================================================== */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* =====================================================
   STATIC UPLOADS
===================================================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);

app.use("/api/cars", carRoutes);

app.use("/api/dealer", dealerRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reviews", reviewRoutes);

/* =====================================================
   ROOT / HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Car Rental API is running",
  });
});

/* =====================================================
   AUTOMATIC BOOKING COMPLETION
===================================================== */

const completeExpiredBookings = async () => {
  try {
    const now = new Date();

    const result = await Booking.updateMany(
      {
        status: "confirmed",

        paymentStatus: "paid",

        endDate: {
          $lte: now,
        },
      },

      {
        $set: {
          status: "completed",
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Booking Job] ${result.modifiedCount} booking(s) marked as completed.`,
      );
    }
  } catch (error) {
    console.error(
      "[Booking Job] Failed to complete expired bookings:",
      error.message,
    );
  }
};

/* =====================================================
   AUTOMATIC EXPIRED PENDING BOOKINGS CANCELLATION
   Unpaid pending bookings expire after 30 minutes to
   prevent vehicle lockout.
===================================================== */

const cancelExpiredPendingBookings = async () => {
  try {
    const expirationThreshold = new Date(Date.now() - 30 * 60 * 1000);

    const result = await Booking.updateMany(
      {
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: {
          $lte: expirationThreshold,
        },
      },
      {
        $set: {
          status: "cancelled",
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Booking Job] ${result.modifiedCount} expired unpaid pending booking(s) marked as cancelled.`,
      );
    }
  } catch (error) {
    console.error(
      "[Booking Job] Failed to cancel expired pending bookings:",
      error.message,
    );
  }
};


/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("========================================");

  console.error("GLOBAL ERROR");

  console.error("========================================");

  console.error("Name:", err.name);

  console.error("Message:", err.message);

  console.error("Error:", err);

  console.error("========================================");

  /* ---------- Multer Error ---------- */

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err,
    });
  }

  /* ---------- CORS Error ---------- */

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request.",
    });
  }

  /* ---------- General Error ---------- */

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: err,
  });
});

/* =====================================================
   SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB first
    await connectDB();

    console.log("MongoDB connected successfully.");

    /*
      Run once immediately after server starts.
      This catches bookings that expired while
      the server was stopped.
    */

    await completeExpiredBookings();
    await cancelExpiredPendingBookings();

    /*
      Check every 60 seconds.
    */

    setInterval(async () => {
      await completeExpiredBookings();
      await cancelExpiredPendingBookings();
    }, 60 * 1000);


    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);

      console.log("Automatic booking completion: ENABLED");

      console.log("Booking completion check: every 60 seconds");

      console.log("Allowed CORS origins:");

      allowedOrigins.forEach((origin) => {
        console.log(`- ${origin}`);
      });
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);

    process.exit(1);
  }
};

startServer();
