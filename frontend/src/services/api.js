// DriveNow Car Rental — MERN Stack Project
import axios from "axios";

const rawOrigin = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Normalize origin by removing trailing slashes and redundant trailing /api path
export const API_ORIGIN = rawOrigin
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;