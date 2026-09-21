import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CarFront,
  ChevronDown,
  ChevronRight,
  Fuel,
  Gauge,
  Heart,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react";

import { getCars } from "../../services/carApi";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Cars() {
  const [searchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [reviews, setReviews] = useState({});

  const [search, setSearch] = useState(
    () => searchParams.get("search") || searchParams.get("location") || "",
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FILTER STATES
  // ============================================================
  const [showFilters, setShowFilters] = useState(false);

  const [fuelFilter, setFuelFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSeats, setMinSeats] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  // ============================================================
  // FETCH CARS + REVIEWS
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const fetchCarsAndReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCars();

        const data =
          response?.cars ||
          response?.data?.cars ||
          response?.data ||
          response ||
          [];

        const carData = Array.isArray(data) ? data : [];

        if (!mounted) {
          return;
        }

        setCars(carData);

        // ========================================================
        // POPULATE REVIEWS FROM PRE-CALCULATED RATINGS
        // ========================================================
        const reviewMap = {};

        carData.forEach((car) => {
          const carId = car?._id || car?.id;
          if (carId) {
            reviewMap[String(carId)] = {
              totalReviews: Number(car.totalReviews) || 0,
              averageRating: Number(car.averageRating) || 0,
            };
          }
        });

        setReviews(reviewMap);
      } catch (err) {
        console.error("Failed to fetch cars:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load cars right now. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCarsAndReviews();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // SYNC SEARCH WITH URL
  // ============================================================
  const prevSearchQueryRef = useRef(
    searchParams.get("search") || searchParams.get("location") || "",
  );

  useEffect(() => {
    const urlQuery =
      searchParams.get("search") || searchParams.get("location") || "";
    if (prevSearchQueryRef.current !== urlQuery) {
      prevSearchQueryRef.current = urlQuery;
      setSearch(urlQuery);
    }
  }, [searchParams]);

  // ============================================================
  // FILTER CARS
  // ============================================================
  const filteredCars = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    return cars.filter((car) => {
      // --------------------------------------------------------
      // DATE AVAILABILITY CHECK (from Homepage Search)
      // --------------------------------------------------------
      if ((startDateParam || endDateParam) && car?.available === false) {
        return false;
      }

      // --------------------------------------------------------
      // TEXT SEARCH
      // --------------------------------------------------------
      if (searchValue) {

        const searchableText = [
          car?.name,
          car?.brand,
          car?.model,
          car?.numberPlate,
          car?.category,
          car?.fuelType,
          car?.transmission,
          car?.year,
          car?.pricePerDay,
          car?.rentPerDay,
          car?.dailyRate,
          car?.price,
          car?.location,
          car?.pickupLocation,
        ]
          .filter((item) => item !== undefined && item !== null && item !== "")
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchValue)) {
          return false;
        }
      }

      // --------------------------------------------------------
      // FUEL
      // --------------------------------------------------------
      if (fuelFilter !== "all") {
        const carFuel = String(car?.fuelType || car?.fuel || "").toLowerCase();

        if (carFuel !== fuelFilter.toLowerCase()) {
          return false;
        }
      }

      // --------------------------------------------------------
      // TRANSMISSION
      // --------------------------------------------------------
      if (transmissionFilter !== "all") {
        const carTransmission = String(
          car?.transmission || car?.gearbox || "",
        ).toLowerCase();

        if (carTransmission !== transmissionFilter.toLowerCase()) {
          return false;
        }
      }

      // --------------------------------------------------------
      // MAXIMUM PRICE
      // --------------------------------------------------------
      if (maxPrice !== "") {
        const carPrice = Number(
          car?.pricePerDay ??
            car?.rentPerDay ??
            car?.dailyRate ??
            car?.price ??
            0,
        );

        if (carPrice > Number(maxPrice)) {
          return false;
        }
      }

      // --------------------------------------------------------
      // MINIMUM SEATS
      // --------------------------------------------------------
      if (minSeats !== "all") {
        const carSeats = Number(car?.seats || car?.capacity || 0);

        if (carSeats < Number(minSeats)) {
          return false;
        }
      }

      // --------------------------------------------------------
      // AVAILABLE ONLY
      // --------------------------------------------------------
      if (availableOnly) {
        const isAvailable =
          car?.available !== false &&
          car?.isAvailable !== false &&
          car?.availability !== false;

        if (!isAvailable) {
          return false;
        }
      }

      return true;
    });
  }, [
    cars,
    search,
    fuelFilter,
    transmissionFilter,
    maxPrice,
    minSeats,
    availableOnly,
    searchParams,
  ]);

  // ============================================================
  // ACTIVE FILTER COUNT
  // ============================================================
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (fuelFilter !== "all") {
      count++;
    }

    if (transmissionFilter !== "all") {
      count++;
    }

    if (maxPrice !== "") {
      count++;
    }

    if (minSeats !== "all") {
      count++;
    }

    if (availableOnly) {
      count++;
    }

    return count;
  }, [fuelFilter, transmissionFilter, maxPrice, minSeats, availableOnly]);

  // ============================================================
  // CLEAR SEARCH
  // ============================================================
  const clearSearch = () => {
    setSearch("");
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================
  const clearFilters = () => {
    setFuelFilter("all");
    setTransmissionFilter("all");
    setMaxPrice("");
    setMinSeats("all");
    setAvailableOnly(false);
  };

  // ============================================================
  // CLEAR EVERYTHING
  // ============================================================
  const clearAll = () => {
    setSearch("");
    clearFilters();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ======================================================
          HEADER
      ======================================================= */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />

              <span className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                DriveNow Cars
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Find the right car
              <br />
              <span className="text-primary">for your journey.</span>
            </h1>

            <p className="mt-6 max-w-2xl font-garamond text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Browse our available vehicles and choose a car that fits your
              trip, budget, and driving needs.
            </p>
          </div>

          {/* ==================================================
              SEARCH
          =================================================== */}
          <div className="mt-10 max-w-3xl">
            <label
              htmlFor="car-search"
              className="mb-2 block font-garamond text-base font-semibold text-foreground"
            >
              Search cars
            </label>

            <div className="group relative transition-all duration-300 focus-within:scale-[1.01]">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary"
                aria-hidden="true"
              />

              <input
                id="car-search"
                name="car-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by brand, model, category..."
                className="h-14 w-full rounded-full border border-border bg-card pl-14 pr-14 font-garamond text-lg text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear car search"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:rotate-90 hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {search.trim() && !loading && !error && (
              <p className="mt-3 animate-[fadeInUp_0.3s_ease-out] font-garamond text-sm text-muted-foreground">
                Searching across brand, model, number plate, category, fuel
                type, transmission, year and price.
              </p>
            )}
          </div>

          {/* ==================================================
              FILTER BUTTON
          =================================================== */}
          <div className="mt-5 max-w-3xl">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-border bg-card px-5 font-garamond text-base font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal
                className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12"
                aria-hidden="true"
              />
              Extended filters
              {activeFilterCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  showFilters ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* ==================================================
              FILTER PANEL
          =================================================== */}
          {showFilters && (
            <div className="mt-5 max-w-5xl animate-[fadeInUp_0.35s_ease-out] rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-metal text-2xl text-foreground">
                      Filter cars
                    </h2>

                    <p className="mt-1 font-garamond text-sm text-muted-foreground">
                      Refine your search using the options below.
                    </p>
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-garamond text-sm font-semibold text-primary transition hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Fuel */}
                  <FilterField label="Fuel type" htmlFor="fuel-filter">
                    <select
                      id="fuel-filter"
                      value={fuelFilter}
                      onChange={(event) => setFuelFilter(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 font-garamond text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="all">All fuel types</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </FilterField>

                  {/* Transmission */}
                  <FilterField
                    label="Transmission"
                    htmlFor="transmission-filter"
                  >
                    <select
                      id="transmission-filter"
                      value={transmissionFilter}
                      onChange={(event) =>
                        setTransmissionFilter(event.target.value)
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 font-garamond text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="all">All transmissions</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </FilterField>

                  {/* Maximum price */}
                  <FilterField label="Maximum price / day" htmlFor="max-price">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-garamond text-muted-foreground">
                        ₹
                      </span>

                      <input
                        id="max-price"
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="e.g. 3000"
                        className="h-12 w-full rounded-xl border border-border bg-background pl-9 pr-4 font-garamond text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </FilterField>

                  {/* Minimum seats */}
                  <FilterField label="Minimum seats" htmlFor="min-seats">
                    <select
                      id="min-seats"
                      value={minSeats}
                      onChange={(event) => setMinSeats(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 font-garamond text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="all">Any seats</option>
                      <option value="2">2+ seats</option>
                      <option value="4">4+ seats</option>
                      <option value="5">5+ seats</option>
                      <option value="6">6+ seats</option>
                      <option value="7">7+ seats</option>
                      <option value="8">8+ seats</option>
                    </select>
                  </FilterField>
                </div>

                {/* Available only */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(event) => setAvailableOnly(event.target.checked)}
                    className="h-5 w-5 rounded border-border accent-primary"
                  />

                  <div>
                    <p className="font-garamond text-base font-semibold text-foreground">
                      Available cars only
                    </p>

                    <p className="font-garamond text-sm text-muted-foreground">
                      Hide cars that are currently unavailable.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CARS
      ======================================================= */}
      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {!loading && !error && (
          <div className="mb-8 flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-metal text-3xl text-foreground sm:text-4xl">
                Available cars
              </h2>

              <p className="mt-1 font-garamond text-lg text-muted-foreground">
                {filteredCars.length}{" "}
                {filteredCars.length === 1 ? "car" : "cars"} found
              </p>
            </div>

            {(search.trim() || activeFilterCount > 0) && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-border px-4 font-garamond text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary sm:self-auto"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear all
              </button>
            )}
          </div>
        )}

        {/* ======================================================
            LOADING
        ======================================================= */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading cars"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <CarSkeleton key={index} />
            ))}
          </div>
        )}

        {/* ======================================================
            ERROR
        ======================================================= */}
        {!loading && error && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div
              className="w-full max-w-xl border-y border-border px-6 py-12 text-center"
              role="alert"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle
                  className="h-8 w-8 text-destructive"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                DriveNow
              </p>

              <h2 className="mt-3 font-metal text-4xl text-foreground">
                Unable to load cars
              </h2>

              <p className="mx-auto mt-4 max-w-md font-garamond text-lg leading-relaxed text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 font-garamond text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            EMPTY
        ======================================================= */}
        {!loading && !error && filteredCars.length === 0 && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="w-full max-w-xl animate-[fadeInUp_0.5s_ease-out] border-y border-border px-6 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CarFront className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>

              <h2 className="mt-6 font-metal text-4xl text-foreground">
                No cars found
              </h2>

              <p className="mx-auto mt-3 max-w-md font-garamond text-lg leading-relaxed text-muted-foreground">
                {search || activeFilterCount > 0
                  ? "Try changing your search or filters."
                  : "There are currently no cars available."}
              </p>

              {(search || activeFilterCount > 0) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 min-h-11 rounded-full border border-border bg-background px-6 font-garamond text-base font-semibold text-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================
            CAR GRID
        ======================================================= */}
        {!loading && !error && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 items-stretch gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCars.map((car, index) => {
              const carId = car?._id || car?.id;

              return (
                <div
                  key={carId}
                  className="h-full animate-[fadeInUp_0.5s_ease-out]"
                  style={{
                    animationDelay: `${Math.min(index * 80, 400)}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <CarCard
                    car={car}
                    reviewData={
                      reviews[String(carId)] || {
                        totalReviews: 0,
                        averageRating: 0,
                      }
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

// ================================================================
// FILTER FIELD
// ================================================================
function FilterField({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-garamond text-sm font-semibold text-foreground"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

// ================================================================
// CAR CARD
// ================================================================
function CarCard({ car, reviewData }) {
  const carId = car?._id || car?.id;

  const [isSaved, setIsSaved] = useState(() => {
    if (!carId) return false;
    try {
      const savedCars = JSON.parse(localStorage.getItem("savedCars") || "[]");
      return savedCars.some(
        (savedCar) => String(savedCar?._id || savedCar?.id) === String(carId),
      );
    } catch {
      return false;
    }
  });

  const image = car?.image || car?.imageUrl || car?.images?.[0] || "";

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`
    : "";

  const carName =
    car?.name ||
    [car?.brand, car?.model].filter(Boolean).join(" ") ||
    "DriveNow Car";

  const price =
    car?.pricePerDay ?? car?.rentPerDay ?? car?.dailyRate ?? car?.price ?? 0;

  const transmission = car?.transmission || car?.gearbox || "Automatic";

  const fuel = car?.fuelType || car?.fuel || "Petrol";

  const seats = car?.seats || car?.capacity || 5;

  const isAvailable =
    car?.available !== false &&
    car?.isAvailable !== false &&
    car?.availability !== false;

  const averageRating = Number(reviewData?.averageRating) || 0;

  const totalReviews = Number(reviewData?.totalReviews) || 0;


  // ============================================================
  // TOGGLE SAVED CAR
  // ============================================================
  const toggleSavedCar = () => {
    if (!carId) {
      return;
    }

    try {
      const savedCars = JSON.parse(localStorage.getItem("savedCars") || "[]");

      const alreadySaved = savedCars.some(
        (savedCar) => String(savedCar?._id || savedCar?.id) === String(carId),
      );

      let updatedCars;

      if (alreadySaved) {
        updatedCars = savedCars.filter(
          (savedCar) => String(savedCar?._id || savedCar?.id) !== String(carId),
        );
      } else {
        updatedCars = [...savedCars, car];
      }

      localStorage.setItem("savedCars", JSON.stringify(updatedCars));

      setIsSaved(!alreadySaved);
    } catch (error) {
      console.error("Failed to save car:", error);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ======================================================
          IMAGE
      ======================================================= */}
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={carName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            aria-label="No car image available"
          >
            <CarFront
              className="h-16 w-16 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Availability */}
        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-garamond text-sm font-semibold shadow-sm ${
              isAvailable
                ? "bg-success text-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isAvailable ? "bg-green-600" : "bg-muted-foreground"
              }`}
              aria-hidden="true"
            />

            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={toggleSavedCar}
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
            isSaved
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background/90 text-foreground hover:border-primary hover:text-primary"
          }`}
          aria-label={
            isSaved ? `Remove ${carName} from saved cars` : `Save ${carName}`
          }
          aria-pressed={isSaved}
          title={isSaved ? "Remove from saved cars" : "Save car"}
        >
          <Heart
            className="h-[19px] w-[19px]"
            fill={isSaved ? "currentColor" : "none"}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ======================================================
          CONTENT
      ======================================================= */}
      <div className="flex flex-1 flex-col p-6">
        <div>
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h3 className="truncate font-metal text-2xl text-foreground">
                {carName}
              </h3>

              {car?.category && (
                <p className="mt-1 font-garamond text-base text-muted-foreground">
                  {car.category}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="font-metal text-2xl text-foreground">
                ₹{Number(price).toLocaleString("en-IN")}
              </p>

              <p className="font-garamond text-sm text-muted-foreground">
                per day
              </p>
            </div>
          </div>

          {/* Number plate */}
          {car?.numberPlate && (
            <div className="mt-3">
              <span
                className="inline-flex max-w-full rounded-lg border border-border bg-muted/30 px-3 py-1.5 font-garamond text-sm font-semibold uppercase tracking-wider text-foreground"
                title={`Number Plate: ${car.numberPlate}`}
              >
                Number Plate: {car.numberPlate}
              </span>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star
                className="h-4 w-4 text-primary"
                fill="currentColor"
                aria-hidden="true"
              />

              <span className="font-garamond text-sm font-bold text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : "No rating"}
              </span>
            </div>

            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>

            <span className="font-garamond text-sm text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>

          {/* Specifications */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-border border-y border-border py-4">
            <SpecItem
              icon={<Gauge className="h-4 w-4" />}
              label={transmission}
            />

            <SpecItem icon={<Fuel className="h-4 w-4" />} label={fuel} />

            <SpecItem
              icon={<Users className="h-4 w-4" />}
              label={`${seats} Seats`}
            />
          </div>
        </div>

        {/* ====================================================
            ACTION - ALWAYS AT BOTTOM
        ===================================================== */}
        <div className="mt-auto pt-6">
          {carId ? (
            <Link
              to={`/cars/${carId}`}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-lg font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              View details
              <ChevronRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-muted px-5 font-garamond text-lg font-semibold text-muted-foreground">
              Details unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ================================================================
// SPECIFICATION ITEM
// ================================================================
function SpecItem({ icon, label }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center">
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>

      <span className="max-w-full truncate font-garamond text-sm font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ================================================================
// CAR SKELETON
// ================================================================
function CarSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card"
      aria-hidden="true"
    >
      <div className="aspect-[16/10] shrink-0 animate-pulse bg-muted" />

      <div className="flex flex-1 flex-col space-y-5 p-6">
        <div className="flex justify-between gap-4">
          <div className="h-7 w-36 animate-pulse rounded bg-muted" />

          <div className="h-7 w-20 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-5 w-32 animate-pulse rounded bg-muted" />

        <div className="h-16 animate-pulse rounded bg-muted" />

        <div className="mt-auto h-12 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default Cars;
