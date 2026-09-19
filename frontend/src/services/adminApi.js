import api from "./api";

// ======================================================
// ADMIN - DASHBOARD
// ======================================================

export const getAdminDashboard = async (token) => {
  const response = await api.get("/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// ADMIN - BOOKINGS
// ======================================================

export const getAdminBookings = async (token) => {
  const response = await api.get("/admin/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Backward-compatible alias
export const getAllBookings = getAdminBookings;

// ======================================================
// ADMIN - UPDATE BOOKING STATUS
// ======================================================

export const updateAdminBookingStatus = async (bookingId, status, token) => {
  const response = await api.put(
    `/admin/bookings/${bookingId}/status`,
    {
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// Backward-compatible alias
export const updateBookingStatus = updateAdminBookingStatus;

// ======================================================
// ADMIN - SYNC BOOKING REFUND
// ======================================================

export const syncBookingRefund = async (bookingId, token) => {
  const response = await api.post(
    `/admin/bookings/${bookingId}/refund-sync`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// ======================================================
// ADMIN - USERS
// ======================================================

export const getAllUsers = async (token) => {
  const response = await api.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// ADMIN - UPDATE USER ROLE
// ======================================================

export const updateUserRole = async (userId, role, token) => {
  const response = await api.put(
    `/admin/users/${userId}/role`,
    {
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// ======================================================
// ADMIN - CREATE MEMBER
// ======================================================

export const createAdminMember = async (memberData, token) => {
  const response = await api.post("/admin/members", memberData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// ADMIN - DELETE MEMBER
// ======================================================

export const deleteAdminMember = async (userId, token) => {
  const response = await api.delete(`/admin/members/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// ADMIN - ACTIVATE / CANCEL MEMBERSHIP
// ======================================================

export const updateAdminMemberStatus = async (userId, isActive, token) => {
  const response = await api.put(
    `/admin/members/${userId}/status`,
    {
      isActive,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// ======================================================
// DEALER - GET MY CARS
// ======================================================

export const getDealerCars = async (token) => {
  const response = await api.get("/dealer/cars", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// DEALER - GET ANALYTICS
// ======================================================

export const getDealerAnalytics = async (token) => {
  const response = await api.get("/dealer/analytics", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// DEALER - GET BOOKINGS
// ======================================================

export const getDealerBookings = async (token) => {
  const response = await api.get("/dealer/bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// DEALER - UPDATE BOOKING STATUS
// ======================================================

export const updateDealerBookingStatus = async (bookingId, status, token) => {
  const response = await api.put(
    `/dealer/bookings/${bookingId}/status`,
    {
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// ======================================================
// DEALER - GET SINGLE CAR
// ======================================================

export const getDealerCarById = async (carId, token) => {
  const response = await api.get(`/dealer/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// DEALER - CREATE CAR
// ======================================================

export const createDealerCar = async (formData, token) => {
  const response = await api.post("/dealer/cars", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ======================================================
// DEALER - UPDATE CAR
// ======================================================

export const updateDealerCar = async (carId, formData, token) => {
  const response = await api.put(`/dealer/cars/${carId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ======================================================
// DEALER - DELETE CAR
// ======================================================

export const deleteDealerCar = async (carId, token) => {
  const response = await api.delete(`/dealer/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
