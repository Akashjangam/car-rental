// DriveNow Car Rental — MERN Stack Project
const Car = require("../models/Car");
const Review = require("../models/Review");
const mongoose = require("mongoose");


// =====================================================
// CREATE CAR - ADMIN
// =====================================================

const createCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      numberPlate,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      available,
    } = req.body;

    // Validate required fields
    if (
      !brand ||
      !model ||
      !year ||
      !numberPlate ||
      pricePerDay === undefined ||
      pricePerDay === "" ||
      !fuelType ||
      !transmission ||
      !seats
    ) {
      return res.status(400).json({
        success: false,
        message: "All car details are required",
      });
    }

    // Check duplicate number plate
    const existingCar = await Car.findOne({
      numberPlate: numberPlate.trim().toUpperCase(),
    });

    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists",
      });
    }

    const car = await Car.create({
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),

      numberPlate: numberPlate.trim().toUpperCase(),

      pricePerDay: Number(pricePerDay),
      fuelType,
      transmission,
      seats: Number(seats),

      available: available === "false" ? false : true,

      // Cloudinary image URL
      image: req.file ? req.file.path : "",

      // Admin-created cars have no dealer
      dealer: null,
    });

    return res.status(201).json({
      success: true,
      message: "Car created successfully",
      car,
    });
  } catch (error) {
    console.error("Create car error:", error);

    // Handle duplicate number plate
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create car",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL CARS
// =====================================================

const getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate("dealer", "name email").sort({
      createdAt: -1,
    });

    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$car",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviewMap = new Map();
    reviewStats.forEach((stat) => {
      reviewMap.set(stat._id.toString(), {
        averageRating: Number(stat.averageRating.toFixed(1)),
        totalReviews: stat.totalReviews,
      });
    });

    const carsWithReviews = cars.map((car) => {
      const carObj = car.toObject ? car.toObject() : car;
      const stats = reviewMap.get(car._id.toString()) || {
        averageRating: 0,
        totalReviews: 0,
      };
      return {
        ...carObj,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      };
    });

    return res.status(200).json({
      success: true,
      cars: carsWithReviews,
    });
  } catch (error) {
    console.error("Get cars error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get cars",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE CAR
// =====================================================

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car identifier",
      });
    }

    const car = await Car.findById(id).populate("dealer", "name email");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const reviewStats = await Review.aggregate([
      { $match: { car: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$car",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const stats = reviewStats[0] || { averageRating: 0, totalReviews: 0 };
    const carWithReview = {
      ...(car.toObject ? car.toObject() : car),
      averageRating: stats.averageRating
        ? Number(stats.averageRating.toFixed(1))
        : 0,
      totalReviews: stats.totalReviews || 0,
    };

    return res.status(200).json({
      success: true,
      car: carWithReview,
    });

  } catch (error) {
    console.error("Get car error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get car",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE CAR - ADMIN
// =====================================================

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car identifier",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const {
      brand,
      model,
      year,
      numberPlate,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      available,
    } = req.body;

    // =================================================
    // UPDATE CAR DETAILS
    // =================================================

    if (brand !== undefined && brand.trim() !== "") {
      car.brand = brand.trim();
    }

    if (model !== undefined && model.trim() !== "") {
      car.model = model.trim();
    }

    if (year !== undefined && year !== "") {
      car.year = Number(year);
    }

    // UPDATE NUMBER PLATE
    if (numberPlate !== undefined && numberPlate.trim() !== "") {
      const formattedNumberPlate = numberPlate.trim().toUpperCase();

      // Check if another car already uses this plate
      const existingCar = await Car.findOne({
        numberPlate: formattedNumberPlate,
        _id: { $ne: id },
      });

      if (existingCar) {
        return res.status(400).json({
          success: false,
          message: "A car with this number plate already exists",
        });
      }

      car.numberPlate = formattedNumberPlate;
    }

    if (pricePerDay !== undefined && pricePerDay !== "") {
      car.pricePerDay = Number(pricePerDay);
    }

    if (fuelType !== undefined) {
      car.fuelType = fuelType;
    }

    if (transmission !== undefined) {
      car.transmission = transmission;
    }

    if (seats !== undefined && seats !== "") {
      car.seats = Number(seats);
    }

    // =================================================
    // UPDATE AVAILABILITY
    // =================================================

    if (available !== undefined) {
      if (available === "false") {
        car.available = false;
      } else if (available === "true") {
        car.available = true;
      } else {
        car.available = Boolean(available);
      }
    }

    // =================================================
    // UPDATE IMAGE
    // =================================================

    // Cloudinary returns the permanent image URL
    // in req.file.path
    if (req.file) {
      car.image = req.file.path;
    }

    // Do not change dealer ownership

    await car.save();

    return res.status(200).json({
      success: true,
      message: "Car updated successfully",
      car,
    });
  } catch (error) {
    console.error("Update car error:", error);

    // Handle duplicate number plate
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update car",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CAR - ADMIN
// =====================================================

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car identifier",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    await Car.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Delete car error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete car",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
};
