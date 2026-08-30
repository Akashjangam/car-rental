const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/cars",
  carRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Car Rental API is running...",
  });
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});