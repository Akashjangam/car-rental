import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CarFront,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  Banknote,
  RotateCcw,
  Activity,
  User,
  Mail,
} from "lucide-react";

import {
  getDealerCars,
  deleteDealerCar,
  getDealerAnalytics,
  getDealerBookings,
  updateDealerBookingStatus,
} from "../../services/adminApi";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DealerCars = () => {
  const { token, loading: authLoading } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Dealer analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Dealer bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Booking status update
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // =====================================================
  // FETCH DEALER CARS
  // =====================================================

  const fetchCars = async () => {
    if (!token) {
      setCars([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getDealerCars(token);

      const carList =
        response?.cars || response?.data?.cars || response?.data || [];

      setCars(Array.isArray(carList) ? carList : []);
    } catch (err) {
      console.error("Failed to fetch dealer cars:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load your cars. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DEALER ANALYTICS
  // =====================================================

  const fetchAnalytics = async () => {
    if (!token) {
      setAnalytics(null);
      setAnalyticsLoading(false);
      return;
    }

    try {
      setAnalyticsLoading(true);

      const response = await getDealerAnalytics(token);

      const analyticsData =
        response?.analytics ||
        response?.data?.analytics ||
        response?.data ||
        response;

      setAnalytics(analyticsData || null);
    } catch (err) {
      console.error("Failed to fetch dealer analytics:", err);

      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // =====================================================
  // FETCH DEALER BOOKINGS
  // =====================================================

  const fetchBookings = async () => {
    if (!token) {
      setBookings([]);
      setBookingsLoading(false);
      return;
    }

    try {
      setBookingsLoading(true);

      const response = await getDealerBookings(token);

      const bookingList =
        response?.bookings || response?.data?.bookings || response?.data || [];

      setBookings(Array.isArray(bookingList) ? bookingList : []);
    } catch (err) {
      console.error("Failed to fetch dealer bookings:", err);

      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // =====================================================
  // FETCH EVERYTHING
  // =====================================================

  const fetchAllDealerData = async () => {
    await Promise.all([fetchCars(), fetchAnalytics(), fetchBookings()]);
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!authLoading) {
      fetchAllDealerData();
    }
  }, [token, authLoading]);

  // =====================================================
  // DELETE CAR
  // =====================================================

  const handleDelete = async (carId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(carId);
      setError("");

      await deleteDealerCar(carId, token);

      setCars((previousCars) =>
        previousCars.filter((car) => car._id !== carId),
      );

      // Refresh analytics and bookings
      await Promise.all([fetchAnalytics(), fetchBookings()]);
    } catch (err) {
      console.error("Delete car error:", err);

      setError(err?.response?.data?.message || "Failed to delete car.");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // UPDATE BOOKING STATUS
  // =====================================================

  const handleBookingStatus = async (bookingId, status) => {
    const statusMessages = {
      confirmed: "confirm this booking",
      completed: "mark this booking as completed",
      cancelled: "cancel this booking",
    };

    const action = statusMessages[status] || "update this booking";

    const confirmed = window.confirm(`Are you sure you want to ${action}?`);

    if (!confirmed) return;

    try {
      setUpdatingBookingId(bookingId);
      setError("");

      await updateDealerBookingStatus(bookingId, status, token);

      // Refresh bookings and analytics
      await Promise.all([fetchBookings(), fetchAnalytics()]);
    } catch (err) {
      console.error("Update booking status error:", err);

      setError(
        err?.response?.data?.message || "Failed to update booking status.",
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (authLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div
          className="flex flex-col items-center gap-4"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />

          <p className="font-garamond text-base text-muted-foreground">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">
          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CarFront className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Dealer Dashboard
                </p>

                <h1 className="mt-1 font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
                  My Cars
                </h1>

                <p className="mt-2 max-w-xl font-garamond text-base leading-6 text-muted-foreground">
                  Manage the vehicles you have listed and keep your dealership
                  inventory up to date.
                </p>
              </div>
            </div>

            <Link
              to="/dealer/cars/add"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-garamond text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add New Car
            </Link>
          </div>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                aria-hidden="true"
              />

              <p className="font-garamond text-base font-medium text-destructive">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAllDealerData}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            DEALER ANALYTICS
        ====================================================== */}

        <section className="mb-8">
          <div className="mb-5">
            <p className="font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Business Overview
            </p>

            <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground sm:text-3xl">
              Dealer Analytics
            </h2>

            <p className="mt-1 font-garamond text-base text-muted-foreground">
              Track your vehicles, bookings, cancellations, and earnings.
            </p>
          </div>

          {analyticsLoading ? (
            <AnalyticsLoadingState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnalyticsCard
                title="Total Cars"
                value={formatNumber(analytics?.totalCars ?? cars.length)}
                icon={CarFront}
              />

              <AnalyticsCard
                title="Total Bookings"
                value={formatNumber(analytics?.totalBookings ?? 0)}
                icon={CalendarCheck}
              />

              <AnalyticsCard
                title="Completed"
                value={formatNumber(analytics?.completedBookings ?? 0)}
                icon={CheckCircle2}
              />

              <AnalyticsCard
                title="Cancelled"
                value={formatNumber(analytics?.cancelledBookings ?? 0)}
                icon={XCircle}
              />

              <AnalyticsCard
                title="Confirmed"
                value={formatNumber(analytics?.confirmedBookings ?? 0)}
                icon={CheckCircle2}
              />

              <AnalyticsCard
                title="Pending"
                value={formatNumber(analytics?.pendingBookings ?? 0)}
                icon={Clock3}
              />

              <AnalyticsCard
                title="Active Bookings"
                value={formatNumber(analytics?.activeBookings ?? 0)}
                icon={Activity}
              />

              <AnalyticsCard
                title="Total Earnings"
                value={formatCurrency(analytics?.totalEarnings ?? 0)}
                icon={Banknote}
              />

              <AnalyticsCard
                title="Refunded Amount"
                value={formatCurrency(analytics?.refundedAmount ?? 0)}
                icon={RotateCcw}
              />
            </div>
          )}
        </section>

        {/* =====================================================
            DEALER BOOKINGS
        ====================================================== */}

        <section className="mb-8">
          <div className="mb-5">
            <p className="font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Rental Activity
            </p>

            <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground sm:text-3xl">
              Booked Cars
            </h2>

            <p className="mt-1 font-garamond text-base text-muted-foreground">
              View customers and manage bookings for your vehicles.
            </p>
          </div>

          {bookingsLoading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2
                  className="h-7 w-7 animate-spin text-primary"
                  aria-hidden="true"
                />

                <p className="font-garamond text-base text-muted-foreground">
                  Loading bookings...
                </p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-sm">
              <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 font-metal text-xl tracking-wide text-foreground">
                No bookings yet
              </h3>

              <p className="mt-2 font-garamond text-base text-muted-foreground">
                Bookings for your cars will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP BOOKINGS TABLE
              ================================================== */}

              <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1350px]">
                    <caption className="sr-only">
                      Bookings for dealer vehicles
                    </caption>

                    <thead className="border-b border-border bg-muted/60">
                      <tr>
                        {[
                          "Car",
                          "Customer",
                          "Pickup",
                          "Return",
                          "Amount",
                          "Payment",
                          "Booking Status",
                          "Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {bookings.map((booking) => {
                        const car = booking.car;
                        const user = booking.user;

                        return (
                          <tr
                            key={booking._id}
                            className="transition hover:bg-muted/40"
                          >
                            {/* CAR */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                {car?.image ? (
                                  <img
                                    src={getImageUrl(car.image)}
                                    alt={`${car.brand || ""} ${
                                      car.model || ""
                                    }`}
                                    className="h-12 w-16 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <CarFront
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="font-garamond text-base font-bold text-foreground">
                                    {car?.brand || "Unknown"} {car?.model || ""}
                                  </p>

                                  <p className="font-garamond text-sm text-muted-foreground">
                                    {car?.numberPlate || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CUSTOMER */}

                            <td className="px-6 py-5">
                              <p className="font-garamond text-base font-semibold text-foreground">
                                {user?.name || "Customer"}
                              </p>

                              <p className="font-garamond text-sm text-muted-foreground">
                                {user?.email || "N/A"}
                              </p>
                            </td>

                            {/* PICKUP */}

                            <td className="px-6 py-5 font-garamond text-sm text-muted-foreground">
                              {formatBookingDate(booking.startDate)}
                            </td>

                            {/* RETURN */}

                            <td className="px-6 py-5 font-garamond text-sm text-muted-foreground">
                              {formatBookingDate(booking.endDate)}
                            </td>

                            {/* AMOUNT */}

                            <td className="px-6 py-5 font-garamond text-base font-bold text-foreground">
                              {formatCurrency(booking.totalAmount)}
                            </td>

                            {/* PAYMENT */}

                            <td className="px-6 py-5">
                              <PaymentBadge
                                status={
                                  booking.payment?.status ||
                                  booking.paymentStatus ||
                                  "pending"
                                }
                              />
                            </td>

                            {/* BOOKING STATUS */}

                            <td className="px-6 py-5">
                              <BookingStatusBadge status={booking.status} />
                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">
                              <BookingActions
                                booking={booking}
                                updatingBookingId={updatingBookingId}
                                onStatusChange={handleBookingStatus}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================================
                  MOBILE BOOKINGS
              ================================================== */}

              <div className="space-y-5 md:hidden">
                {bookings.map((booking) => {
                  const car = booking.car;
                  const user = booking.user;

                  return (
                    <article
                      key={booking._id}
                      className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                    >
                      {/* CAR IMAGE */}

                      {car?.image ? (
                        <img
                          src={getImageUrl(car.image)}
                          alt={`${car.brand || ""} ${car.model || ""}`}
                          className="h-52 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-muted text-muted-foreground">
                          <CarFront className="h-12 w-12" />
                        </div>
                      )}

                      <div className="p-5">
                        {/* CAR NAME */}

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-metal text-xl tracking-wide text-foreground">
                              {car?.brand || "Unknown"} {car?.model || ""}
                            </h3>

                            <p className="mt-1 font-garamond text-sm text-muted-foreground">
                              {car?.numberPlate || "N/A"}
                            </p>
                          </div>

                          <BookingStatusBadge status={booking.status} />
                        </div>

                        {/* CUSTOMER */}

                        <div className="mt-5 space-y-3">
                          <div className="flex items-start gap-3">
                            <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                            <div>
                              <p className="font-garamond text-xs font-medium text-muted-foreground">
                                Customer
                              </p>

                              <p className="font-garamond text-base font-semibold text-foreground">
                                {user?.name || "Customer"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                            <div className="min-w-0">
                              <p className="font-garamond text-xs font-medium text-muted-foreground">
                                Email
                              </p>

                              <p className="truncate font-garamond text-sm text-foreground">
                                {user?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* BOOKING DETAILS */}

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <InfoCard
                            label="Pickup"
                            value={formatBookingDate(booking.startDate)}
                          />

                          <InfoCard
                            label="Return"
                            value={formatBookingDate(booking.endDate)}
                          />

                          <InfoCard
                            label="Amount"
                            value={formatCurrency(booking.totalAmount)}
                          />

                          <div className="rounded-xl border border-border bg-muted/50 p-3">
                            <p className="font-garamond text-xs font-medium text-muted-foreground">
                              Payment
                            </p>

                            <div className="mt-2">
                              <PaymentBadge
                                status={
                                  booking.payment?.status ||
                                  booking.paymentStatus ||
                                  "pending"
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* MOBILE ACTIONS */}

                        <div className="mt-5">
                          <BookingActions
                            booking={booking}
                            updatingBookingId={updatingBookingId}
                            onStatusChange={handleBookingStatus}
                            mobile
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* =====================================================
            LOADING / EMPTY / CARS
        ====================================================== */}

        {loading ? (
          <LoadingState />
        ) : cars.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* =================================================
                INVENTORY SUMMARY
            ================================================== */}

            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-garamond text-sm text-muted-foreground">
                  Your inventory
                </p>

                <h2 className="font-metal text-2xl tracking-wide text-foreground">
                  {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"}
                </h2>
              </div>
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <caption className="sr-only">
                    Cars listed by the dealer
                  </caption>

                  <thead className="border-b border-border bg-muted/60">
                    <tr>
                      {[
                        "Vehicle",
                        "Year",
                        "Number Plate",
                        "Price / Day",
                        "Fuel",
                        "Transmission",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-6 py-4 text-left font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                        >
                          {heading}
                        </th>
                      ))}

                      <th
                        scope="col"
                        className="px-6 py-4 text-right font-garamond text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {cars.map((car) => {
                      const imageUrl = getImageUrl(car.image);

                      return (
                        <tr
                          key={car._id}
                          className="transition hover:bg-muted/40"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={`${car.brand} ${car.model}`}
                                  className="h-14 w-20 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                  <CarFront
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="font-garamond text-lg font-bold text-foreground">
                                  {car.brand} {car.model}
                                </p>

                                <p className="font-garamond text-sm text-muted-foreground">
                                  {car.seats} seats
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 font-garamond text-sm text-muted-foreground">
                            {car.year}
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-lg border border-border bg-muted/30 px-3 py-2 font-garamond text-sm font-bold uppercase tracking-wider text-foreground">
                              {car.numberPlate || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-5 font-garamond text-base font-bold text-foreground">
                            ₹{Number(car.pricePerDay).toLocaleString("en-IN")}
                          </td>

                          <td className="px-6 py-5 font-garamond text-sm text-muted-foreground">
                            {car.fuelType}
                          </td>

                          <td className="px-6 py-5 font-garamond text-sm text-muted-foreground">
                            {car.transmission}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge available={car.available} />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/dealer/cars/edit/${car._id}`}
                                aria-label={`Edit ${car.brand} ${car.model}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(car._id)}
                                disabled={deletingId === car._id}
                                aria-label={`Delete ${car.brand} ${car.model}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/30 text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === car._id ? (
                                  <Loader2
                                    className="h-4 w-4 animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Trash2
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================== */}

            <div className="space-y-5 md:hidden">
              {cars.map((car) => {
                const imageUrl = getImageUrl(car.image);

                return (
                  <article
                    key={car._id}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-muted text-muted-foreground">
                        <CarFront className="h-12 w-12" aria-hidden="true" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="font-metal text-xl tracking-wide text-foreground">
                            {car.brand} {car.model}
                          </h2>

                          <p className="mt-1 font-garamond text-base text-muted-foreground">
                            {car.year} • {car.seats} seats
                          </p>

                          <div className="mt-3">
                            <span className="inline-flex rounded-lg border border-border bg-muted/30 px-3 py-1.5 font-garamond text-sm font-bold uppercase tracking-wider text-foreground">
                              {car.numberPlate || "N/A"}
                            </span>
                          </div>
                        </div>

                        <StatusBadge available={car.available} />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <InfoCard
                          label="Price / Day"
                          value={`₹${Number(car.pricePerDay).toLocaleString(
                            "en-IN",
                          )}`}
                        />

                        <InfoCard label="Fuel" value={car.fuelType} />

                        <InfoCard
                          label="Transmission"
                          value={car.transmission}
                        />

                        <InfoCard label="Seats" value={car.seats} />
                      </div>

                      <div className="mt-5 flex gap-3">
                        <Link
                          to={`/dealer/cars/edit/${car._id}`}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 font-garamond text-base font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(car._id)}
                          disabled={deletingId === car._id}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 font-garamond text-base font-semibold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === car._id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                          Delete
                        </button>
                      </div>

                      <Link
                        to={`/cars/${car._id}`}
                        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
                      >
                        View Car
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

// =====================================================
// BOOKING ACTIONS
// =====================================================

function BookingActions({
  booking,
  updatingBookingId,
  onStatusChange,
  mobile = false,
}) {
  const isUpdating = updatingBookingId === booking._id;

  if (booking.status === "completed") {
    return (
      <span className="font-garamond text-sm font-semibold text-muted-foreground">
        Completed
      </span>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <span className="font-garamond text-sm font-semibold text-destructive">
        Cancelled
      </span>
    );
  }

  return (
    <div className={mobile ? "flex w-full gap-3" : "flex min-w-[190px] gap-2"}>
      {booking.status === "pending" && (
        <button
          type="button"
          onClick={() => onStatusChange(booking._id, "confirmed")}
          disabled={isUpdating}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 font-garamond text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Confirm
        </button>
      )}

      {booking.status === "confirmed" && (
        <button
          type="button"
          onClick={() => onStatusChange(booking._id, "completed")}
          disabled={isUpdating}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 font-garamond text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Complete
        </button>
      )}

      <button
        type="button"
        onClick={() => onStatusChange(booking._id, "cancelled")}
        disabled={isUpdating}
        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 font-garamond text-sm font-semibold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Cancel
      </button>
    </div>
  );
}

// =====================================================
// ANALYTICS CARD
// =====================================================

function AnalyticsCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-garamond text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 font-metal text-2xl tracking-wide text-foreground">
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

// =====================================================
// ANALYTICS LOADING
// =====================================================

function AnalyticsLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-[105px] items-center justify-center rounded-2xl border border-border bg-card"
        >
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}

// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}

// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// =====================================================
// FORMAT BOOKING DATE
// =====================================================

function formatBookingDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// =====================================================
// BOOKING STATUS BADGE
// =====================================================

function BookingStatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();

  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-700",
    },

    confirmed: {
      label: "Confirmed",
      className: "bg-green-500/10 text-green-700",
    },

    completed: {
      label: "Completed",
      className: "bg-blue-500/10 text-blue-700",
    },

    cancelled: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 font-garamond text-sm font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// =====================================================
// PAYMENT STATUS BADGE
// =====================================================

function PaymentBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();

  const statusConfig = {
    success: {
      label: "Paid",
      className: "bg-green-500/10 text-green-700",
    },

    paid: {
      label: "Paid",
      className: "bg-green-500/10 text-green-700",
    },

    pending: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-700",
    },

    failed: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive",
    },

    unpaid: {
      label: "Unpaid",
      className: "bg-yellow-500/10 text-yellow-700",
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 font-garamond text-sm font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// =====================================================
// CAR STATUS BADGE
// =====================================================

function StatusBadge({ available }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 font-garamond text-sm font-semibold ${
        available
          ? "bg-success text-foreground"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          available ? "bg-success" : "bg-destructive"
        }`}
        aria-hidden="true"
      />

      {available ? "Available" : "Unavailable"}
    </span>
  );
}

// =====================================================
// MOBILE INFO CARD
// =====================================================

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3">
      <p className="font-garamond text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate font-garamond text-base font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// LOADING STATE
// =====================================================

function LoadingState() {
  return (
    <div
      className="flex min-h-[360px] items-center justify-center rounded-3xl border border-border bg-card"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />

        <p className="font-garamond text-base text-muted-foreground">
          Loading your cars...
        </p>
      </div>
    </div>
  );
}

// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState() {
  return (
    <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CarFront className="h-8 w-8" aria-hidden="true" />
      </div>

      <p className="mt-6 font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        Your inventory
      </p>

      <h2 className="mt-2 font-metal text-3xl tracking-wide text-foreground">
        No cars listed yet
      </h2>

      <p className="mx-auto mt-3 max-w-md font-garamond text-base leading-7 text-muted-foreground">
        Add your first vehicle to start offering cars through DriveNow.
      </p>

      <Link
        to="/dealer/cars/add"
        className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Your First Car
      </Link>
    </section>
  );
}

export default DealerCars;
