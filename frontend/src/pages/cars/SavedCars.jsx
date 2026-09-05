import { Link } from "react-router-dom";
import { Heart, ArrowLeft, CarFront } from "lucide-react";
import { useEffect, useState } from "react";

const SavedCars = () => {
  const [savedCars, setSavedCars] = useState([]);

  useEffect(() => {
    try {
      const storedCars = JSON.parse(localStorage.getItem("savedCars") || "[]");

      setSavedCars(Array.isArray(storedCars) ? storedCars : []);
    } catch (error) {
      console.error("Failed to load saved cars:", error);
      setSavedCars([]);
    }
  }, []);

  const removeSavedCar = (carId) => {
    const updatedCars = savedCars.filter(
      (car) => String(car._id) !== String(carId),
    );

    setSavedCars(updatedCars);
    localStorage.setItem("savedCars", JSON.stringify(updatedCars));
  };

  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    return `${apiUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cars"
            className="mb-5 inline-flex items-center gap-2 font-garamond text-base text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Cars
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden="true"
              />
            </div>

            <div>
              <h1 className="font-metal text-3xl leading-none sm:text-4xl">
                Saved Cars
              </h1>

              <p className="mt-2 font-garamond text-base text-muted-foreground sm:text-lg">
                Your favorite cars are saved here.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {savedCars.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Heart className="h-7 w-7" aria-hidden="true" />
            </div>

            <h2 className="mt-5 font-metal text-2xl text-card-foreground">
              No saved cars yet
            </h2>

            <p className="mx-auto mt-2 max-w-md font-garamond text-base text-muted-foreground">
              When you find a car you like, click the heart icon to save it
              here.
            </p>

            <Link
              to="/cars"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              <CarFront className="h-4 w-4" aria-hidden="true" />
              Browse Cars
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-garamond text-base text-muted-foreground">
                {savedCars.length} {savedCars.length === 1 ? "car" : "cars"}{" "}
                saved
              </p>
            </div>

            {/* Cars Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedCars.map((car) => {
                const imageUrl = getImageUrl(car.image);

                return (
                  <article
                    key={car._id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${car.brand || ""} ${car.model || "Car"}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <CarFront className="h-12 w-12" aria-hidden="true" />
                        </div>
                      )}

                      {/* Remove Favorite */}
                      <button
                        type="button"
                        onClick={() => removeSavedCar(car._id)}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Remove ${car.brand || ""} ${car.model || "car"} from saved cars`}
                        title="Remove from saved cars"
                      >
                        <Heart
                          className="h-5 w-5"
                          fill="currentColor"
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-metal text-xl text-card-foreground">
                            {car.brand} {car.model}
                          </h2>

                          {car.year && (
                            <p className="mt-1 font-garamond text-sm text-muted-foreground">
                              {car.year}
                            </p>
                          )}
                        </div>

                        {car.pricePerDay !== undefined && (
                          <div className="shrink-0 text-right">
                            <p className="font-metal text-lg text-primary">
                              ₹{car.pricePerDay}
                            </p>
                            <p className="font-garamond text-xs text-muted-foreground">
                              / day
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {car.fuelType && (
                          <span className="rounded-full bg-muted px-3 py-1 font-garamond text-xs text-muted-foreground">
                            {car.fuelType}
                          </span>
                        )}

                        {car.transmission && (
                          <span className="rounded-full bg-muted px-3 py-1 font-garamond text-xs text-muted-foreground">
                            {car.transmission}
                          </span>
                        )}

                        {car.seats && (
                          <span className="rounded-full bg-muted px-3 py-1 font-garamond text-xs text-muted-foreground">
                            {car.seats} seats
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/cars/${car._id}`}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      >
                        View Car
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

export default SavedCars;
