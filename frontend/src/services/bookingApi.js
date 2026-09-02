import api from "./api";

/* ======================================================
   CREATE BOOKING
====================================================== */

export const createBooking = async (bookingData, token) => {
  const response = await api.post("/bookings", bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/* ======================================================
   GET MY BOOKINGS
====================================================== */

export const getMyBookings = async (token) => {
  const response = await api.get("/bookings/my-bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/* ======================================================
   GET SINGLE BOOKING
====================================================== */

export const getBookingById = async (bookingId, token) => {
  const response = await api.get(`/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/* ======================================================
   CANCEL BOOKING
====================================================== */

export const cancelBooking = async (bookingId, token) => {
  const response = await api.put(
    `/bookings/${bookingId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
