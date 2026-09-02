import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Home,
  ReceiptText,
} from "lucide-react";

function BookingSuccess() {
  const location = useLocation();

  const booking = location.state?.booking;
  const car = location.state?.car;

  const bookingId = booking?._id || booking?.id || "Confirmed";

  const carName =
    car?.name ||
    [car?.brand, car?.model].filter(Boolean).join(" ") ||
    "Your selected car";

  const startDate = booking?.startDate || booking?.pickupDate;
  const endDate = booking?.endDate || booking?.returnDate;

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <section className="py-8 text-center sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success">
            <CheckCircle2
              className="h-10 w-10 text-foreground"
              aria-hidden="true"
            />
          </div>

          <p className="mt-7 font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Booking Confirmed
          </p>

          <h1 className="mt-3 font-metal text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            Your car is booked!
          </h1>

          <p className="mx-auto mt-5 max-w-2xl font-garamond text-base leading-7 text-muted-foreground sm:text-lg">
            Your DriveNow booking has been successfully created. Keep your
            booking details handy for your upcoming trip.
          </p>
        </section>

        {/* Booking Card */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* Booking Reference */}
          <div className="border-b border-border bg-secondary px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-garamond text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Booking Reference
                </p>

                <p
                  className="mt-2 break-all font-garamond text-xl font-bold text-foreground sm:text-2xl"
                  title={String(bookingId)}
                >
                  {bookingId}
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-success px-4 py-2 font-garamond text-sm font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Confirmed
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-5 sm:p-8">
            {/* Vehicle */}
            <div>
              <p className="font-garamond text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Vehicle
              </p>

              <h2 className="mt-2 font-metal text-3xl leading-tight text-foreground sm:text-4xl">
                {carName}
              </h2>

              {car?.category && (
                <p className="mt-2 font-garamond text-base text-muted-foreground">
                  {car.category}
                </p>
              )}
            </div>

            <div className="my-8 border-t border-border" />

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={<CalendarDays />}
                label="Pickup Date"
                value={formatDate(startDate)}
              />

              <InfoItem
                icon={<CalendarDays />}
                label="Return Date"
                value={formatDate(endDate)}
              />
            </div>

            {/* Locations */}
            {(booking?.pickupLocation || booking?.dropoffLocation) && (
              <>
                <div className="my-8 border-t border-border" />

                <div className="grid gap-5 sm:grid-cols-2">
                  {booking?.pickupLocation && (
                    <div>
                      <p className="font-garamond text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Pickup Location
                      </p>

                      <p className="mt-2 font-garamond text-base font-semibold text-foreground">
                        {booking.pickupLocation}
                      </p>
                    </div>
                  )}

                  {booking?.dropoffLocation && (
                    <div>
                      <p className="font-garamond text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Return Location
                      </p>

                      <p className="mt-2 font-garamond text-base font-semibold text-foreground">
                        {booking.dropoffLocation}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Helpful Message */}
        <section className="mt-5 rounded-2xl border border-border bg-success p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70">
              <ReceiptText
                className="h-5 w-5 text-foreground"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-garamond text-base font-bold text-foreground">
                Keep your booking reference
              </h2>

              <p className="mt-1 font-garamond text-sm leading-6 text-foreground">
                You can view your booking and its latest status from your
                bookings page.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/my-bookings"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-garamond text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            View My Bookings
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-muted p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
          <span className="[&>svg]:h-5 [&>svg]:w-5" aria-hidden="true">
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-garamond text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

          <p
            className="mt-1 truncate font-garamond text-base font-bold text-foreground"
            title={String(value)}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
