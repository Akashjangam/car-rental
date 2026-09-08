import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
} from "lucide-react";

import { getCarById } from "../../services/carApi";
import { createBooking } from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

/* ======================================================
   HELPERS
====================================================== */

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalDateTimeString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/* ======================================================
   COMPONENT
====================================================== */

function BookingCreate() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [car, setCar] = useState(null);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = useMemo(() => getLocalDateString(), []);

  const minimumStartDateTime = useMemo(() => {
    return getLocalDateTimeString();
  }, []);

  /* ======================================================
     LOAD CAR
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCarById(carId);

        const carData =
          response?.car ||
          response?.data?.car ||
          response?.data ||
          response;

        if (!carData) {
          throw new Error("Car not found.");
        }

        if (mounted) {
          setCar(carData);
        }
      } catch (err) {
        console.error("Load car error:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load car details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (carId) {
      loadCar();
    } else {
      setLoading(false);
      setError("Invalid car.");
    }

    return () => {
      mounted = false;
    };
  }, [carId]);

  /* ======================================================
     DATE OBJECTS
  ====================================================== */

  const start = useMemo(() => {
    if (!startDateTime) {
      return null;
    }

    const date = new Date(startDateTime);

    return Number.isNaN(date.getTime()) ? null : date;
  }, [startDateTime]);

  const end = useMemo(() => {
    if (!endDateTime) {
      return null;
    }

    const date = new Date(endDateTime);

    return Number.isNaN(date.getTime()) ? null : date;
  }, [endDateTime]);

  /* ======================================================
     RENTAL DURATION
  ====================================================== */

  const rentalDays = useMemo(() => {
    if (!start || !end) {
      return 0;
    }

    if (end <= start) {
      return 0;
    }

    const difference = end.getTime() - start.getTime();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return Math.ceil(difference / millisecondsPerDay);
  }, [start, end]);

  const pricePerDay = Number(car?.pricePerDay || 0);

  const totalAmount = rentalDays * pricePerDay;

  /* ======================================================
     PRICE FORMAT
  ====================================================== */

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  /* ======================================================
     CAR IMAGE
  ====================================================== */

  const carImage = useMemo(() => {
    const image =
      car?.image || car?.imageUrl || car?.images?.[0] || "";

    if (!image) {
      return "";
    }

    return image.startsWith("http")
      ? image
      : `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
  }, [car]);

  /* ======================================================
     START DATE/TIME CHANGE
  ====================================================== */

  const handleStartDateTimeChange = (value) => {
    setStartDateTime(value);
    setError("");
    setSuccess("");

    if (endDateTime && value >= endDateTime) {
      setEndDateTime("");
    }
  };

  /* ======================================================
     END DATE/TIME CHANGE
  ====================================================== */

  const handleEndDateTimeChange = (value) => {
    setEndDateTime(value);
    setError("");
    setSuccess("");
  };

  /* ======================================================
     SUBMIT BOOKING
  ====================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* --------------------------------------------------
       AUTHENTICATION
    -------------------------------------------------- */

    if (!token || !user) {
      navigate("/login", {
        state: {
          from: `/booking/${carId}`,
        },
      });

      return;
    }

    /* --------------------------------------------------
       VALIDATE DATE/TIME
    -------------------------------------------------- */

    if (!startDateTime || !endDateTime) {
      setError("Please select both pickup and return date/time.");

      return;
    }

    if (!start || !end) {
      setError("Please select valid pickup and return times.");

      return;
    }

    /* --------------------------------------------------
       PICKUP CANNOT BE IN THE PAST
    -------------------------------------------------- */

    if (start < new Date()) {
      setError("Pickup date/time cannot be in the past.");

      return;
    }

    /* --------------------------------------------------
       RETURN MUST BE AFTER PICKUP
    -------------------------------------------------- */

    if (end <= start) {
      setError("Return date/time must be after pickup date/time.");

      return;
    }

    /* --------------------------------------------------
       RENTAL DAYS
    -------------------------------------------------- */

    if (rentalDays <= 0) {
      setError("Please select a valid rental period.");

      return;
    }

    /* --------------------------------------------------
       CAR AVAILABILITY
    -------------------------------------------------- */

    if (!car?.available) {
      setError("This car is currently unavailable.");

      return;
    }

    /* --------------------------------------------------
       CREATE BOOKING

       Backend performs the final overlap check.
    -------------------------------------------------- */

    try {
      setBookingLoading(true);

      const response = await createBooking(
        {
          carId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        token,
      );

      const booking =
        response?.booking ||
        response?.data?.booking ||
        response?.data ||
        response;

      const bookingId =
        booking?._id ||
        booking?.id ||
        response?.bookingId ||
        response?.data?.bookingId;

      if (!bookingId) {
        throw new Error(
          "Booking was created, but no booking ID was returned.",
        );
      }

      setSuccess("Booking created successfully.");

      setTimeout(() => {
        navigate(`/payment/${bookingId}`);
      }, 700);
    } catch (err) {
      console.error("Create booking error:", err);

      const status = err?.response?.status;

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create booking.";

      if (status === 409) {
        setError(
          "This car is already booked during the selected time. Please choose another pickup or return time.",
        );
      } else {
        setError(message);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  /* ======================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div
          className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-8 py-7 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />

          <div className="text-center">
            <p className="font-metal text-xl tracking-wide text-foreground">
              Loading Car
            </p>

            <p className="mt-1 font-garamond text-base text-muted-foreground">
              Preparing your booking...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ======================================================
     CAR LOAD ERROR
  ====================================================== */

  if (error && !car) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
        <div
          className="w-full max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-sm"
          role="alert"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" aria-hidden="true" />
          </div>

          <p className="mt-6 font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-destructive">
            Something went wrong
          </p>

          <h1 className="mt-2 font-metal text-3xl tracking-wide text-foreground">
            Unable to Load Car
          </h1>

          <p className="mt-3 font-garamond text-base leading-7 text-muted-foreground">
            {error}
          </p>

          <Link
            to="/cars"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            Browse Cars
          </Link>
        </div>
      </main>
    );
  }

  /* ======================================================
     MAIN UI
  ====================================================== */

  return (
    <main className="min-h-[75vh] bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/cars/${carId}`}
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Car Details
        </Link>

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            DriveNow Booking
          </p>

          <h1 className="mt-1 font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
            Book Your Car
          </h1>

          <p className="mt-2 max-w-2xl font-garamond text-base leading-6 text-muted-foreground">
            Choose your pickup and return date/time. The system will check
            whether this car is available for your selected period.
          </p>
        </header>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
          >
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />

            <p className="font-garamond text-base font-medium text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <p className="font-garamond text-base font-semibold text-foreground">
              {success}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ==================================================
              CAR INFORMATION
          ================================================== */}

          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative h-64 bg-muted sm:h-[360px]">
              {carImage ? (
                <img
                  src={carImage}
                  alt={`${car?.brand || ""} ${car?.model || ""}`.trim()}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-muted-foreground"
                  aria-label="No car image available"
                >
                  <Car className="h-20 w-20" aria-hidden="true" />
                </div>
              )}

              <div className="absolute left-5 top-5">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-garamond text-sm font-bold shadow-sm ${
                    car?.available
                      ? "bg-success text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      car?.available
                        ? "bg-success"
                        : "bg-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />

                  {car?.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-garamond text-base font-semibold text-muted-foreground">
                    {car?.brand || "DriveNow"}
                  </p>

                  <h2 className="mt-1 font-metal text-3xl tracking-wide text-foreground">
                    {car?.model || "Car"}
                  </h2>

                  {car?.year && (
                    <p className="mt-1 font-garamond text-base text-muted-foreground">
                      Model year {car.year}
                    </p>
                  )}

                  {/* ==================================================
                      NUMBER PLATE
                  ================================================== */}

                  {car?.numberPlate && (
                    <p className="mt-2 font-garamond text-base font-semibold text-muted-foreground">
                      Number Plate:{" "}
                      <span className="text-foreground">
                        {car.numberPlate}
                      </span>
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="font-metal text-2xl tracking-wide text-foreground">
                    {formatPrice(pricePerDay)}
                  </p>

                  <p className="font-garamond text-sm text-muted-foreground">
                    per day
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <CarInfo
                  label="Fuel"
                  value={car?.fuelType || "—"}
                />

                <CarInfo
                  label="Transmission"
                  value={car?.transmission || "—"}
                />

                <CarInfo
                  label="Seats"
                  value={car?.seats ? `${car.seats}` : "—"}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-muted p-4">
                <MapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-garamond text-base font-bold text-foreground">
                    DriveNow Rental
                  </p>

                  <p className="mt-1 font-garamond text-sm leading-6 text-muted-foreground">
                    Select your pickup and return time to check the rental
                    period.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              BOOKING FORM
          ================================================== */}

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Reservation
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Pickup & Return
                </h2>

                <p className="mt-1 font-garamond text-base text-muted-foreground">
                  Choose the exact date and time.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* ==================================================
                  PICKUP
              ================================================== */}

              <div>
                <label
                  htmlFor="startDateTime"
                  className="mb-2 block font-garamond text-base font-semibold text-foreground"
                >
                  Pickup Date & Time
                </label>

                <input
                  id="startDateTime"
                  name="startDateTime"
                  type="datetime-local"
                  min={minimumStartDateTime}
                  value={startDateTime}
                  onChange={(event) =>
                    handleStartDateTimeChange(event.target.value)
                  }
                  disabled={bookingLoading || !car?.available}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 font-garamond text-base text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                />

                <p className="mt-2 font-garamond text-sm text-muted-foreground">
                  Select when you want to collect the car.
                </p>
              </div>

              {/* ==================================================
                  RETURN
              ================================================== */}

              <div>
                <label
                  htmlFor="endDateTime"
                  className="mb-2 block font-garamond text-base font-semibold text-foreground"
                >
                  Return Date & Time
                </label>

                <input
                  id="endDateTime"
                  name="endDateTime"
                  type="datetime-local"
                  min={startDateTime || minimumStartDateTime}
                  value={endDateTime}
                  onChange={(event) =>
                    handleEndDateTimeChange(event.target.value)
                  }
                  disabled={bookingLoading || !car?.available}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 font-garamond text-base text-foreground outline-none transition hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
                />

                <p className="mt-2 font-garamond text-sm text-muted-foreground">
                  Select when you will return the car.
                </p>
              </div>

              {/* ==================================================
                  SELECTED PERIOD
              ================================================== */}

              {start && end && end > start && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="font-garamond text-base font-bold text-foreground">
                        Selected Rental Period
                      </p>

                      <p className="mt-2 font-garamond text-sm leading-6 text-muted-foreground">
                        Pickup:{" "}
                        <span className="font-semibold text-foreground">
                          {formatDateTime(start)}
                        </span>
                      </p>

                      <p className="font-garamond text-sm leading-6 text-muted-foreground">
                        Return:{" "}
                        <span className="font-semibold text-foreground">
                          {formatDateTime(end)}
                        </span>
                      </p>

                      <p className="mt-2 font-garamond text-sm font-semibold text-primary">
                        The final availability check happens when you confirm
                        the booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  PRICE SUMMARY
              ================================================== */}

              <div className="rounded-2xl border border-border bg-muted/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-metal text-xl tracking-wide text-foreground">
                    Price Summary
                  </h3>

                  <CreditCard
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <SummaryRow
                    label="Price per day"
                    value={formatPrice(pricePerDay)}
                  />

                  <SummaryRow
                    label="Rental days"
                    value={`${rentalDays} ${
                      rentalDays === 1 ? "day" : "days"
                    }`}
                  />

                  <div className="border-t border-border pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="font-garamond text-base font-bold text-foreground">
                        Total
                      </span>

                      <span className="font-metal text-2xl tracking-wide text-foreground">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  PAYMENT MESSAGE
              ================================================== */}

              <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <CreditCard
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-garamond text-base font-bold text-foreground">
                    Secure Payment Step
                  </p>

                  <p className="mt-1 font-garamond text-sm leading-6 text-muted-foreground">
                    Availability is checked before the booking is created.
                    After a successful booking, you’ll continue to payment.
                  </p>
                </div>
              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  !car?.available ||
                  !startDateTime ||
                  !endDateTime ||
                  rentalDays <= 0
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-garamond text-base font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingLoading ? (
                  <>
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Checking Availability...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    Confirm Booking
                  </>
                )}
              </button>

              {!car?.available && (
                <p className="text-center font-garamond text-sm font-semibold text-destructive">
                  This car is currently unavailable.
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ======================================================
   CAR INFO
====================================================== */

function CarInfo({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="font-garamond text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate font-garamond text-base font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

/* ======================================================
   SUMMARY ROW
====================================================== */

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-garamond text-base text-muted-foreground">
        {label}
      </span>

      <span className="font-garamond text-base font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

export default BookingCreate;