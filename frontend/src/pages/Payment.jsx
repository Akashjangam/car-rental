import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Smartphone,
} from "lucide-react";

import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // NO BOOKING
  // =====================================================

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CreditCard
              size={48}
              className="mx-auto mb-4 text-slate-400"
            />

            <h1 className="text-xl font-semibold text-slate-900">
              No booking found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please create a booking before making a payment.
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

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async () => {
    setError("");

    // Validate UPI
    if (paymentMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID.");
      return;
    }

    // Validate card
    if (paymentMethod === "card") {
      if (!cardNumber.trim()) {
        setError("Please enter your card number.");
        return;
      }

      if (!expiry.trim()) {
        setError("Please enter card expiry.");
        return;
      }

      if (!cvv.trim()) {
        setError("Please enter CVV.");
        return;
      }
    }

    // Check booking ID
    if (!booking._id) {
      setError("Booking ID is missing.");
      return;
    }

    // Check token
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // DEMO PAYMENT PROCESS
      // -------------------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      // -------------------------------------------------
      // CONFIRM BOOKING PAYMENT IN BACKEND
      // -------------------------------------------------

      const response = await axios.put(
        `${API_URL}/bookings/confirm-payment`,
        {
          bookingId: booking._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Payment confirmation:",
        response.data
      );

      // -------------------------------------------------
      // GET UPDATED BOOKING
      // -------------------------------------------------

      const confirmedBooking =
        response.data.booking;

      // -------------------------------------------------
      // GO TO SUCCESS PAGE
      // -------------------------------------------------

      navigate("/booking-success", {
        state: {
          booking: confirmedBooking,
          paymentMethod,
          paymentStatus: "Paid",
        },
      });
    } catch (error) {
      console.error("Payment error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Payment failed. Please try again."
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the server. Please check your backend."
        );
      } else {
        setError(
          "Payment failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Complete Payment
          </h1>

          <p className="mt-2 text-slate-500">
            Review your booking and choose a payment method.
          </p>
        </div>

        {/* CONTENT */}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* PAYMENT */}

          <div className="lg:col-span-2">
            <Card>

              <CardHeader>
                <CardTitle>
                  Payment Method
                </CardTitle>
              </CardHeader>

              <CardContent>

                {/* PAYMENT OPTIONS */}

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* UPI */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("upi")
                    }
                    className={`rounded-lg border p-4 text-left transition ${
                      paymentMethod === "upi"
                        ? "border-[#30AFFF] bg-[#30AFFF]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Smartphone
                      size={24}
                      className="text-[#30AFFF]"
                    />

                    <p className="mt-3 font-semibold text-slate-900">
                      UPI
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Pay using Google Pay, PhonePe or Paytm
                    </p>
                  </button>

                  {/* CARD */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("card")
                    }
                    className={`rounded-lg border p-4 text-left transition ${
                      paymentMethod === "card"
                        ? "border-[#30AFFF] bg-[#30AFFF]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard
                      size={24}
                      className="text-[#30AFFF]"
                    />

                    <p className="mt-3 font-semibold text-slate-900">
                      Card
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Pay using credit or debit card
                    </p>
                  </button>
                </div>

                {/* UPI FORM */}

                {paymentMethod === "upi" && (
                  <div className="mt-6">
                    <label
                      htmlFor="upiId"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      UPI ID
                    </label>

                    <Input
                      id="upiId"
                      type="text"
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(e) =>
                        setUpiId(e.target.value)
                      }
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Example: yourname@oksbi
                    </p>
                  </div>
                )}

                {/* CARD FORM */}

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">

                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Card Number
                      </label>

                      <Input
                        id="cardNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <label
                          htmlFor="expiry"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Expiry
                        </label>

                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cvv"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          CVV
                        </label>

                        <Input
                          id="cvv"
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value)
                          }
                        />
                      </div>

                    </div>
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <p
                    role="alert"
                    className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </p>
                )}

                {/* PAY BUTTON */}

                <Button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="mt-6 w-full bg-[#30AFFF] text-white hover:bg-[#239fe5]"
                >
                  {loading
                    ? "Processing Payment..."
                    : `Pay ₹${Number(
                        booking.totalPrice || 0
                      ).toLocaleString("en-IN")}`}
                </Button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  This is a demo payment flow.
                </p>

              </CardContent>
            </Card>
          </div>

          {/* BOOKING SUMMARY */}

          <div>
            <Card>

              <CardHeader>
                <CardTitle>
                  Booking Summary
                </CardTitle>
              </CardHeader>

              <CardContent>

                {/* CAR */}

                <div className="flex gap-4">

                  <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#D8FFC5]">

                    {car?.image ? (
                      <img
                        src={car.image}
                        alt={`${car.brand || ""} ${
                          car.model || ""
                        }`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CarFront
                        size={35}
                        className="text-[#30AFFF]"
                      />
                    )}

                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {car?.brand || "Your"}{" "}
                      {car?.model || "Car"}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {car?.pricePerDay
                        ? `₹${Number(
                            car.pricePerDay
                          ).toLocaleString(
                            "en-IN"
                          )} / day`
                        : "Rental car"}
                    </p>
                  </div>

                </div>

                {/* DATES */}

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Start Date
                    </span>

                    <span className="font-medium text-slate-900">
                      {new Date(
                        booking.startDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      End Date
                    </span>

                    <span className="font-medium text-slate-900">
                      {new Date(
                        booking.endDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                </div>

                {/* STATUS */}

                <div className="mt-5 flex justify-between border-t border-slate-100 pt-5 text-sm">
                  <span className="text-slate-500">
                    Booking Status
                  </span>

                  <span className="font-semibold text-yellow-600">
                    {booking.status || "Pending"}
                  </span>
                </div>

                {/* TOTAL */}

                <div className="mt-6 border-t border-slate-200 pt-5">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-slate-900">
                      Total Amount
                    </span>

                    <span className="flex items-center text-xl font-bold text-[#30AFFF]">

                      <IndianRupee size={18} />

                      {Number(
                        booking.totalPrice || 0
                      ).toLocaleString("en-IN")}

                    </span>

                  </div>

                </div>

              </CardContent>
            </Card>

            {/* SECURITY */}

            <div className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">

              <CheckCircle
                size={20}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your booking details are protected.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Payment;