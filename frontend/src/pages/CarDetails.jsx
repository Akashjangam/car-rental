import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CarFront,
  Fuel,
  Gauge,
  Users,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API_URL = import.meta.env.VITE_API_URL;

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");

  // =========================
  // FETCH CAR DETAILS
  // =========================
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/cars/${id}`
        );

        console.log("Car response:", response.data);

        setCar(response.data.car);
      } catch (error) {
        console.error("Car details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load car details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // =========================
  // CALCULATE RENTAL DAYS
  // =========================
  const calculateDays = () => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
      end.getTime() - start.getTime();

    const days =
      difference / (1000 * 60 * 60 * 24);

    return days > 0 ? days : 0;
  };

  const days = calculateDays();

  const totalPrice =
    car && days > 0
      ? car.pricePerDay * days
      : 0;

  // =========================
  // HANDLE BOOKING
  // =========================
  const handleBooking = async () => {
    setBookingError("");

    // Check dates
    if (!startDate || !endDate) {
      setBookingError(
        "Please select start date and end date."
      );
      return;
    }

    // Check date order
    if (days <= 0) {
      setBookingError(
        "End date must be after start date."
      );
      return;
    }

    // Check token
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Check car ID
    if (!car?._id) {
      setBookingError(
        "Car information is missing."
      );
      return;
    }

    try {
      setBookingLoading(true);

      // IMPORTANT:
      // Backend expects carId, not car
      const bookingData = {
        carId: car._id,
        startDate: startDate,
        endDate: endDate,
      };

      console.log(
        "Sending booking data:",
        bookingData
      );

      const response = await axios.post(
        `${API_URL}/bookings`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Booking response:",
        response.data
      );

      if (response.data.success) {
        // Go to payment page
        navigate("/payment", {
          state: {
            booking: response.data.booking,
          },
        });
      }
    } catch (error) {
      console.error(
        "Booking creation error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setBookingError(
        error.response?.data?.message ||
          "Unable to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">

          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">

            <div className="h-96 animate-pulse rounded-lg bg-slate-100" />

            <div className="space-y-4">
              <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-40 animate-pulse rounded bg-slate-100" />
            </div>

          </div>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">

        <div className="text-center">

          <CarFront
            size={50}
            className="mx-auto mb-4 text-slate-400"
          />

          <h1 className="text-xl font-semibold text-slate-900">
            Unable to load car
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <Button
            onClick={() => navigate("/cars")}
            className="mt-6 bg-[#30AFFF] text-white hover:bg-[#239fe5]"
          >
            Back to Cars
          </Button>

        </div>

      </main>
    );
  }

  // =========================
  // CAR NOT FOUND
  // =========================
  if (!car) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">

        <div className="text-center">

          <CarFront
            size={50}
            className="mx-auto mb-4 text-slate-400"
          />

          <h1 className="text-xl font-semibold text-slate-900">
            Car not found
          </h1>

          <Button
            onClick={() => navigate("/cars")}
            className="mt-6 bg-[#30AFFF] text-white hover:bg-[#239fe5]"
          >
            Back to Cars
          </Button>

        </div>

      </main>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <main className="min-h-screen bg-white px-4 py-10">

      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          onClick={() => navigate("/cars")}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={18} />
          Back to Cars
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* =========================
              CAR IMAGE
          ========================= */}
          <div>

            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg bg-[#D8FFC5]">

              {car.image ? (
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="h-full min-h-[360px] w-full object-cover"
                />
              ) : (
                <CarFront
                  size={120}
                  strokeWidth={1.2}
                  className="text-[#30AFFF]"
                />
              )}

            </div>

          </div>

          {/* =========================
              CAR DETAILS
          ========================= */}
          <div>

            {/* BRAND */}
            <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
              {car.brand}
            </p>

            {/* MODEL */}
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              {car.model}
            </h1>

            {/* YEAR */}
            <p className="mt-2 text-slate-500">
              {car.year}
            </p>

            {/* PRICE */}
            <div className="mt-6">

              <span className="text-3xl font-bold text-slate-900">
                ₹
                {car.pricePerDay.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span className="ml-2 text-slate-500">
                / day
              </span>

            </div>

            {/* =========================
                CAR FEATURES
            ========================= */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

              {/* SEATS */}
              <Card>
                <CardContent className="flex items-center gap-3 p-4">

                  <Users
                    size={20}
                    className="text-[#30AFFF]"
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Seats
                    </p>

                    <p className="font-medium text-slate-900">
                      {car.seats}
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* FUEL */}
              <Card>
                <CardContent className="flex items-center gap-3 p-4">

                  <Fuel
                    size={20}
                    className="text-[#30AFFF]"
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Fuel
                    </p>

                    <p className="font-medium text-slate-900">
                      {car.fuelType}
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* TRANSMISSION */}
              <Card>
                <CardContent className="flex items-center gap-3 p-4">

                  <Gauge
                    size={20}
                    className="text-[#30AFFF]"
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Transmission
                    </p>

                    <p className="font-medium text-slate-900">
                      {car.transmission || "Automatic"}
                    </p>
                  </div>

                </CardContent>
              </Card>

            </div>

            {/* =========================
                BOOKING CARD
            ========================= */}
            <Card className="mt-8 border-slate-200">

              <CardContent className="p-6">

                <h2 className="text-xl font-semibold text-slate-900">
                  Book this car
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select your rental dates.
                </p>

                {/* DATES */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  {/* START DATE */}
                  <div>

                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Start Date
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) =>
                          setStartDate(e.target.value)
                        }
                        className="pl-10"
                      />

                    </div>

                  </div>

                  {/* END DATE */}
                  <div>

                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      End Date
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) =>
                          setEndDate(e.target.value)
                        }
                        className="pl-10"
                      />

                    </div>

                  </div>

                </div>

                {/* =========================
                    PRICE CALCULATION
                ========================= */}
                {days > 0 && (
                  <div className="mt-6 rounded-lg bg-slate-50 p-4">

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-slate-600">
                        ₹
                        {car.pricePerDay.toLocaleString(
                          "en-IN"
                        )}{" "}
                        × {days} days
                      </span>

                      <span className="font-medium text-slate-900">
                        ₹
                        {totalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="flex items-center text-xl font-bold text-[#30AFFF]">
                        <IndianRupee size={20} />

                        {totalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>
                )}

                {/* =========================
                    BOOKING ERROR
                ========================= */}
                {bookingError && (
                  <p
                    role="alert"
                    className="mt-4 text-sm text-red-600"
                  >
                    {bookingError}
                  </p>
                )}

                {/* =========================
                    BOOK BUTTON
                ========================= */}
                <Button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="mt-6 w-full bg-[#30AFFF] text-white hover:bg-[#239fe5]"
                >
                  {bookingLoading
                    ? "Creating Booking..."
                    : "Continue to Booking"}
                </Button>

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </main>
  );
}

export default CarDetails;