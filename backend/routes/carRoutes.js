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

const router = express.Router();

// ========================================
// PUBLIC
// ========================================

router.get("/", getCars);

router.get("/:id", getCarById);

// ========================================
// ADMIN
// ========================================

router.post(
  "/",
  protect,
  admin,
  createCar
);

router.put(
  "/:id",
  protect,
  admin,
  updateCar
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteCar
);

module.exports = router;