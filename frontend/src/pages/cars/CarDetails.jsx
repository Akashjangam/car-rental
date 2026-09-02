import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Fuel,
  Gauge,
  MapPin,
  Users,
} from "lucide-react";

import { getCarById } from "../../services/carApi";
import { useAuth } from "../../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCarById(id);
        const data = response?.car || response?.data || response;

        if (mounted) {
          setCar(data);
        }
      } catch (err) {
        console.error("Failed to fetch car:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load this car. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchCar();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const carImage = useMemo(() => {
    const image = car?.image || car?.imageUrl || car?.images?.[0] || "";

    if (!image) {
      return "";
    }

    return image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
  }, [car]);

  const carName =
    car?.name ||
    [car?.brand, car?.model].filter(Boolean).join(" ") ||
    "DriveNow Car";

  const price =
    car?.pricePerDay ?? car?.rentPerDay ?? car?.dailyRate ?? car?.price ?? 0;

  const transmission = car?.transmission || car?.gearbox || "Automatic";

  const fuel = car?.fuelType || car?.fuel || "Petrol";

  const seats = car?.seats || car?.capacity || 5;

  const category = car?.category || "Car";

  const location = car?.location || car?.pickupLocation || "DriveNow Location";

  const isAvailable =
    car?.available !== false &&
    car?.isAvailable !== false &&
    car?.availability !== false;

  const handleBookNow = () => {
    if (!isAvailable) {
      return;
    }

    if (!token) {
      navigate("/login", {
        state: {
          from: `/booking/${id}`,
        },
      });

      return;
    }

    navigate(`/booking/${id}`);
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !car) {
    return (
      <main className="min-h-screen bg-background px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[500px] max-w-2xl items-center justify-center">
          <section
            className="w-full border-y border-border bg-background px-6 py-12 text-center sm:px-10"
            role="alert"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <CircleAlert
                className="h-8 w-8 text-destructive"
                aria-hidden="true"
              />
            </div>

            <p className="mt-7 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow
            </p>

            <h1 className="mt-4 font-metal text-5xl leading-none text-foreground sm:text-6xl">
              Car not
              <br />
              <span className="text-primary">found.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md font-garamond text-xl leading-relaxed text-muted-foreground">
              {error || "We couldn't find the car you're looking for."}
            </p>

            <Link
              to="/cars"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-garamond text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to cars
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* BACK */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/cars"
            className="inline-flex min-h-10 items-center gap-2 font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to cars
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start xl:gap-16">
          {/* IMAGE */}
          <section>
            <div className="relative overflow-hidden rounded-[36px] sm:rounded-[48px]">
              <div className="aspect-[16/11] bg-muted">
                {carImage ? (
                  <img
                    src={carImage}
                    alt={carName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <CarIcon />

                      <p className="mt-4 font-garamond text-base text-muted-foreground">
                        No image available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* AVAILABILITY */}
              <div className="absolute left-5 top-5">
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

                  {isAvailable ? "Available" : "Currently unavailable"}
                </span>
              </div>
            </div>
          </section>

          {/* DETAILS */}
          <section className="lg:pt-2">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />

              <span className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                {category}
              </span>
            </div>

            {car?.brand && (
              <p className="mt-5 font-garamond text-lg text-muted-foreground">
                {car.brand}
              </p>
            )}

            <h1 className="mt-1 font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
              {carName}
            </h1>

            {car?.description && (
              <p className="mt-6 max-w-xl font-garamond text-xl leading-relaxed text-muted-foreground">
                {car.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-8 border-y border-border py-6">
              <p className="font-garamond text-base text-muted-foreground">
                Rental price
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="font-metal text-4xl text-foreground sm:text-5xl">
                  ₹{Number(price).toLocaleString("en-IN")}
                </span>

                <span className="pb-1 font-garamond text-lg text-muted-foreground">
                  / day
                </span>
              </div>
            </div>

            {/* SPECIFICATIONS */}
            <div className="mt-7">
              <h2 className="font-metal text-2xl text-foreground">
                Vehicle details
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <DetailItem
                  icon={<Gauge />}
                  label="Transmission"
                  value={transmission}
                />

                <DetailItem icon={<Fuel />} label="Fuel" value={fuel} />

                <DetailItem icon={<Users />} label="Seats" value={seats} />

                <DetailItem
                  icon={<MapPin />}
                  label="Location"
                  value={location}
                />
              </div>
            </div>

            {/* BOOK */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleBookNow}
                disabled={!isAvailable}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-garamond text-lg font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarDays className="h-5 w-5" aria-hidden="true" />

                {isAvailable ? "Book this car" : "Car unavailable"}

                {isAvailable && (
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              {!token && isAvailable && (
                <p className="mt-3 text-center font-garamond text-sm text-muted-foreground">
                  You'll need to log in before completing your booking.
                </p>
              )}
            </div>

            {/* TRUST */}
            <div className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <TrustItem text="Secure booking process" />
              <TrustItem text="Verified vehicle information" />
              <TrustItem text="Transparent daily pricing" />
              <TrustItem text="Customer support available" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <span className="text-primary">
          <span
            className="[&>svg]:h-[18px] [&>svg]:w-[18px]"
            aria-hidden="true"
          >
            {icon}
          </span>
        </span>

        <p className="font-garamond text-sm text-muted-foreground">{label}</p>
      </div>

      <p
        className="mt-2 truncate font-garamond text-lg font-semibold text-foreground"
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

function TrustItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
        <Check className="h-4 w-4 text-foreground" aria-hidden="true" />
      </div>

      <span className="font-garamond text-base text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

function CarIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 17h14M6 17l1-5h10l1 5M8 12l1.5-4h5L16 12M7 17v2m10-2v2M4 14h2m12 0h2"
        />
      </svg>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="aspect-[16/11] animate-pulse rounded-[36px] bg-muted sm:rounded-[48px]"
            aria-hidden="true"
          />

          <div className="space-y-6" aria-hidden="true">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />

            <div className="h-14 w-3/4 animate-pulse rounded bg-muted" />

            <div className="h-20 animate-pulse rounded bg-muted" />

            <div className="border-y border-border py-7">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />

              <div className="mt-3 h-12 w-48 animate-pulse rounded bg-muted" />
            </div>

            <div className="h-8 w-44 animate-pulse rounded bg-muted" />

            <div className="grid grid-cols-2 gap-5">
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
            </div>

            <div className="h-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default CarDetails;
