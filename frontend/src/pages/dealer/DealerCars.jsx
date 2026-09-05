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
} from "lucide-react";

import { getDealerCars, deleteDealerCar } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DealerCars = () => {
  const { token, loading: authLoading } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!authLoading) {
      fetchCars();
    }
  }, [token, authLoading]);

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
    } catch (err) {
      console.error("Delete car error:", err);

      setError(err?.response?.data?.message || "Failed to delete car.");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

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
        {/* Header */}
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

        {/* Error */}
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
              onClick={fetchCars}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 font-garamond text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        )}

        {/* Loading / Empty / Cars */}
        {loading ? (
          <LoadingState />
        ) : cars.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Inventory Summary */}
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

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <caption className="sr-only">
                    Cars listed by the dealer
                  </caption>

                  <thead className="border-b border-border bg-muted/60">
                    <tr>
                      {[
                        "Vehicle",
                        "Year",
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

            {/* Mobile Cards */}
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
