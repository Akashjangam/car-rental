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
} = require("../controllers/dealerController");

const router = express.Router();

// ========================================
// DEALER PROFILE
// ========================================

// Get dealer profile
// GET /api/dealer/profile
router.get("/profile", protect, dealer, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dealer profile accessed successfully",
    user: req.user,
  });
});

// ========================================
// DEALER CARS
// ========================================

// Get all dealer cars
// GET /api/dealer/cars
router.get("/cars", protect, dealer, getDealerCars);

// Get single dealer car
// GET /api/dealer/cars/:id
router.get("/cars/:id", protect, dealer, getDealerCarById);

// Create dealer car
// POST /api/dealer/cars
router.post("/cars", protect, dealer, upload.single("image"), createDealerCar);

// Update dealer car
// PUT /api/dealer/cars/:id
router.put(
  "/cars/:id",
  protect,
  dealer,
  upload.single("image"),
  updateDealerCar,
);

// Delete dealer car
// DELETE /api/dealer/cars/:id
router.delete("/cars/:id", protect, dealer, deleteDealerCar);

module.exports = router;
