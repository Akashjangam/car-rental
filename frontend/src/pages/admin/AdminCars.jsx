import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CarFront,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Fuel,
  Users,
  Gauge,
  ArrowLeft,
} from "lucide-react";

import { getCars, deleteCar } from "../../services/carApi";
import { useAuth } from "../../context/AuthContext";

const AdminCars = () => {
  const { token } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH CARS
  // =========================================================

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCars();

      const carList =
        response?.cars ||
        response?.data?.cars ||
        response?.data ||
        response ||
        [];

      setCars(Array.isArray(carList) ? carList : []);
    } catch (err) {
      console.error("Failed to load admin cars:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load cars. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // =========================================================
  // DELETE CAR
  // =========================================================

  const handleDelete = async (carId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?\n\nThis action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    try {
      setDeletingId(carId);
      setError("");

      await deleteCar(carId, token);

      setCars((prevCars) => prevCars.filter((car) => car._id !== carId));
    } catch (err) {
      console.error("Delete car error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete car. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "/car-placeholder.jpg";
    }

    if (image.startsWith("http")) {
      return image;
    }

    const apiOrigin = import.meta.env.VITE_API_URL || "http://localhost:5000";

    return `${apiOrigin}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div
          className="flex items-center gap-3 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-hidden="true"
          />

          <span className="font-garamond text-base">Loading cars...</span>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-background px-4 py-8 font-garamond sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">
          <div className="mb-5">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Admin Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CarFront className="h-7 w-7" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  DriveNow Admin
                </p>

                <h1 className="font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
                  Manage Cars
                </h1>

                <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Manage the vehicles available across the DriveNow rental
                  fleet.
                </p>
              </div>
            </div>

            <Link
              to="/admin/cars/add"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20 sm:w-auto"
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
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <p className="text-sm font-semibold text-destructive">{error}</p>

            <button
              type="button"
              onClick={fetchCars}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        {cars.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Fleet Overview
              </p>

              <p className="mt-1 font-metal text-2xl text-foreground">
                {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"}
              </p>
            </div>

            <div className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground">
              {cars.filter((car) => car.available).length} available
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {cars.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CarFront className="h-9 w-9" aria-hidden="true" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Your Fleet
            </p>

            <h2 className="mt-2 font-metal text-3xl text-foreground">
              No cars listed yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
              Add your first vehicle to start building the DriveNow rental
              fleet.
            </p>

            <Link
              to="/admin/cars/add"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Your First Car
            </Link>
          </section>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
              <div className="border-b border-border bg-muted/40 px-6 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Vehicle Inventory
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <caption className="sr-only">
                    DriveNow admin car management table
                  </caption>

                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Car
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Year
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Price
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Fuel
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Transmission
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Status
                      </th>

                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cars.map((car) => (
                      <tr
                        key={car._id}
                        className="border-b border-border/60 transition last:border-b-0 hover:bg-muted/30"
                      >
                        {/* Car */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageUrl(car.image)}
                              alt={`${car.brand || ""} ${car.model || ""}`}
                              className="h-16 w-24 rounded-xl object-cover"
                              onError={(event) => {
                                event.currentTarget.src =
                                  "/car-placeholder.jpg";
                              }}
                            />

                            <div className="min-w-0">
                              <p className="font-metal text-lg tracking-wide text-foreground">
                                {car.brand || "Unknown"} {car.model || ""}
                              </p>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {car.seats || "N/A"} seats
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Year */}

                        <td className="px-5 py-5 text-sm font-semibold text-foreground">
                          {car.year || "N/A"}
                        </td>

                        {/* Price */}

                        <td className="px-5 py-5">
                          <p className="font-bold text-foreground">
                            ₹
                            {Number(car.pricePerDay || 0).toLocaleString(
                              "en-IN",
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            per day
                          </p>
                        </td>

                        {/* Fuel */}

                        <td className="px-5 py-5 text-sm text-muted-foreground">
                          {car.fuelType || "N/A"}
                        </td>

                        {/* Transmission */}

                        <td className="px-5 py-5 text-sm text-muted-foreground">
                          {car.transmission || "N/A"}
                        </td>

                        {/* Status */}

                        <td className="px-5 py-5">
                          {car.available ? (
                            <span className="inline-flex rounded-full bg-success px-3 py-1.5 text-xs font-bold text-foreground">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                              Unavailable
                            </span>
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/cars/edit/${car._id}`}
                              aria-label={`Edit ${
                                car.brand || ""
                              } ${car.model || "car"}`}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Link>

                            <button
                              type="button"
                              aria-label={`Delete ${
                                car.brand || ""
                              } ${car.model || "car"}`}
                              onClick={() => handleDelete(car._id)}
                              disabled={deletingId === car._id}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-destructive/30 bg-background text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                MOBILE / TABLET
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
              {cars.map((car) => (
                <article
                  key={car._id}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                >
                  {/* Image */}

                  <div className="relative">
                    <img
                      src={getImageUrl(car.image)}
                      alt={`${car.brand || ""} ${car.model || ""}`}
                      className="h-56 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/car-placeholder.jpg";
                      }}
                    />

                    <div className="absolute left-4 top-4">
                      {car.available ? (
                        <span className="rounded-full bg-success px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                          {car.year || "Vehicle"}
                        </p>

                        <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                          {car.brand || "Unknown"} {car.model || ""}
                        </h2>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-metal text-xl text-primary">
                          ₹
                          {Number(car.pricePerDay || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="text-xs text-muted-foreground">/ day</p>
                      </div>
                    </div>

                    {/* Specs */}

                    <div className="mt-5 grid grid-cols-3 rounded-2xl border border-border bg-muted/30 py-4">
                      <div className="flex flex-col items-center gap-1 border-r border-border px-2">
                        <Fuel
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />

                        <span className="text-center text-xs font-medium text-muted-foreground">
                          {car.fuelType || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 border-r border-border px-2">
                        <Gauge
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />

                        <span className="text-center text-xs font-medium text-muted-foreground">
                          {car.transmission || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 px-2">
                        <Users
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />

                        <span className="text-center text-xs font-medium text-muted-foreground">
                          {car.seats || "N/A"} Seats
                        </span>
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        to={`/admin/cars/edit/${car._id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(car._id)}
                        disabled={deletingId === car._id}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-destructive/30 bg-background px-4 text-sm font-bold text-destructive transition hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === car._id ? (
                          <>
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                            Deleting
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminCars;
