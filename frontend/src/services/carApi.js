import api from "./api";

export const getCars = async (params = {}) => {
  const response = await api.get("/cars", {
    params,
  });

  return response.data;
};

export const getCarById = async (carId) => {
  const response = await api.get(`/cars/${carId}`);

  return response.data;
};

export const createCar = async (formData, token) => {
  const response = await api.post("/cars", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateCar = async (carId, formData, token) => {
  const response = await api.put(`/cars/${carId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteCar = async (carId, token) => {
  const response = await api.delete(`/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
