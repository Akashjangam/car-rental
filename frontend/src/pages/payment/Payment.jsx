import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Car,
  CalendarDays,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { getBookingById } from "../../services/bookingApi";
import { createPayment } from "../../services/paymentApi";
import { useAuth } from "../../context/AuthContext";

const API_ORIGIN =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId || !token) {
        setError("Booking information is missing.");
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

        if (!bookingData) {
          throw new Error("Booking not found.");
        }

        setBooking(bookingData);
      } catch (err) {
        console.error("Load booking error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load booking.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, token]);

  const car = useMemo(() => {
    if (!booking) return null;

    return booking.car || booking.vehicle || booking.carDetails || null;
  }, [booking]);

  const getStartDate = () =>
    booking?.startDate ||
    booking?.pickupDate ||
    booking?.fromDate ||
    booking?.bookingStartDate ||
    "";

  const getEndDate = () =>
    booking?.endDate ||
    booking?.returnDate ||
    booking?.toDate ||
    booking?.bookingEndDate ||
    "";

  const totalAmount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      booking?.price ??
      0,
  );

  const rentalDays = useMemo(() => {
    const start = getStartDate();
    const end = getEndDate();

    if (!start || !end) return 0;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)),
    );
  }, [booking]);

  const isPaid = booking?.paymentStatus === "paid";

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const handlePayment = async () => {
    if (!bookingId || !token) {
      setError("Unable to process payment.");
      return;
    }

    if (isPaid) {
      setError("This booking has already been paid.");
      return;
    }

    if (totalAmount <= 0) {
      setError("Invalid booking amount.");
      return;
    }

    try {
      setPaymentLoading(true);
      setError("");
      setSuccess("");

      const response = await createPayment(bookingId, token);

      const payment =
        response?.payment ||
        response?.data?.payment ||
        response?.data ||
        response;

      const paymentId =
        payment?._id ||
        payment?.id ||
        response?.paymentId ||
        response?.data?.paymentId ||
        "";

      const updatedBooking = {
        ...booking,
        paymentStatus: "paid",
        status: "confirmed",
      };

      setBooking(updatedBooking);
      setSuccess("Payment processed successfully.");

      setTimeout(() => {
        navigate("/payment-result", {
          state: {
            success: true,
            booking: updatedBooking,
            payment,
            paymentId,
            bookingId,
          },
        });
      }, 700);
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2
            className="mx-auto h-9 w-9 animate-spin text-primary"
            aria-hidden="true"
          />

          <p className="mt-4 font-garamond text-base text-muted-foreground">
            Loading payment details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="w-full max-w-md border border-border bg-card p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="mt-5 font-metal text-3xl text-foreground">
            Payment unavailable
          </h1>

          <p className="mt-3 font-garamond text-lg text-muted-foreground">
            {error}
          </p>

          <Link
            to="/my-bookings"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            My Bookings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
        <div className="mb-10">
          <Link
            to="/my-bookings"
            className="mb-8 inline-flex items-center gap-2 font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            Back to My Bookings
          </Link>

          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-primary" />

            <p className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Secure Checkout
            </p>
          </div>

          <h1 className="mt-5 font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Complete
            <br />
            Your <span className="text-primary">Payment.</span>
          </h1>

          <p className="mt-5 max-w-xl font-garamond text-xl leading-relaxed text-muted-foreground">
            Review your booking details and securely complete your DriveNow
            rental payment.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 border border-destructive/30 bg-destructive/10 p-4 font-garamond text-base text-destructive"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 border border-success bg-success p-4 font-garamond text-base text-foreground"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />

            <span>{success}</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
          <section className="border-y border-border bg-background">
            <div className="flex items-center gap-4 border-b border-border py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
                <Car className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-metal text-2xl text-foreground">
                  Booking Details
                </h2>

                <p className="font-garamond text-sm text-muted-foreground">
                  Booking ID: {bookingId}
                </p>
              </div>
            </div>

            <div className="border-b border-border py-7">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="h-48 w-full overflow-hidden bg-muted sm:h-36 sm:w-56 sm:shrink-0">
                  {car?.image ? (
                    <img
                      src={getImageUrl(car.image)}
                      alt={`${car?.brand || ""} ${car?.model || ""}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Car className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <p className="font-garamond text-base text-muted-foreground">
                    {car?.brand || "DriveNow"}
                  </p>

                  <h3 className="mt-1 font-metal text-3xl text-foreground">
                    {car?.model || "Rental Car"}
                  </h3>

                  {car?.year && (
                    <p className="mt-1 font-garamond text-base text-muted-foreground">
                      {car.year}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid border-b border-border sm:grid-cols-2">
              <DateCard title="Pickup Date" date={formatDate(getStartDate())} />

              <DateCard title="Return Date" date={formatDate(getEndDate())} />
            </div>

            <div className="flex items-center gap-4 py-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-primary">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <p className="font-garamond text-base font-semibold text-foreground">
                  Rental Duration
                </p>

                <p className="font-garamond text-base text-muted-foreground">
                  {rentalDays > 0
                    ? `${rentalDays} ${rentalDays === 1 ? "day" : "days"}`
                    : "Duration unavailable"}
                </p>
              </div>
            </div>
          </section>

          <section className="border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-foreground">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-metal text-2xl text-foreground">
                  Payment Summary
                </h2>

                <p className="font-garamond text-sm text-muted-foreground">
                  Secure DriveNow checkout
                </p>
              </div>
            </div>

            {isPaid && (
              <div className="mt-6 flex items-start gap-3 border border-success bg-success p-4">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-foreground"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-garamond text-base font-semibold text-foreground">
                    Payment Completed
                  </p>

                  <p className="mt-1 font-garamond text-sm text-muted-foreground">
                    This booking has already been paid.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 py-6">
              <div className="flex items-center justify-between font-garamond text-base">
                <span className="text-muted-foreground">Rental days</span>

                <span className="font-semibold text-foreground">
                  {rentalDays}
                </span>
              </div>

              <div className="flex items-center justify-between font-garamond text-base">
                <span className="text-muted-foreground">Price per day</span>

                <span className="font-semibold text-foreground">
                  {formatPrice(rentalDays > 0 ? totalAmount / rentalDays : 0)}
                </span>
              </div>
            </div>

            <div className="border-t border-border py-6">
              <div className="flex items-end justify-between gap-4">
                <span className="font-garamond text-lg font-semibold text-foreground">
                  Total Amount
                </span>

                <span className="font-metal text-3xl text-foreground">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 border border-secondary bg-secondary/20 p-4">
              <Lock
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-foreground"
                aria-hidden="true"
              />

              <div>
                <p className="font-garamond text-base font-semibold text-foreground">
                  Secure Payment
                </p>

                <p className="mt-1 font-garamond text-sm leading-5 text-muted-foreground">
                  Your payment is securely processed through DriveNow.
                </p>
              </div>
            </div>

            {isPaid ? (
              <Link
                to="/my-bookings"
                className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-border bg-muted px-5 font-garamond text-lg font-semibold text-foreground transition hover:bg-background focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                View My Bookings
              </Link>
            ) : (
              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentLoading || totalAmount <= 0}
                className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-lg font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                    Pay {formatPrice(totalAmount)}
                  </>
                )}
              </button>
            )}

            <p className="mt-4 text-center font-garamond text-sm text-muted-foreground">
              By continuing, you agree to the DriveNow rental terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function DateCard({ title, date }) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="font-garamond text-sm text-muted-foreground">{title}</p>

      <div className="mt-2 flex items-center gap-2">
        <CalendarDays
          className="h-[17px] w-[17px] shrink-0 text-primary"
          aria-hidden="true"
        />

        <p className="font-garamond text-lg font-semibold text-foreground">
          {date}
        </p>
      </div>
    </div>
  );
}

export default Payment;
