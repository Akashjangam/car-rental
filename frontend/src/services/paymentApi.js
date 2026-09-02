import api from "./api";

export const createPayment = async (bookingId, token) => {
  const response = await api.post(
    "/payments",
    {
      bookingId:
        typeof bookingId === "object" ? bookingId.bookingId : bookingId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getPaymentStatus = async (orderId, token) => {
  const response = await api.get(`/payments/status/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
