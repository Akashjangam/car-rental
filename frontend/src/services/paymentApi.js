import api from "./api";

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

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

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyPayment = async (paymentData, token) => {
  const response = await api.post("/payments/verify", paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// ==========================================
// GET PAYMENT STATUS
// ==========================================

export const getPaymentStatus = async (orderId, token) => {
  const response = await api.get(`/payments/status/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
