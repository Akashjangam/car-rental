// DriveNow Car Rental — MERN Stack Project
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ========================================
// CLOUDINARY STORAGE
// ========================================

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "drivenow/cars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const path = require("path");

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const ext = path.extname(file.originalname || "").toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only valid JPG, JPEG, PNG, and WEBP image files are allowed."),
      false,
    );
  }
};


// ========================================
// MULTER
// ========================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ========================================
// EXPORT
// ========================================

module.exports = upload;
