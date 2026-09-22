// DriveNow Car Rental — MERN Stack Project
const express = require("express");

const protect = require("../middleware/authMiddleware");
const dealer = require("../middleware/dealerMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createDealerCar,
  getDealerCars,
  getDealerCarById,
  updateDealerCar,
  deleteDealerCar,
  getDealerAnalytics,
  getDealerBookings,
  updateDealerBookingStatus,
} = require("../controllers/dealerController");

const router = express.Router();

// =====================================================
// DEALER - PROFILE
// =====================================================

router.get("/profile", protect, dealer, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Dealer profile accessed successfully.",
    user: req.user,
  });
});

// =====================================================
// DEALER - ANALYTICS
// =====================================================

router.get("/analytics", protect, dealer, getDealerAnalytics);

// =====================================================
// DEALER - BOOKINGS
// =====================================================

router.get("/bookings", protect, dealer, getDealerBookings);

// UPDATE BOOKING STATUS
router.put("/bookings/:id/status", protect, dealer, updateDealerBookingStatus);

// =====================================================
// DEALER - GET MY CARS
// =====================================================

router.get("/cars", protect, dealer, getDealerCars);

// =====================================================
// DEALER - GET SINGLE CAR
// =====================================================

router.get("/cars/:id", protect, dealer, getDealerCarById);

// =====================================================
// DEALER - CREATE CAR
// =====================================================

router.post("/cars", protect, dealer, upload.single("image"), createDealerCar);

// =====================================================
// DEALER - UPDATE CAR
// =====================================================

router.put(
  "/cars/:id",
  protect,
  dealer,
  upload.single("image"),
  updateDealerCar,
);

// =====================================================
// DEALER - DELETE CAR
// =====================================================

router.delete("/cars/:id", protect, dealer, deleteDealerCar);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
