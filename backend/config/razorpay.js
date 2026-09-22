// DriveNow Car Rental — MERN Stack Project
const Razorpay = require("razorpay");

let instance = null;

/**
 * Lazily get or initialize the Razorpay client instance.
 * Ensures the server starts safely even if credentials are missing.
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const err = new Error(
      "Razorpay credentials are not configured in environment variables."
    );
    err.isConfigurationError = true;
    throw err;
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return instance;
};

module.exports = {
  getRazorpayInstance,
};
