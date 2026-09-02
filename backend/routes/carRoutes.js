const express = require("express");

const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Get all cars
// GET /api/cars
router.get("/", getCars);

// Get single car
// GET /api/cars/:id
router.get("/:id", getCarById);

// ========================================
// ADMIN ROUTES
// ========================================

// Create car
// POST /api/cars
router.post("/", protect, admin, upload.single("image"), createCar);

// Update car
// PUT /api/cars/:id
router.put("/:id", protect, admin, upload.single("image"), updateCar);

// Delete car
// DELETE /api/cars/:id
router.delete("/:id", protect, admin, deleteCar);

module.exports = router;
