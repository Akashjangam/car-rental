import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  CarFront,
  CalendarDays,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const paymentMethod = location.state?.paymentMethod || "UPI";
  const paymentStatus = location.state?.paymentStatus || "Paid";

  // =========================
  // NO BOOKING
  // =========================

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">

            <CarFront
              size={50}
              className="mx-auto mb-4 text-slate-400"
            />

            <h1 className="text-xl font-bold text-slate-900">
              Booking not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We could not find your booking details.
            </p>

            <Button
              onClick={() => navigate("/cars")}
              className="mt-6 bg-[#30AFFF] text-white hover:bg-[#239fe5]"
            >
              Browse Cars
            </Button>

          </CardContent>
        </Card>
      </main>
    );
  }

  const car = booking.car;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">

      <div className="mx-auto max-w-3xl">

        {/* =========================
            SUCCESS HEADER
        ========================= */}

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">

            <CheckCircle
              size={48}
              className="text-green-600"
            />

          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Booking Confirmed!
          </h1>

          <p className="mt-2 text-slate-500">
            Your car rental booking has been successfully created.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            Payment {paymentStatus}
          </div>

        </div>

        {/* =========================
            BOOKING CARD
        ========================= */}

        <Card className="mt-10 overflow-hidden">

          <CardContent className="p-0">

            {/* CAR */}

            <div className="flex flex-col gap-5 border-b border-slate-200 p-6 sm:flex-row">

              <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#D8FFC5] sm:w-44">

                {car?.image ? (
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CarFront
                    size={60}
                    strokeWidth={1.5}
                    className="text-[#30AFFF]"
                  />
                )}

              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
                  Your Car
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {car?.brand} {car?.model}
                </h2>

                <p className="mt-1 text-slate-500">
                  {car?.year}
                </p>

                <p className="mt-4 text-sm text-slate-500">
                  Booking ID
                </p>

                <p className="break-all font-mono text-sm font-medium text-slate-900">
                  {booking._id}
                </p>

              </div>

            </div>

            {/* BOOKING DETAILS */}

            <div className="grid gap-6 p-6 sm:grid-cols-2">

              {/* START DATE */}

              <div className="flex items-start gap-3">

                <div className="rounded-lg bg-blue-50 p-3">
                  <CalendarDays
                    size={20}
                    className="text-[#30AFFF]"
                  />
                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Start Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {new Date(
                      booking.startDate
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                </div>

              </div>

              {/* END DATE */}

              <div className="flex items-start gap-3">

                <div className="rounded-lg bg-blue-50 p-3">
                  <CalendarDays
                    size={20}
                    className="text-[#30AFFF]"
                  />
                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    End Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {new Date(
                      booking.endDate
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                </div>

              </div>

              {/* PAYMENT */}

              <div>

                <p className="text-sm text-slate-500">
                  Payment Method
                </p>

                <p className="mt-1 font-semibold uppercase text-slate-900">
                  {paymentMethod}
                </p>

              </div>

              {/* STATUS */}

              <div>

                <p className="text-sm text-slate-500">
                  Booking Status
                </p>

                <span className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                  {booking.status || "Pending"}
                </span>

              </div>

            </div>

            {/* TOTAL */}

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-6">

              <div>

                <p className="text-sm text-slate-500">
                  Total Amount
                </p>

                <p className="mt-1 flex items-center text-2xl font-bold text-slate-900">

                  <IndianRupee size={22} />

                  {Number(
                    booking.totalPrice || 0
                  ).toLocaleString("en-IN")}

                </p>

              </div>

              <div className="text-right">

                <p className="text-sm font-medium text-green-600">
                  Payment Successful
                </p>

                <CheckCircle
                  size={24}
                  className="ml-auto mt-2 text-green-600"
                />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* =========================
            BUTTONS
        ========================= */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Button
            onClick={() => navigate("/my-bookings")}
            className="bg-[#30AFFF] text-white hover:bg-[#239fe5]"
          >
            View My Bookings
            <ArrowRight size={18} />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/cars")}
          >
            Browse More Cars
          </Button>

        </div>

      </div>

    </main>
  );
}

export default BookingSuccess;