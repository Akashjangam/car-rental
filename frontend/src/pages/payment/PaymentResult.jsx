import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Car,
  CreditCard,
  Home,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

function PaymentResult() {
  const location = useLocation();

  const state = location.state || {};

  const success = state.success === true;
  const booking = state.booking || null;
  const payment = state.payment || null;

  const bookingId = state.bookingId || booking?._id || booking?.id || "N/A";

  const paymentId = state.paymentId || payment?._id || payment?.id || "N/A";

  const amount = Number(
    booking?.totalAmount ??
      booking?.totalPrice ??
      booking?.amount ??
      payment?.amount ??
      0,
  );

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

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

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const car = booking?.car || booking?.vehicle || booking?.carDetails || null;

  const startDate =
    booking?.startDate || booking?.pickupDate || booking?.fromDate || "";

  const endDate =
    booking?.endDate || booking?.returnDate || booking?.toDate || "";

  if (!success) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center justify-center px-5 py-12 sm:px-8 lg:px-10">
          <section
            className="w-full max-w-xl border-y border-border bg-background px-6 py-12 text-center sm:px-10"
            aria-labelledby="payment-failed-title"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-10 w-10" aria-hidden="true" />
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-primary" />

              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                DriveNow Payment
              </p>

              <span className="h-px w-8 bg-primary" />
            </div>

            <h1
              id="payment-failed-title"
              className="mt-5 font-metal text-5xl leading-none text-foreground sm:text-6xl"
            >
              Payment
              <br />
              <span className="text-destructive">Failed.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md font-garamond text-xl leading-relaxed text-muted-foreground">
              We couldn't complete your payment. Please try again or check your
              booking details.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/my-bookings"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background px-5 font-garamond text-lg font-semibold text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                My Bookings
              </Link>

              <Link
                to="/cars"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                Browse Cars
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <section
          className="text-center"
          aria-labelledby="payment-success-title"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-foreground">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary" />

            <p className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow Payment
            </p>

            <span className="h-px w-8 bg-primary" />
          </div>

          <h1
            id="payment-success-title"
            className="mt-5 font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Payment
            <br />
            <span className="text-primary">Successful.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl font-garamond text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            Your payment has been successfully processed and your booking has
            been confirmed.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-4xl border-y border-border bg-background">
          <div className="border-b border-border px-6 py-8 text-center sm:px-10">
            <p className="font-garamond text-base text-muted-foreground">
              Amount Paid
            </p>

            <p className="mt-2 font-metal text-5xl text-foreground sm:text-6xl">
              {formatPrice(amount)}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-success px-4 py-2 font-garamond text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Payment Completed
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
                <Car className="h-5 w-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-metal text-2xl text-foreground">
                  Booking Details
                </h2>

                <p className="font-garamond text-sm text-muted-foreground">
                  Your DriveNow reservation
                </p>
              </div>
            </div>

            {car && (
              <div className="border-b border-border py-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="h-40 w-full overflow-hidden bg-muted sm:h-32 sm:w-48 sm:shrink-0">
                    {car.image ? (
                      <img
                        src={getImageUrl(car.image)}
                        alt={`${car.brand || ""} ${car.model || ""}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Car className="h-10 w-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-garamond text-base text-muted-foreground">
                      {car.brand || "DriveNow"}
                    </p>

                    <h3 className="mt-1 font-metal text-3xl text-foreground">
                      {car.model || "Rental Car"}
                    </h3>

                    {car.year && (
                      <p className="mt-1 font-garamond text-base text-muted-foreground">
                        {car.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid border-b border-border sm:grid-cols-2">
              <DetailItem label="Booking ID" value={String(bookingId)} />

              <DetailItem label="Payment ID" value={String(paymentId)} />

              <DetailItem
                label="Pickup Date"
                value={formatDate(startDate)}
                icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
              />

              <DetailItem
                label="Return Date"
                value={formatDate(endDate)}
                icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
              />
            </div>

            <div className="mt-7 flex items-start gap-3 border border-secondary bg-secondary/20 p-4">
              <CreditCard
                className="mt-0.5 h-[19px] w-[19px] shrink-0 text-foreground"
                aria-hidden="true"
              />

              <div>
                <p className="font-garamond text-base font-semibold text-foreground">
                  Booking Confirmed
                </p>

                <p className="mt-1 font-garamond text-sm leading-5 text-muted-foreground">
                  Your booking is now available in your My Bookings section.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-7 grid max-w-4xl gap-3 sm:grid-cols-2">
          <Link
            to="/my-bookings"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-lg font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            View My Bookings
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>

          <Link
            to="/"
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 font-garamond text-lg font-semibold text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <Home className="h-[18px] w-[18px]" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 sm:p-6">
      <p className="font-garamond text-sm text-muted-foreground">{label}</p>

      <div className="mt-2 flex items-center gap-2">
        {icon && <span className="shrink-0 text-primary">{icon}</span>}

        <p className="break-all font-garamond text-lg font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default PaymentResult;
