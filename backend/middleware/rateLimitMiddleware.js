const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for authentication operations (login, register)
 * Prevents brute force credential stuffing without blocking normal users.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

/**
 * Strict rate limiter for password reset requests to protect email services.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for payment verification to prevent tampering and automated verification spam.
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 verification attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment verification requests. Please wait a moment and try again.",
  },
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  paymentLimiter,
};
