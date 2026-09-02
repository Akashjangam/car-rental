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
