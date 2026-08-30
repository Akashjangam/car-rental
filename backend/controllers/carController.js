const Car = require("../models/Car");

// GET ALL CARS
// SEARCH , FILTERS , PAGINATION , SORTING

const getCars = async (req, res) => {
  try {
    const {
      brand,
      transmission,
      seats,
      available,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Brand search
    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    // Transmission filter
    if (transmission) {
      filter.transmission = transmission;
    }

    // Seats filter
    if (seats) {
      filter.seats = Number(seats);
    }

    // Availability filter
    if (available !== undefined) {
      filter.available = available === "true";
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};

      if (minPrice) {
        filter.pricePerDay.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.pricePerDay.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "priceAsc") {
      sortOption = { pricePerDay: 1 };
    } else if (sort === "priceDesc") {
      sortOption = { pricePerDay: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    // Count filtered cars
    const totalCars = await Car.countDocuments(filter);

    // Get cars
    const cars = await Car.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cars.length,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
        limit,
      },

      cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE CAR

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// CREATE CAR - ADMIN

const createCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      image,
      available,
    } = req.body;

    const car = await Car.create({
      brand,
      model,
      year,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      image,
      available,
    });

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================
// UPDATE CAR - ADMIN
// =================================
const updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE CAR - ADMIN

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};