import { CalendarDays, MapPin, Search } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function SearchCars() {
  return (
    <section className="relative z-10 -mt-10 px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Card className="border-slate-200 bg-white shadow-lg">
          <CardContent className="p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Find your perfect ride
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose your location and rental dates
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Pick-up Location
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#30AFFF]"
                  />

                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {/* Start Date */}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#30AFFF]"
                  />

                  <Input
                    id="startDate"
                    type="date"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {/* End Date */}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#30AFFF]"
                  />

                  <Input
                    id="endDate"
                    type="date"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  className="h-11 w-full bg-[#30AFFF] text-white hover:bg-[#239fe5]"
                >
                  <Search size={18} />
                  Search Cars
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default SearchCars;