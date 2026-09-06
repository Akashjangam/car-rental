import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CreditCard,
  User,
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import { getBookingById } from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";

function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!token || !bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getBookingById(bookingId, token);

        const bookingData =
          response?.booking ||
          response?.data?.booking ||
          response?.data ||
          response;

        setBooking(bookingData);
      } catch (err) {
        console.error("Failed to load booking:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load booking",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, token]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCarName = () => {
    if (!booking?.car) {
      return "Car";
    }

    if (booking.car.name) {
      return booking.car.name;
    }

    return (
      `${booking.car.brand || ""} ${booking.car.model || ""}`.trim() ||
      "Car"
    );
  };

  const getCarImage = () => {
    return booking?.car?.image || booking?.car?.imageUrl || "";
  };

  const getAmount = () => {
    const amount = Number(booking?.totalAmount || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusClass = () => {
    const status = String(
      booking?.status || "pending",
    ).toLowerCase();

    if (status === "confirmed") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }

    if (status === "completed") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }

    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getPaymentClass = () => {
    const paymentStatus = String(
      booking?.paymentStatus || "unpaid",
    ).toLowerCase();

    if (
      paymentStatus === "paid" ||
      paymentStatus === "success" ||
      paymentStatus === "successful" ||
      paymentStatus === "completed"
    ) {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="font-garamond text-base text-muted-foreground">
              Loading booking details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CarFront className="mb-4 h-12 w-12 text-muted-foreground" />

              <h2 className="font-metal text-3xl text-foreground">
                Booking not found
              </h2>

              <p className="mt-2 font-garamond text-base text-muted-foreground">
                {error || "Unable to find this booking."}
              </p>

              <Button
                className="mt-6"
                onClick={() => navigate("/my-bookings")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const bookingStatus = String(
    booking.status || "pending",
  );

  const paymentStatus = String(
    booking.paymentStatus || "unpaid",
  );

  const isUnpaid =
    paymentStatus.toLowerCase() === "unpaid";

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
            className="inline-flex items-center gap-2 font-garamond text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Bookings
          </button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            DriveNow
          </p>

          <h1 className="mt-2 font-metal text-5xl leading-tight text-foreground">
            Booking Details
          </h1>

          <p className="mt-3 font-garamond text-lg text-muted-foreground">
            View your complete booking information.
          </p>
        </div>

        {/* Car */}
        <Card className="mb-6 overflow-hidden border-border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-8 sm:flex-row">

              {/* Image */}
              <div className="shrink-0">
                {getCarImage() ? (
                  <img
                    src={getCarImage()}
                    alt={getCarName()}
                    className="h-56 w-full rounded-2xl object-cover sm:h-44 sm:w-72"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-muted sm:h-44 sm:w-72">
                    <CarFront className="h-14 w-14 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Car Details */}
              <div className="flex flex-1 flex-col justify-center">
                <p className="font-garamond text-sm uppercase tracking-[0.16em] text-primary">
                  Car
                </p>

                <h2 className="mt-2 font-metal text-4xl text-foreground">
                  {getCarName()}
                </h2>

                <p className="mt-2 font-garamond text-base text-muted-foreground">
                  {booking.car?.year || "—"} •{" "}
                  {booking.car?.fuelType || "—"} •{" "}
                  {booking.car?.transmission || "—"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 font-garamond text-xs font-bold ${getStatusClass()}`}
                  >
                    {bookingStatus}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 font-garamond text-xs font-bold ${getPaymentClass()}`}
                  >
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card className="mb-6 border-border bg-card shadow-sm">
          <CardContent className="p-6 sm:p-8">

            <h2 className="flex items-center gap-2 font-metal text-2xl text-foreground">
              <CalendarDays className="h-5 w-5 text-primary" />
              Booking Information
            </h2>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">

              {/* Booking ID */}
              <div className="border-b border-border pb-5">
                <p className="font-garamond text-sm text-muted-foreground">
                  Booking ID
                </p>

                <p className="mt-2 break-all font-garamond text-base font-bold text-foreground">
                  {booking._id || booking.id || "—"}
                </p>
              </div>

              {/* Amount */}
              <div className="border-b border-border pb-5">
                <p className="font-garamond text-sm text-muted-foreground">
                  Total Amount
                </p>

                <p className="mt-2 font-metal text-2xl text-foreground">
                  {getAmount()}
                </p>
              </div>

              {/* Pickup */}
              <div className="border-b border-border pb-5">
                <p className="font-garamond text-sm text-muted-foreground">
                  Pickup Date & Time
                </p>

                <p className="mt-2 font-garamond text-base font-bold text-foreground">
                  {formatDate(
                    booking.startDate ||
                      booking.pickupDate,
                  )}
                </p>
              </div>

              {/* Return */}
              <div className="border-b border-border pb-5">
                <p className="font-garamond text-sm text-muted-foreground">
                  Return Date & Time
                </p>

                <p className="mt-2 font-garamond text-base font-bold text-foreground">
                  {formatDate(
                    booking.endDate ||
                      booking.returnDate,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        {booking.user && (
          <Card className="mb-6 border-border bg-card shadow-sm">
            <CardContent className="p-6 sm:p-8">

              <h2 className="flex items-center gap-2 font-metal text-2xl text-foreground">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </h2>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">

                <div className="border-b border-border pb-5">
                  <p className="font-garamond text-sm text-muted-foreground">
                    Name
                  </p>

                  <p className="mt-2 font-garamond text-base font-bold text-foreground">
                    {booking.user?.name || "—"}
                  </p>
                </div>

                <div className="border-b border-border pb-5">
                  <p className="font-garamond text-sm text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-2 break-all font-garamond text-base font-bold text-foreground">
                    {booking.user?.email || "—"}
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-10 sm:flex-row">

          {isUnpaid &&
            bookingStatus.toLowerCase() !== "cancelled" &&
            bookingStatus.toLowerCase() !== "completed" && (
              <Link
                to={`/payment/${
                  booking._id || booking.id
                }`}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-garamond text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Link>
            )}

          <Link
            to="/my-bookings"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <ArrowLeft className="h-4 w-4" />
            My Bookings
          </Link>
        </div>
      </div>
    </main>
  );
}

export default BookingDetails;