const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getCarReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

/*
  REVIEW ROUTES
*/

// Get latest customer reviews
router.get("/", getAllReviews);

// Create a review
router.post("/", protect, createReview);

// Get all reviews for a car
router.get("/car/:carId", getCarReviews);

// Update own review
router.put("/:id", protect, updateReview);

// Delete own review
router.delete("/:id", protect, deleteReview);

module.exports = router;
