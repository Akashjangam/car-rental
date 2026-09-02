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

// DEALER PROFILE

router.get("/profile", protect, dealer, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dealer profile accessed successfully",
    user: req.user,
  });
});

// DEALER CARS

// Get all dealer cars
router.get("/cars", protect, dealer, getDealerCars);

// Get single dealer car
router.get("/cars/:id", protect, dealer, getDealerCarById);

// Create dealer car
router.post("/cars", protect, dealer, upload.single("image"), createDealerCar);

// Update dealer car
router.put(
  "/cars/:id",
  protect,
  dealer,
  upload.single("image"),
  updateDealerCar,
);

// Delete dealer car
router.delete("/cars/:id", protect, dealer, deleteDealerCar);

module.exports = router;
