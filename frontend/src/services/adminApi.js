import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getAdminBookings = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/admin/bookings`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateAdminBookingStatus = async (
  id,
  status
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/admin/bookings/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};