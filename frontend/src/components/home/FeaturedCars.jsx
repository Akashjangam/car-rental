import { useEffect, useState } from "react";
import { CarFront, Fuel, Users } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import { getCars } from "../../services/carApi";

function FeaturedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars();

        setCars(data.cars || []);
      } catch (error) {
        console.error("Failed to load cars:", error);
        setError("Unable to load cars. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Loading State
  if (loading) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <CarFront
            className="mx-auto mb-3 text-slate-400"
            size={40}
          />

          <h3 className="font-semibold text-slate-900">
            Unable to load cars
          </h3>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
              Our Fleet
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Featured Cars
            </h2>

            <p className="mt-2 text-slate-600">
              Choose from our selection of reliable cars.
            </p>
          </div>

          <Button
            variant="outline"
            className="hidden md:flex"
          >
            View All Cars
          </Button>
        </div>

        {/* Empty State */}
        {cars.length === 0 ? (
          <div className="rounded-lg border border-slate-200 p-10 text-center">
            <CarFront
              className="mx-auto mb-3 text-slate-400"
              size={40}
            />

            <h3 className="font-semibold text-slate-900">
              No cars available
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Please check again later.
            </p>
          </div>
        ) : (
          /* Cars */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.slice(0, 3).map((car) => (
              <Card
                key={car._id}
                className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Car Image */}
                <div className="flex h-52 items-center justify-center bg-[#D8FFC5]">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CarFront
                      size={70}
                      strokeWidth={1.5}
                      className="text-[#30AFFF]"
                    />
                  )}
                </div>

                <CardContent className="p-5">

                  {/* Car Name + Price */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {car.brand} {car.model}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {car.year}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ₹
                        {Number(car.pricePerDay).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        / day
                      </p>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">

                    <div className="flex items-center gap-1.5">
                      <Users size={16} />
                      <span>{car.seats} seats</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Fuel size={16} />
                      <span>{car.fuelType}</span>
                    </div>
                  </div>

                  {/* View Details */}
                  <Button className="mt-5 w-full bg-[#30AFFF] text-white hover:bg-[#239fe5]">
                    View Details
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCars;