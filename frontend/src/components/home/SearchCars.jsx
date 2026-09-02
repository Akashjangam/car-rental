import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays } from "lucide-react";

function SearchCars() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("search", location.trim());
    }

    if (startDate) {
      params.set("startDate", startDate);
    }

    if (endDate) {
      params.set("endDate", endDate);
    }

    navigate(params.toString() ? `/cars?${params.toString()}` : "/cars");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="relative z-10 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Search Card */}
        <div className="rounded-2xl border border-border bg-background p-5 shadow-lg sm:p-6 lg:px-7 lg:py-6">
          {/* Header */}
          <div className="mb-5">
            <h2 className="font-metal text-2xl leading-none text-foreground sm:text-3xl">
              Find Your Perfect Car
            </h2>

            <p className="mt-2 font-garamond text-base text-muted-foreground sm:text-lg">
              Search for a car and choose your rental dates.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSearch}
            className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
          >
            {/* Search */}
            <div className="min-w-0">
              <label
                htmlFor="location"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Search
              </label>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search brand or model"
                  className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Pickup Date */}
            <div className="min-w-0">
              <label
                htmlFor="startDate"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Pickup Date
              </label>

              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;

                    setStartDate(value);

                    if (endDate && value > endDate) {
                      setEndDate("");
                    }
                  }}
                  min={today}
                  className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Return Date */}
            <div className="min-w-0">
              <label
                htmlFor="endDate"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Return Date
              </label>

              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20 lg:w-auto"
              >
                <Search className="h-4 w-4" aria-hidden="true" />

                <span>Search Cars</span>
              </button>
            </div>
          </form>

          {/* Note */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />

            <span className="font-garamond text-sm">
              Find cars available for your journey
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchCars;
