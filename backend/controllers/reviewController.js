const mongoose = require("mongoose");

const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Car = require("../models/Car");

// =====================================================
// CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
  try {
    const { carId, bookingId, rating, comment } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(carId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid car or booking ID",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    if (comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 3 characters",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters",
      });
    }

    // Check car
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Check booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in user
    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own booking",
      });
    }

    // Make sure booking belongs to selected car
    if (String(booking.car) !== String(carId)) {
      return res.status(400).json({
        success: false,
        message: "This booking does not belong to this car",
      });
    }

    // Review only after completed rental
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can review this car only after completing the rental",
      });
    }

    // Prevent duplicate review for same booking
    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      car: carId,
      booking: bookingId,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Populate response
    await review.populate([
      {
        path: "user",
        select: "name",
      },
      {
        path: "car",
        select: "brand model",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    // Handle duplicate booking review
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

// =====================================================
// GET REVIEWS FOR ONE CAR
// =====================================================

const getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    // Check car
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // Get reviews
    const reviews = await Review.find({
      car: carId,
    })
      .populate("user", "name")
      .populate("car", "brand model")
      .sort({ createdAt: -1 });

    // Calculate average
    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0,
    );

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get car reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch car reviews",
    });
  }
};

// =====================================================
// GET ALL REVIEWS
// =====================================================
// Used by Home -> Customer Testimonials
// Returns latest reviews from MongoDB
// =====================================================

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("car", "brand model")
      .sort({ createdAt: -1 })
      .limit(6);

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,

      user: review.user
        ? {
            _id: review.user._id,
            name: review.user.name,
          }
        : null,

      car: review.car
        ? {
            _id: review.car._id,
            brand: review.car.brand,
            model: review.car.model,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      reviews: formattedReviews,
      totalReviews: formattedReviews.length,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// =====================================================
// UPDATE REVIEW
// =====================================================

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only owner can update
    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    // Validate comment if provided
    if (comment !== undefined) {
      if (!comment || !comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment is required",
        });
      }

      if (comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 3 characters",
        });
      }

      if (comment.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 1000 characters",
        });
      }

      review.comment = comment.trim();
    }

    await review.save();

    await review.populate([
      {
        path: "user",
        select: "name",
      },
      {
        path: "car",
        select: "brand model",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// =====================================================
// DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only owner can delete
    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createReview,
  getCarReviews,
  getAllReviews,
  updateReview,
  deleteReview,
};
