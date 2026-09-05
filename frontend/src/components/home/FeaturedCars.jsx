import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Fuel, Gauge, Star, Users } from "lucide-react";

import { getCars } from "../../services/carApi";
import { getCarReviews } from "../../services/reviewApi";

import CarHero from "../../assets/CarHero.png";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function FeaturedCars() {
  const [cars, setCars] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================
  // FETCH CARS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCars();

        const carData =
          response?.cars ||
          response?.data?.cars ||
          response?.data ||
          response ||
          [];

        if (!mounted) {
          return;
        }

        const allCars = Array.isArray(carData) ? carData : [];

        // Show available cars first.
        // Backend currently returns the complete car list.
        const availableCars = allCars.filter((car) => car?.available !== false);

        setCars(availableCars);

        // ========================================================
        // FETCH REVIEWS
        // ========================================================

        const reviewResults = await Promise.all(
          availableCars.map(async (car) => {
            const carId = car?._id || car?.id;

            if (!carId) {
              return null;
            }

            try {
              const reviewResponse = await getCarReviews(carId);

              return {
                carId: String(carId),
                averageRating: Number(reviewResponse?.averageRating) || 0,
                totalReviews: Number(reviewResponse?.totalReviews) || 0,
              };
            } catch (reviewError) {
              console.error(
                `Failed to load reviews for ${carId}:`,
                reviewError,
              );

              return {
                carId: String(carId),
                averageRating: 0,
                totalReviews: 0,
              };
            }
          }),
        );

        if (!mounted) {
          return;
        }

        const reviewMap = {};

        reviewResults.forEach((result) => {
          if (result?.carId) {
            reviewMap[result.carId] = {
              averageRating: result.averageRating,
              totalReviews: result.totalReviews,
            };
          }
        });

        setReviews(reviewMap);
      } catch (err) {
        console.error("Failed to fetch featured cars:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message || "Unable to load featured cars.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedCars();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // RESET CAROUSEL
  // ============================================================

  useEffect(() => {
    setCurrentIndex(0);
  }, [cars.length]);

  // ============================================================
  // AUTO SLIDE
  // ============================================================

  useEffect(() => {
    if (loading || cars.length <= 1 || isHovered) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        if (previousIndex >= cars.length - 1) {
          return 0;
        }

        return previousIndex + 1;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [cars.length, loading, isHovered]);

  // ============================================================
  // IMAGE URL
  // ============================================================

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return CarHero;
    }

    // Cloudinary / external image
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Local backend image
    return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  // ============================================================
  // IMAGE ERROR HANDLER
  // ============================================================

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallback === "true") {
      return;
    }

    event.currentTarget.dataset.fallback = "true";
    event.currentTarget.src = CarHero;
  };

  // ============================================================
  // VISIBLE CARS
  // ============================================================

  const visibleCars = useMemo(() => {
    if (!cars.length) {
      return [];
    }

    const visibleCount = Math.min(3, cars.length);

    return Array.from({ length: visibleCount }, (_, offset) => {
      return cars[(currentIndex + offset) % cars.length];
    });
  }, [cars, currentIndex]);

  // ============================================================
  // PREVIOUS
  // ============================================================

  const handlePrevious = () => {
    if (!cars.length) {
      return;
    }

    setCurrentIndex((previousIndex) => {
      if (previousIndex === 0) {
        return cars.length - 1;
      }

      return previousIndex - 1;
    });
  };

  // ============================================================
  // NEXT
  // ============================================================

  const handleNext = () => {
    if (!cars.length) {
      return;
    }

    setCurrentIndex((previousIndex) => {
      if (previousIndex >= cars.length - 1) {
        return 0;
      }

      return previousIndex + 1;
    });
  };

  return (
    <section
      className="bg-background px-4 py-14 sm:px-6 sm:py-16 lg:py-20"
      aria-labelledby="featured-cars-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            SECTION HEADER
        ======================================================= */}

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-7 bg-primary" aria-hidden="true" />

              <p className="font-garamond text-[11px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-xs">
                Our Fleet
              </p>
            </div>

            <h2
              id="featured-cars-heading"
              className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl"
            >
              Featured Cars
            </h2>

            <p className="mt-3 max-w-2xl font-garamond text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Choose from our collection of reliable and comfortable cars for
              your next journey.
            </p>
          </div>

          {/* ====================================================
              HEADER ACTIONS
          ===================================================== */}

          <div className="flex items-center gap-4">
            <Link
              to="/cars"
              className="group inline-flex items-center gap-2 font-garamond text-sm font-semibold text-primary transition hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View All Cars
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            {!loading && cars.length > 1 && (
              <div
                className="flex items-center gap-2"
                aria-label="Featured car controls"
              >
                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="Previous featured car"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next featured car"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            LOADING
        ======================================================= */}

        {loading && (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading featured cars"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="h-56 animate-pulse bg-muted" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />

                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />

                  <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />

                  <div className="h-12 animate-pulse rounded-lg bg-muted" />

                  <div className="h-11 animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================
            ERROR
        ======================================================= */}

        {!loading && error && (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
            role="alert"
          >
            <h3 className="font-metal text-2xl text-foreground">
              Unable to load cars
            </h3>

            <p className="mt-2 font-garamond text-sm text-destructive">
              {error}
            </p>

            <Link
              to="/cars"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 font-garamond text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Browse Cars
            </Link>
          </div>
        )}

        {/* ======================================================
            EMPTY
        ======================================================= */}

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

        {/* ======================================================
            CAROUSEL
        ======================================================= */}

        {!loading && !error && cars.length > 0 && (
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* ==================================================
                MOBILE
            =================================================== */}

            <div className="sm:hidden">
              {visibleCars.slice(0, 1).map((car) => (
                <CarCard
                  key={car?._id || car?.id}
                  car={car}
                  reviews={reviews}
                  getImageUrl={getImageUrl}
                  handleImageError={handleImageError}
                />
              ))}
            </div>

            {/* ==================================================
                TABLET
            =================================================== */}

            <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:hidden">
              {visibleCars.slice(0, 2).map((car, index) => (
                <CarCard
                  key={`${car?._id || car?.id}-tablet-${index}`}
                  car={car}
                  reviews={reviews}
                  getImageUrl={getImageUrl}
                  handleImageError={handleImageError}
                />
              ))}
            </div>

            {/* ==================================================
                DESKTOP
            =================================================== */}

            <div className="hidden gap-6 lg:grid lg:grid-cols-3">
              {visibleCars.map((car, index) => (
                <CarCard
                  key={`${car?._id || car?.id}-desktop-${index}`}
                  car={car}
                  reviews={reviews}
                  getImageUrl={getImageUrl}
                  handleImageError={handleImageError}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================================================
            CAROUSEL INDICATORS
        ======================================================= */}

        {!loading && !error && cars.length > 1 && (
          <div
            className="mt-7 flex items-center justify-center gap-2"
            aria-label="Featured car navigation"
          >
            {cars.map((car, index) => (
              <button
                key={car?._id || car?.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show featured car ${index + 1}`}
                aria-current={currentIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ================================================================
// CAR CARD
// ================================================================

function CarCard({ car, reviews, getImageUrl, handleImageError }) {
  const carId = car?._id || car?.id;

  const reviewData = reviews[String(carId)] || {
    averageRating: 0,
    totalReviews: 0,
  };

  const carName = `${car?.brand || ""} ${car?.model || ""}`.trim();

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* ======================================================
          IMAGE
      ======================================================= */}

      <div className="relative h-56 overflow-hidden bg-muted sm:h-60">
        <img
          src={getImageUrl(car?.image)}
          alt={carName || "Rental car"}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          onError={handleImageError}
        />

        {/* Available Badge */}

        {car?.available && (
          <span className="absolute left-4 top-4 rounded-full border border-border/50 bg-background/95 px-3 py-1 font-garamond text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
            Available
          </span>
        )}
      </div>

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <div className="p-5">
        {/* ====================================================
            NAME + PRICE
        ===================================================== */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-metal text-2xl leading-tight text-card-foreground">
              {car?.brand} {car?.model}
            </h3>

            <p className="mt-1 font-garamond text-xs font-medium text-muted-foreground">
              {car?.year || "Year not available"}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-metal text-xl text-primary">
              ₹{Number(car?.pricePerDay || 0).toLocaleString("en-IN")}
            </p>

            <p className="font-garamond text-xs text-muted-foreground">/ day</p>
          </div>
        </div>

        {/* ====================================================
            REVIEWS
        ===================================================== */}

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star
              className="h-4 w-4 text-primary"
              fill="currentColor"
              aria-hidden="true"
            />

            <span className="font-garamond text-sm font-bold text-foreground">
              {reviewData.averageRating > 0
                ? reviewData.averageRating.toFixed(1)
                : "No rating"}
            </span>
          </div>

          <span className="text-muted-foreground" aria-hidden="true">
            ·
          </span>

          <span className="font-garamond text-sm text-muted-foreground">
            {reviewData.totalReviews}{" "}
            {reviewData.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* ====================================================
            FEATURES
        ===================================================== */}

        <div className="mt-5 grid grid-cols-3 border-y border-border py-4">
          {/* Fuel */}

          <div className="flex flex-col items-center gap-1.5 text-center">
            <Fuel
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />

            <span className="font-garamond text-[11px] font-medium text-muted-foreground">
              {car?.fuelType || "Fuel"}
            </span>
          </div>

          {/* Transmission */}

          <div className="flex flex-col items-center gap-1.5 border-x border-border text-center">
            <Gauge
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />

            <span className="font-garamond text-[11px] font-medium text-muted-foreground">
              {car?.transmission || "Transmission"}
            </span>
          </div>

          {/* Seats */}

          <div className="flex flex-col items-center gap-1.5 text-center">
            <Users
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />

            <span className="font-garamond text-[11px] font-medium text-muted-foreground">
              {car?.seats || "-"} Seats
            </span>
          </div>
        </div>

        {/* ====================================================
            VIEW DETAILS
        ===================================================== */}

        <Link
          to={`/cars/${carId}`}
          className="group/button mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 font-garamond text-sm font-semibold text-background transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          View Details
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover/button:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

export default FeaturedCars;
