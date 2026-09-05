import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays, ArrowRight } from "lucide-react";

function SearchCars() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    // Prevent invalid date range
    if (startDate && endDate && endDate < startDate) {
      return;
    }

    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (startDate) {
      params.set("startDate", startDate);
    }

    if (endDate) {
      params.set("endDate", endDate);
    }

    navigate(`/cars?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8"
      aria-labelledby="search-cars-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
          <div className="mb-5">
            <p className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Find your ride
            </p>

            <h2
              id="search-cars-heading"
              className="mt-1 font-metal text-2xl font-bold text-card-foreground sm:text-3xl"
            >
              Search Cars
            </h2>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto]"
          >
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block font-garamond text-sm font-semibold text-card-foreground"
              >
                Location
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter pickup location"
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 font-garamond text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label
                htmlFor="start-date"
                className="mb-2 block font-garamond text-sm font-semibold text-card-foreground"
              >
                Pickup Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={19}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);

                    if (endDate && value > endDate) {
                      setEndDate("");
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 font-garamond text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="end-date"
                className="mb-2 block font-garamond text-sm font-semibold text-card-foreground"
              >
                Return Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={19}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 font-garamond text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-garamond text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 lg:w-auto"
              >
                <Search size={18} aria-hidden="true" />

                <span>Search Cars</span>

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </form>

          {/* Invalid date message */}
          {startDate && endDate && endDate < startDate && (
            <p
              className="mt-3 font-garamond text-sm font-semibold text-destructive"
              role="alert"
            >
              Return date must be after the pickup date.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default SearchCars;
