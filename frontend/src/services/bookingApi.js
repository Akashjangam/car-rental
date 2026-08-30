import axios from "axios";

const API_URL = "http://localhost:5000/api";

// CREATE BOOKING
export const createBooking = async (bookingData, token) => {
  const response = await axios.post(
    `${API_URL}/bookings`,
    bookingData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// GET MY BOOKINGS
export const getMyBookings = async (token) => {
  const response = await axios.get(
    `${API_URL}/bookings/my-bookings`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// CANCEL BOOKING
export const cancelBooking = async (id, token) => {
  const response = await axios.put(
    `${API_URL}/bookings/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};