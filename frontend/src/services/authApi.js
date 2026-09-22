// DriveNow Car Rental — MERN Stack Project
import api from "./api";

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

/**
 * Login user
 */
export const loginUser = async (loginData) => {
  const response = await api.post("/auth/login", loginData);

  return response.data;
};

/**
 * Get logged-in user's profile
 */
export const getProfile = async (token) => {
  const response = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });

  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });

  return response.data;
};

