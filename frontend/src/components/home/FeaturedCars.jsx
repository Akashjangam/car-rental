import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Fuel, Users, Gauge } from "lucide-react";

import { getCars } from "../../services/carApi";

const API_URL = import.meta.env.VITE_API_URL;

function FeaturedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCars({
          limit: 6,
          available: true,
          sort: "newest",
        });

        setCars(data.cars || []);
      } catch (err) {
        console.error("Failed to fetch featured cars:", err);

        setError(
          err.response?.data?.message || "Unable to load featured cars.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const getImageUrl = (image) => {
    if (!image) {
      return "/placeholder-car.jpg";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `${API_URL?.replace("/api", "")}${image}`;
  };

  return (
    <section className="bg-background px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            SECTION HEADER
        ================================================== */}

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-7 bg-primary" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Our Fleet
              </p>
            </div>

            <h2 className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
              Featured Cars
            </h2>

            <p className="mt-3 max-w-2xl font-garamond text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Choose from our collection of reliable and comfortable cars for
              your next journey.
            </p>
          </div>

          <Link
            to="/cars"
            className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-primary transition hover:gap-3 sm:self-auto"
          >
            View All Cars
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="h-56 animate-pulse bg-muted" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />

                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />

                  <div className="h-12 animate-pulse rounded-lg bg-muted" />

                  <div className="h-11 animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <h3 className="font-metal text-2xl text-foreground">
              Unable to load cars
            </h3>

            <p className="mt-2 text-sm text-destructive">{error}</p>

            <Link
              to="/cars"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              Browse Cars
            </Link>
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading && !error && cars.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h3 className="font-metal text-2xl text-foreground">
              No cars available
            </h3>

            <p className="mt-2 font-garamond text-lg text-muted-foreground">
              Please check again later.
            </p>
          </div>
        )}

        {/* ==================================================
            CARS
        ================================================== */}

        {!loading && !error && cars.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <article
                key={car._id}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* ==========================================
                    IMAGE
                ========================================== */}

                <div className="relative h-56 overflow-hidden bg-muted sm:h-60">
                  <img
                    src={getImageUrl(car.image)}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-car.jpg";
                    }}
                  />

                  {/* Availability */}

                  {car.available && (
                    <span className="absolute left-4 top-4 rounded-full border border-border/50 bg-background/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
                      Available
                    </span>
                  )}
                </div>

                {/* ==========================================
                    CONTENT
                ========================================== */}

                <div className="p-5">
                  {/* Name + Price */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-metal text-2xl leading-tight text-card-foreground">
                        {car.brand} {car.model}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {car.year}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xl font-bold text-primary">
                        ₹{Number(car.pricePerDay).toLocaleString("en-IN")}
                      </p>

                      <p className="text-xs text-muted-foreground">/ day</p>
                    </div>
                  </div>

                  {/* ==========================================
                      FEATURES
                  ========================================== */}

                  <div className="mt-5 grid grid-cols-3 border-y border-border py-4">
                    {/* Fuel */}

                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <Fuel
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span className="text-[11px] font-medium text-muted-foreground">
                        {car.fuelType || "Fuel"}
                      </span>
                    </div>

                    {/* Transmission */}

                    <div className="flex flex-col items-center gap-1.5 border-x border-border text-center">
                      <Gauge
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span className="text-[11px] font-medium text-muted-foreground">
                        {car.transmission || "Transmission"}
                      </span>
                    </div>

                    {/* Seats */}

                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <Users
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span className="text-[11px] font-medium text-muted-foreground">
                        {car.seats || "-"} Seats
                      </span>
                    </div>
                  </div>

                  {/* ==========================================
                      VIEW DETAILS
                  ========================================== */}

                  <Link
                    to={`/cars/${car._id}`}
                    className="group/button mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    View Details
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCars;
