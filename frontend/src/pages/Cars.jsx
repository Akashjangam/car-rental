import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CarFront } from "lucide-react";

import { getCars } from "../services/carApi";

function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCars();

      console.log("Cars API response:", data);

      setCars(data.cars || []);
    } catch (err) {
      console.error("Failed to load cars:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load cars. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">
          Loading cars...
        </p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load cars
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchCars}
            className="mt-5 rounded-lg bg-[#30AFFF] px-5 py-3 font-semibold text-white hover:bg-[#2499df]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
            DriveNow
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Available Cars
          </h1>

          <p className="mt-2 text-slate-500">
            Choose the perfect car for your journey.
          </p>
        </div>

        {/* NO CARS */}
        {cars.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
            <CarFront
              size={60}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No cars available
            </h2>

            <p className="mt-2 text-slate-500">
              Please check again later.
            </p>
          </div>
        ) : (
          /* CAR GRID */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {cars.map((car) => (
              <div
                key={car._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* IMAGE */}
                <div className="h-52 bg-slate-100">

                  {car.image ? (
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <CarFront
                        size={70}
                        className="text-[#30AFFF]"
                      />
                    </div>
                  )}

                </div>

                {/* DETAILS */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {car.brand} {car.model}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {car.year}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        car.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {car.available
                        ? "Available"
                        : "Unavailable"}
                    </span>

                  </div>

                  {/* PRICE */}
                  <div className="mt-5">
                    <p className="text-sm text-slate-500">
                      Price per day
                    </p>

                    <p className="text-2xl font-bold text-slate-900">
                      ₹{Number(car.pricePerDay).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* CAR INFO */}
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

                    <div>
                      <p className="text-slate-500">
                        Fuel
                      </p>

                      <p className="font-semibold text-slate-900">
                        {car.fuelType}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Transmission
                      </p>

                      <p className="font-semibold text-slate-900">
                        {car.transmission}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Seats
                      </p>

                      <p className="font-semibold text-slate-900">
                        {car.seats}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        Year
                      </p>

                      <p className="font-semibold text-slate-900">
                        {car.year}
                      </p>
                    </div>

                  </div>

                  {/* VIEW DETAILS */}
                  <Link
                    to={`/cars/${car._id}`}
                    className="mt-6 block rounded-lg bg-[#30AFFF] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#2499df]"
                  >
                    View Details
                  </Link>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default Cars;