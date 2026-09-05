import api from "./api";

export const createReview = async (reviewData, token) => {
  const response = await api.post("/reviews", reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getAllReviews = async () => {
  const response = await api.get("/reviews");
  return response.data;
};

export const getCarReviews = async (carId) => {
  const response = await api.get(`/reviews/car/${carId}`);
  return response.data;
};

export const updateReview = async (reviewId, reviewData, token) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteReview = async (reviewId, token) => {
  const response = await api.delete(`/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};