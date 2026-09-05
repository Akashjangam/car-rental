const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

dotenv.config();

const connectDB = require("./config/db");

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

const allowedOrigins = [
  "http://localhost:5173",
  "https://drivenow-carrental.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from Postman, server-to-server, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

/* =====================================================
   BODY PARSING
===================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   STATIC UPLOADS
===================================================== */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
);

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
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);

      console.log("Allowed CORS origins:");

      allowedOrigins.forEach((origin) => {
        console.log(`- ${origin}`);
      });
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error.message,
    );

    process.exit(1);
  }
};

startServer();