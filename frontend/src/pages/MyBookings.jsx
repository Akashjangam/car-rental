import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your bookings.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/bookings/my-bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Bookings response:", response.data);

      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/bookings/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking cancelled successfully");

      fetchBookings();
    } catch (err) {
      console.error("Cancel booking error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to cancel booking"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">
          Loading bookings...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load bookings
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchBookings}
            className="mt-5 rounded-lg bg-[#30AFFF] px-5 py-3 font-semibold text-white hover:bg-[#2499df]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold text-slate-900">
          My Bookings
        </h1>

        <p className="mt-2 text-slate-500">
          View and manage your car bookings.
        </p>

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No bookings found
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't booked a car yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >

                <h2 className="text-xl font-bold text-slate-900">
                  {booking.car?.brand} {booking.car?.model}
                </h2>

                <div className="mt-4 space-y-2 text-sm">

                  <p>
                    <span className="font-semibold">
                      Pickup:
                    </span>{" "}
                    {booking.startDate
                      ? new Date(
                          booking.startDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Return:
                    </span>{" "}
                    {booking.endDate
                      ? new Date(
                          booking.endDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Total:
                    </span>{" "}
                    ₹{booking.totalPrice || 0}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Status:
                    </span>{" "}
                    {booking.status || "Pending"}
                  </p>

                </div>

                {booking.status !== "cancelled" &&
                  booking.status !== "completed" && (
                    <button
                      onClick={() =>
                        cancelBooking(booking._id)
                      }
                      className="mt-5 w-full rounded-lg bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600"
                    >
                      Cancel Booking
                    </button>
                  )}

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyBookings;