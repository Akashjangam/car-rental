import { useEffect, useState } from "react";

import {
  getAdminBookings,
  updateAdminBookingStatus,
} from "../services/adminApi";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH BOOKINGS
  // ========================================

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminBookings();

      console.log("Admin bookings:", data);

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(
        "Failed to load admin bookings:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load admin bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD BOOKINGS
  // ========================================

  useEffect(() => {
    fetchBookings();
  }, []);

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (
    bookingId,
    status
  ) => {
    try {
      await updateAdminBookingStatus(
        bookingId,
        status
      );

      await fetchBookings();
    } catch (error) {
      console.error(
        "Update booking error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update booking"
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-slate-600">
            Loading bookings...
          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Manage Bookings
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage all customer car
            bookings.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 border border-red-200 p-4 text-red-700">

            <p className="font-semibold">
              Error
            </p>

            <p className="mt-1">
              {error}
            </p>

            <button
              onClick={fetchBookings}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* NO BOOKINGS */}

        {!error && bookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">

            <h2 className="text-xl font-semibold text-slate-900">
              No bookings found
            </h2>

            <p className="mt-2 text-slate-500">
              Customer bookings will appear here.
            </p>

          </div>
        )}

        {/* BOOKINGS TABLE */}

        {bookings.length > 0 && (

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                {/* TABLE HEADER */}

                <thead className="bg-slate-100 border-b">

                  <tr>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Car
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Start Date
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      End Date
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody>

                  {bookings.map((booking) => (

                    <tr
                      key={booking._id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >

                      {/* CUSTOMER */}

                      <td className="px-5 py-5">

                        <p className="font-semibold text-slate-900">
                          {booking.user?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {booking.user?.email ||
                            "No email"}
                        </p>

                      </td>

                      {/* CAR + IMAGE */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-4">

                          {/* CAR IMAGE */}

                          {booking.car?.image ? (

                            <img
                              src={booking.car.image}
                              alt={
                                booking.car?.brand +
                                " " +
                                booking.car?.model
                              }
                              className="w-24 h-16 object-cover rounded-lg border"
                            />

                          ) : (

                            <div className="w-24 h-16 rounded-lg bg-slate-200 flex items-center justify-center">

                              <span className="text-xs text-slate-500">
                                No Image
                              </span>

                            </div>

                          )}

                          {/* CAR DETAILS */}

                          <div>

                            <p className="font-semibold text-slate-900">

                              {booking.car?.brand ||
                                "Unknown"}{" "}

                              {booking.car?.model ||
                                ""}

                            </p>

                            <p className="text-sm text-slate-500 mt-1">

                              {booking.car?.year ||
                                "N/A"}

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* START DATE */}

                      <td className="px-5 py-5 text-slate-700">

                        {booking.startDate
                          ? new Date(
                              booking.startDate
                            ).toLocaleDateString()
                          : "N/A"}

                      </td>

                      {/* END DATE */}

                      <td className="px-5 py-5 text-slate-700">

                        {booking.endDate
                          ? new Date(
                              booking.endDate
                            ).toLocaleDateString()
                          : "N/A"}

                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-5">

                        <span className="font-bold text-slate-900">
                          ₹
                          {booking.totalPrice ||
                            0}
                        </span>

                      </td>

                      {/* CURRENT STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status ===
                            "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status ===
                                "cancelled"
                              ? "bg-red-100 text-red-700"
                              : booking.status ===
                                "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >

                          {booking.status ||
                            "pending"}

                        </span>

                      </td>

                      {/* CHANGE STATUS */}

                      <td className="px-5 py-5">

                        <select
                          value={
                            booking.status ||
                            "pending"
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              booking._id,
                              e.target.value
                            )
                          }
                          className="border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                        </select>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminBookings;