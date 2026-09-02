import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Car,
  IndianRupee,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

import {
  getAdminBookings,
  updateAdminBookingStatus,
} from "../../services/adminApi";

import { useAuth } from "../../context/AuthContext";

function AdminBookings() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadBookings = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAdminBookings(token);

      const bookingData =
        response?.bookings || response?.data?.bookings || response?.data || [];

      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (err) {
      console.error("Load admin bookings error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadBookings();
    }
  }, [token]);

  const handleStatusChange = async (booking, newStatus) => {
    const bookingId = booking?._id || booking?.id;

    if (!bookingId) {
      setError("Booking ID not found.");
      return;
    }

    const oldStatus = booking.status;

    try {
      setError("");

      setBookings((previous) =>
        previous.map((item) =>
          String(item?._id || item?.id) === String(bookingId)
            ? {
                ...item,
                status: newStatus,
              }
            : item,
        ),
      );

      await updateAdminBookingStatus(bookingId, newStatus, token);
    } catch (err) {
      console.error("Update booking status error:", err);

      setBookings((previous) =>
        previous.map((item) =>
          String(item?._id || item?.id) === String(bookingId)
            ? {
                ...item,
                status: oldStatus,
              }
            : item,
        ),
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update booking status.",
      );
    }
  };

  const getCar = (booking) =>
    booking?.car || booking?.vehicle || booking?.carDetails || null;

  const getCustomer = (booking) =>
    booking?.user || booking?.customer || booking?.customerDetails || null;

  const getStartDate = (booking) =>
    booking?.startDate || booking?.pickupDate || booking?.fromDate || "";

  const getEndDate = (booking) =>
    booking?.endDate || booking?.returnDate || booking?.toDate || "";

  const getAmount = (booking) =>
    Number(
      booking?.totalAmount ??
        booking?.totalPrice ??
        booking?.amount ??
        booking?.price ??
        0,
    );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusConfig = (status) => {
    switch (String(status || "pending").toLowerCase()) {
      case "confirmed":
        return {
          label: "Confirmed",
          className: "border-success bg-success text-foreground",
          icon: CheckCircle2,
        };

      case "completed":
        return {
          label: "Completed",
          className: "border-primary/20 bg-primary/10 text-primary",
          icon: CheckCircle2,
        };

      case "cancelled":
      case "canceled":
        return {
          label: "Cancelled",
          className: "border-destructive/20 bg-destructive/10 text-destructive",
          icon: XCircle,
        };

      default:
        return {
          label: "Pending",
          className: "border-border bg-muted text-muted-foreground",
          icon: Clock3,
        };
    }
  };

  const normalizedStatus = (booking) =>
    String(booking?.status || "pending").toLowerCase();

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => normalizedStatus(booking) === filter);

  const pendingCount = bookings.filter(
    (booking) => normalizedStatus(booking) === "pending",
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => normalizedStatus(booking) === "confirmed",
  ).length;

  const completedCount = bookings.filter(
    (booking) => normalizedStatus(booking) === "completed",
  ).length;

  const cancelledCount = bookings.filter((booking) =>
    ["cancelled", "canceled"].includes(normalizedStatus(booking)),
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2
            className="mx-auto h-9 w-9 animate-spin text-primary"
            aria-hidden="true"
          />

          <p className="mt-4 font-garamond text-base text-muted-foreground">
            Loading bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                to="/admin"
                className="mb-4 inline-flex items-center gap-2 font-garamond text-sm font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Admin Dashboard
              </Link>

              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                DriveNow Admin
              </p>

              <h1 className="mt-2 font-metal text-4xl leading-tight text-foreground sm:text-5xl">
                Manage Bookings
              </h1>

              <p className="mt-3 max-w-xl font-garamond text-base leading-7 text-muted-foreground sm:text-lg">
                Review customer reservations and manage their booking status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadBookings(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-5 font-garamond text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-7 border-t border-border" />
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-7 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-5"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />

            <div className="font-garamond">
              <p className="font-bold text-destructive">Something went wrong</p>

              <p className="mt-1 text-sm leading-6 text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total" value={bookings.length} icon={CalendarDays} />

          <StatCard label="Pending" value={pendingCount} icon={Clock3} />

          <StatCard
            label="Confirmed"
            value={confirmedCount}
            icon={CheckCircle2}
          />

          <StatCard
            label="Completed"
            value={completedCount}
            icon={CheckCircle2}
          />

          <StatCard label="Cancelled" value={cancelledCount} icon={XCircle} />
        </div>

        {/* Filter */}
        <section className="mb-7 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-garamond text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Reservations
              </p>

              <h2 className="mt-1 font-metal text-2xl text-foreground">
                All Bookings
              </h2>

              <p className="mt-1 font-garamond text-sm text-muted-foreground">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""} displayed
              </p>
            </div>

            <div className="relative sm:w-52">
              <label htmlFor="booking-filter" className="sr-only">
                Filter bookings
              </label>

              <select
                id="booking-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="min-h-11 w-full appearance-none rounded-xl border border-border bg-background px-4 pr-10 font-garamond text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {/* Empty */}
        {filteredBookings.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-8 w-8" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-metal text-3xl text-foreground">
              {bookings.length === 0
                ? "No bookings found"
                : "No matching bookings"}
            </h2>

            <p className="mx-auto mt-3 max-w-md font-garamond text-base leading-7 text-muted-foreground">
              {bookings.length === 0
                ? "Customer bookings will appear here once reservations are created."
                : "Try selecting a different booking status."}
            </p>
          </section>
        ) : (
          <>
            {/* Desktop */}
            <section className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
              <div className="border-b border-border bg-muted/50 px-6 py-5">
                <p className="font-garamond text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Customer Reservations
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <caption className="sr-only">
                    Customer rental bookings
                  </caption>

                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Customer
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Vehicle
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Rental Period
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Amount
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Status
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-right font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Reference
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => {
                      const bookingId = booking?._id || booking?.id;

                      const customer = getCustomer(booking);
                      const car = getCar(booking);
                      const status = getStatusConfig(booking?.status);

                      return (
                        <tr
                          key={bookingId}
                          className="border-b border-border/60 last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-6 py-5">
                            <p className="font-garamond text-base font-bold text-foreground">
                              {customer?.name || "Unknown Customer"}
                            </p>

                            <p className="mt-1 break-all font-garamond text-sm text-muted-foreground">
                              {customer?.email || "No email"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-garamond text-base font-bold text-foreground">
                              {car?.brand || "Unknown"}
                            </p>

                            <p className="mt-1 font-garamond text-sm text-muted-foreground">
                              {car?.model || "Car"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-garamond text-sm font-semibold text-foreground">
                              {formatDate(getStartDate(booking))}
                            </p>

                            <p className="mt-1 font-garamond text-xs text-muted-foreground">
                              to {formatDate(getEndDate(booking))}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-garamond text-base font-bold text-foreground">
                              {formatPrice(getAmount(booking))}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <select
                              aria-label={`Change status for booking ${String(
                                bookingId,
                              ).slice(-8)}`}
                              value={booking?.status || "pending"}
                              onChange={(event) =>
                                handleStatusChange(booking, event.target.value)
                              }
                              className={`rounded-xl border px-3 py-2 font-garamond text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 ${status.className}`}
                            >
                              <option value="pending">Pending</option>

                              <option value="confirmed">Confirmed</option>

                              <option value="completed">Completed</option>

                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <span
                              className="font-mono text-xs text-muted-foreground"
                              title={bookingId}
                            >
                              {String(bookingId).slice(-8)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile / Tablet */}
            <section
              aria-label="Customer bookings"
              className="space-y-4 lg:hidden"
            >
              {filteredBookings.map((booking) => {
                const bookingId = booking?._id || booking?.id;

                const customer = getCustomer(booking);
                const car = getCar(booking);

                const status = getStatusConfig(booking?.status);

                const StatusIcon = status.icon;

                return (
                  <article
                    key={bookingId}
                    className="rounded-3xl border border-border bg-card p-5 shadow-sm"
                  >
                    {/* Customer */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-garamond text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Customer
                        </p>

                        <h2 className="mt-1 truncate font-metal text-2xl text-foreground">
                          {customer?.name || "Unknown Customer"}
                        </h2>

                        <p className="mt-1 break-all font-garamond text-sm text-muted-foreground">
                          {customer?.email || "No email"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-garamond text-xs font-bold ${status.className}`}
                      >
                        <StatusIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />

                        {status.label}
                      </span>
                    </div>

                    {/* Vehicle */}
                    <div className="mt-5 rounded-2xl border border-border bg-muted p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                          <Car className="h-5 w-5" aria-hidden="true" />
                        </div>

                        <div>
                          <p className="font-garamond text-xs uppercase tracking-wide text-muted-foreground">
                            Vehicle
                          </p>

                          <p className="mt-1 font-garamond text-base font-bold text-foreground">
                            {car?.brand || "Unknown"} {car?.model || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rental Dates */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Pickup"
                        value={formatDate(getStartDate(booking))}
                      />

                      <InfoBox
                        label="Return"
                        value={formatDate(getEndDate(booking))}
                      />
                    </div>

                    {/* Amount */}
                    <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
                      <div className="flex items-center gap-2">
                        <IndianRupee
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />

                        <span className="font-garamond text-sm text-muted-foreground">
                          Total Amount
                        </span>
                      </div>

                      <span className="font-garamond text-lg font-bold text-foreground">
                        {formatPrice(getAmount(booking))}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="mt-4">
                      <label
                        htmlFor={`status-${bookingId}`}
                        className="mb-2 block font-garamond text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Booking Status
                      </label>

                      <div className="relative">
                        <select
                          id={`status-${bookingId}`}
                          value={booking?.status || "pending"}
                          onChange={(event) =>
                            handleStatusChange(booking, event.target.value)
                          }
                          className={`min-h-11 w-full appearance-none rounded-xl border px-4 pr-10 font-garamond text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 ${status.className}`}
                        >
                          <option value="pending">Pending</option>

                          <option value="confirmed">Confirmed</option>

                          <option value="completed">Completed</option>

                          <option value="cancelled">Cancelled</option>
                        </select>

                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-current"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Reference */}
                    <p className="mt-4 font-mono text-xs text-muted-foreground">
                      Booking ID: {String(bookingId)}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-garamond text-sm font-semibold text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 font-metal text-2xl text-foreground sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
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

export default AdminBookings;
