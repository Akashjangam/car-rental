const Car = require("../models/Car");

// =====================================================
// CREATE DEALER CAR
// =====================================================

const createDealerCar = async (req, res) => {
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
      !pricePerDay ||
      !fuelType ||
      !transmission ||
      !seats
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required car details.",
      });
    }

    // Format number plate
    const formattedNumberPlate = numberPlate.trim().toUpperCase();

    // Check duplicate number plate
    const existingCar = await Car.findOne({
      numberPlate: formattedNumberPlate,
    });

    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    // Cloudinary image URL
    const image = req.file ? req.file.path : "";

    // Create car
    const car = await Car.create({
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),

      numberPlate: formattedNumberPlate,

      pricePerDay: Number(pricePerDay),
      fuelType,
      transmission,
      seats: Number(seats),

      available:
        available === undefined
          ? true
          : available === "true" || available === true,

      // Automatically assign logged-in dealer
      dealer: req.user._id,

      image,
    });

    return res.status(201).json({
      success: true,
      message: "Car added successfully.",
      car,
    });
  } catch (error) {
    console.error("Create dealer car error:", error);

    // Duplicate number plate
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add car.",
      error: error.message,
    });
  }
};

// =====================================================
// GET DEALER CARS
// =====================================================

const getDealerCars = async (req, res) => {
  try {
    const cars = await Car.find({
      dealer: req.user._id,
    })
      .populate("dealer", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Get dealer cars error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer cars.",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE DEALER CAR
// =====================================================

const getDealerCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.user._id,
    }).populate("dealer", "name email role");

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found.",
      });
    }

    return res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    console.error("Get dealer car error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch car.",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE DEALER CAR
// =====================================================

const updateDealerCar = async (req, res) => {
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

    // Find only the dealer's own car
    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.user._id,
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or you do not have permission to edit it.",
      });
    }

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

    // =================================================
    // UPDATE NUMBER PLATE
    // =================================================

    if (numberPlate !== undefined && numberPlate.trim() !== "") {
      const formattedNumberPlate = numberPlate.trim().toUpperCase();

      // Check whether another car already has this plate
      const existingCar = await Car.findOne({
        numberPlate: formattedNumberPlate,
        _id: { $ne: req.params.id },
      });

      if (existingCar) {
        return res.status(400).json({
          success: false,
          message: "A car with this number plate already exists.",
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
      car.available = available === "true" || available === true;
    }

    // =================================================
    // UPDATE IMAGE
    // =================================================

    if (req.file) {
      car.image = req.file.path;
    }

    // Do NOT change dealer ownership

    await car.save();

    return res.status(200).json({
      success: true,
      message: "Car updated successfully.",
      car,
    });
  } catch (error) {
    console.error("Update dealer car error:", error);

    // Invalid MongoDB ID
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    // Duplicate number plate
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A car with this number plate already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update car.",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE DEALER CAR
// =====================================================

const deleteDealerCar = async (req, res) => {
  try {
    // Only delete a car belonging to the logged-in dealer
    const car = await Car.findOneAndDelete({
      _id: req.params.id,
      dealer: req.user._id,
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found or you do not have permission to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Car deleted successfully.",
    });
  } catch (error) {
    console.error("Delete dealer car error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete car.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createDealerCar,
  getDealerCars,
  getDealerCarById,
  updateDealerCar,
  deleteDealerCar,
};
