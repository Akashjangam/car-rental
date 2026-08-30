import axios from "axios";

const API_URL = "http://localhost:5000/api";

// GET ALL CARS
export const getCars = async (params = {}) => {
  const response = await axios.get(`${API_URL}/cars`, {
    params,
  });

  return response.data;
};

// GET SINGLE CAR
export const getCarById = async (id) => {
  const response = await axios.get(`${API_URL}/cars/${id}`);

  return response.data;
};