import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CreditCard,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
  Eye,
} from "lucide-react";

import {
  getMyBookings,
  cancelBooking,
} from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";

function MyBookings() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async (isRefresh = false) => {
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getMyBookings(token);

      const bookingData =
        response?.bookings ||
        response?.data?.bookings ||
        response?.data ||
        response;

      setBookings(
        Array.isArray(bookingData) ? bookingData : [],
      );
    } catch (err) {
      console.error("Load bookings error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load your bookings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [token]);

  const getBookingId = (booking) => {
    return booking?._id || booking?.id || "";
  };

  const getCar = (booking) =>
    booking?.car ||
    booking?.vehicle ||
    booking?.carDetails ||
    null;

  const getStartDate = (booking) =>
    booking?.startDate ||
    booking?.pickupDate ||
    booking?.pickupDateTime ||
    booking?.fromDate ||
    booking?.bookingStartDate ||
    "";

  const getEndDate = (booking) =>
    booking?.endDate ||
    booking?.returnDate ||
    booking?.returnDateTime ||
    booking?.toDate ||
    booking?.bookingEndDate ||
    "";

  const getAmount = (booking) =>
    Number(
      booking?.totalAmount ??
        booking?.totalPrice ??
        booking?.amount ??
        booking?.price ??
        0,
    );

  const getPaymentStatus = (booking) =>
    booking?.paymentStatus ||
    booking?.payment_status ||
    booking?.payment?.status ||
    (booking?.paid ? "paid" : "unpaid");

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

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

  const getStatusConfig = (status) => {
    const normalized = String(
      status || "pending",
    ).toLowerCase();

    switch (normalized) {
      case "confirmed":
        return {
          label: "Confirmed",
          className:
            "border-success bg-success text-foreground",
          icon: CheckCircle2,
        };

      case "completed":
        return {
          label: "Completed",
          className:
            "border-primary/20 bg-primary/10 text-primary",
          icon: CheckCircle2,
        };

      case "cancelled":
      case "canceled":
        return {
          label: "Cancelled",
          className:
            "border-destructive/30 bg-destructive/10 text-destructive",
          icon: XCircle,
        };

      default:
        return {
          label: "Pending",
          className:
            "border-border bg-muted text-muted-foreground",
          icon: Clock3,
        };
    }
  };

  const getPaymentConfig = (status) => {
    const normalized = String(
      status || "unpaid",
    ).toLowerCase();

    if (
      normalized === "paid" ||
      normalized === "completed" ||
      normalized === "success" ||
      normalized === "successful"
    ) {
      return {
        label: "Paid",
        className:
          "border-success bg-success text-foreground",
      };
    }

    return {
      label: "Unpaid",
      className:
        "border-border bg-muted text-muted-foreground",
    };
  };

  const handleCancel = async (bookingId) => {
    if (!bookingId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");

      await cancelBooking(bookingId, token);

      setBookings((previousBookings) =>
        previousBookings.map((booking) => {
          const id = getBookingId(booking);

          if (id === bookingId) {
            return {
              ...booking,
              status: "cancelled",
            };
          }

          return booking;
        }),
      );
    } catch (err) {
      console.error("Cancel booking error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel booking",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div
          className="text-center"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="mx-auto h-9 w-9 animate-spin text-primary"
            aria-hidden="true"
          />

          <p className="mt-4 font-garamond text-base text-muted-foreground">
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays
                className="h-8 w-8"
                aria-hidden="true"
              />
            </div>

            <p className="mt-6 font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              DriveNow
            </p>

            <h2 className="mt-2 font-metal text-3xl text-foreground sm:text-4xl">
              Please login
            </h2>

            <p className="mx-auto mt-3 max-w-md font-garamond text-base leading-7 text-muted-foreground">
              Login to view your bookings.
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-garamond text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              Login

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <header className="mb-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                DriveNow
              </p>

              <h1 className="mt-2 font-metal text-4xl leading-tight text-foreground sm:text-5xl">
                My Bookings
              </h1>

              <p className="mt-3 max-w-xl font-garamond text-base leading-7 text-muted-foreground sm:text-lg">
                View your reservations, payment status, and upcoming rental
                details.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => loadBookings(true)}
                disabled={refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                to="/cars"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-garamond text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                Browse Cars

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          <div className="mt-7 border-t border-border" />
        </header>

        {/* Error */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-7 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />

            <div className="flex-1 font-garamond">
              <p className="font-bold text-destructive">
                Unable to load bookings
              </p>

              <p className="mt-1 text-sm leading-6 text-destructive">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadBookings()}
              className="shrink-0 rounded-md font-garamond text-sm font-bold text-destructive underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}

        {!error && bookings.length === 0 && (
          <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays
                className="h-8 w-8"
                aria-hidden="true"
              />
            </div>

            <p className="mt-6 font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Your rental journey
            </p>

            <h2 className="mt-2 font-metal text-3xl text-foreground sm:text-4xl">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md font-garamond text-base leading-7 text-muted-foreground">
              You haven't booked a car yet. Explore our available cars and
              make your first reservation.
            </p>

            <Link
              to="/cars"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-garamond text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              Browse Cars

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </section>
        )}

        {/* Desktop */}

        {bookings.length > 0 && (
          <section
            aria-label="Your bookings"
            className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block"
          >
            <div className="border-b border-border bg-muted px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-garamond text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Reservations
                  </p>

                  <h2 className="mt-1 font-metal text-2xl text-foreground">
                    Booking history
                  </h2>
                </div>

                <span className="rounded-full border border-border bg-background px-3 py-1.5 font-garamond text-sm font-semibold text-muted-foreground">
                  {bookings.length}{" "}
                  {bookings.length === 1
                    ? "booking"
                    : "bookings"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Car
                    </th>

                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Number Plate
                    </th>

                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Dates
                    </th>

                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-right font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const car = getCar(booking);

                    const bookingStatus =
                      getStatusConfig(
                        booking?.status,
                      );

                    const paymentStatus =
                      getPaymentConfig(
                        getPaymentStatus(booking),
                      );

                    const StatusIcon =
                      bookingStatus.icon;

                    const bookingId =
                      getBookingId(booking);

                    const amount =
                      getAmount(booking);

                    const isPaid =
                      paymentStatus.label === "Paid";

                    const isCancelled =
                      bookingStatus.label ===
                      "Cancelled";

                    const isCompleted =
                      bookingStatus.label ===
                      "Completed";

                    return (
                      <tr
                        key={bookingId}
                        className="border-b border-border last:border-b-0 hover:bg-muted/40"
                      >
                        {/* Car */}

                        <td className="px-6 py-5">
                          <p className="font-garamond text-base font-bold text-foreground">
                            {car?.brand ||
                              "DriveNow"}
                          </p>

                          <p className="mt-0.5 font-garamond text-sm text-muted-foreground">
                            {car?.model ||
                              "Rental Car"}
                          </p>
                        </td>

                        {/* Number Plate */}

                        <td className="px-6 py-5">
                          <p
                            className="font-garamond text-sm font-bold text-foreground"
                            title={
                              car?.numberPlate ||
                              "—"
                            }
                          >
                            {car?.numberPlate ||
                              "—"}
                          </p>
                        </td>

                        {/* Dates */}

                        <td className="px-6 py-5">
                          <p className="font-garamond text-sm font-semibold text-foreground">
                            {formatDate(
                              getStartDate(
                                booking,
                              ),
                            )}
                          </p>

                          <p className="mt-1 font-garamond text-xs text-muted-foreground">
                            to{" "}
                            {formatDate(
                              getEndDate(
                                booking,
                              ),
                            )}
                          </p>
                        </td>

                        {/* Amount */}

                        <td className="px-6 py-5">
                          <p className="font-garamond text-base font-bold text-foreground">
                            {formatPrice(amount)}
                          </p>
                        </td>

                        {/* Booking Status */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-garamond text-xs font-bold ${bookingStatus.className}`}
                          >
                            <StatusIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            {bookingStatus.label}
                          </span>
                        </td>

                        {/* Payment */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 font-garamond text-xs font-bold ${paymentStatus.className}`}
                          >
                            {paymentStatus.label}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {!isPaid &&
                            !isCancelled &&
                            !isCompleted ? (
                              <Link
                                to={`/payment/${bookingId}`}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 font-garamond text-xs font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                              >
                                Pay Now

                                <CreditCard
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </Link>
                            ) : isPaid &&
                              !isCancelled ? (
                              <Link
                                to={`/my-bookings/${bookingId}`}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 font-garamond text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                              >
                                View Details

                                <Eye
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </Link>
                            ) : (
                              <span className="font-garamond text-xs text-muted-foreground">
                                No action
                              </span>
                            )}

                            {!isCancelled &&
                              !isCompleted && (
                                <button
                                  type="button"
                                  disabled={
                                    cancellingId ===
                                    bookingId
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      bookingId,
                                    )
                                  }
                                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-background px-3 font-garamond text-xs font-bold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <XCircle
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />

                                  {cancellingId ===
                                  bookingId
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mobile / Tablet */}

        {bookings.length > 0 && (
          <section
            aria-label="Your bookings"
            className="space-y-4 lg:hidden"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-garamond text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Reservations
                </p>

                <h2 className="mt-1 font-metal text-2xl text-foreground">
                  Booking history
                </h2>
              </div>

              <span className="rounded-full border border-border bg-card px-3 py-1.5 font-garamond text-xs font-semibold text-muted-foreground">
                {bookings.length}
              </span>
            </div>

            {bookings.map((booking) => {
              const car = getCar(booking);

              const bookingStatus =
                getStatusConfig(
                  booking?.status,
                );

              const paymentStatus =
                getPaymentConfig(
                  getPaymentStatus(booking),
                );

              const StatusIcon =
                bookingStatus.icon;

              const bookingId =
                getBookingId(booking);

              const amount =
                getAmount(booking);

              const isPaid =
                paymentStatus.label === "Paid";

              const isCancelled =
                bookingStatus.label ===
                "Cancelled";

              const isCompleted =
                bookingStatus.label ===
                "Completed";

              return (
                <article
                  key={bookingId}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                >
                  {/* Card Header */}

                  <div className="border-b border-border p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-garamond text-sm text-muted-foreground">
                          {car?.brand ||
                            "DriveNow"}
                        </p>

                        <h3 className="mt-1 truncate font-metal text-2xl text-foreground">
                          {car?.model ||
                            "Rental Car"}
                        </h3>

                        {/* Number Plate */}

                        <p className="mt-2 font-garamond text-sm font-bold text-foreground">
                          Number Plate:{" "}
                          <span className="text-primary">
                            {car?.numberPlate ||
                              "—"}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-garamond text-xs font-bold ${bookingStatus.className}`}
                      >
                        <StatusIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />

                        {bookingStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}

                  <div className="space-y-5 p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Pickup"
                        value={formatDate(
                          getStartDate(
                            booking,
                          ),
                        )}
                      />

                      <InfoBox
                        label="Return"
                        value={formatDate(
                          getEndDate(
                            booking,
                          ),
                        )}
                      />
                    </div>

                    <div className="rounded-2xl border border-border bg-muted p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-garamond text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Total Amount
                          </p>

                          <p className="mt-1 font-metal text-2xl text-foreground">
                            {formatPrice(
                              amount,
                            )}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1.5 font-garamond text-xs font-bold ${paymentStatus.className}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {!isPaid &&
                      !isCancelled &&
                      !isCompleted ? (
                        <Link
                          to={`/payment/${bookingId}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-garamond text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
                        >
                          <CreditCard
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          Pay Now
                        </Link>
                      ) : isPaid &&
                        !isCancelled ? (
                        <Link
                          to={`/my-bookings/${bookingId}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-garamond text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
                        >
                          <Eye
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          View Details
                        </Link>
                      ) : null}

                      {!isCancelled &&
                        !isCompleted && (
                          <button
                            type="button"
                            disabled={
                              cancellingId ===
                              bookingId
                            }
                            onClick={() =>
                              handleCancel(
                                bookingId,
                              )
                            }
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-background px-4 font-garamond text-sm font-bold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle
                              className="h-4 w-4"
                              aria-hidden="true"
                            />

                            {cancellingId ===
                            bookingId
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                    </div>

                    <Link
                      to="/cars"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
                    >
                      Browse Cars

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="font-garamond text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <CalendarDays
          className="h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />

        <p
          className="truncate font-garamond text-sm font-bold text-foreground"
          title={String(value)}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default MyBookings;