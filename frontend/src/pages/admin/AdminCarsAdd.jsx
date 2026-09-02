import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CarFront, ImagePlus, Loader2, Save } from "lucide-react";

import { createCar } from "../../services/carApi";
import { useAuth } from "../../context/AuthContext";

const AdminCarsAdd = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    available: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // CLEAN IMAGE PREVIEW URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // HANDLE IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImage(null);
      setPreview("");
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImage(null);
      setPreview("");
      setError("Image size must be less than 5MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    if (
      !formData.brand.trim() ||
      !formData.model.trim() ||
      !formData.year ||
      !formData.pricePerDay ||
      !formData.fuelType ||
      !formData.transmission ||
      !formData.seats
    ) {
      setError("Please fill in all required car details.");
      return;
    }

    const year = Number(formData.year);

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError("Please enter a valid car year.");
      return;
    }

    const price = Number(formData.pricePerDay);

    if (!Number.isFinite(price) || price < 0) {
      setError("Price per day cannot be negative.");
      return;
    }

    const seats = Number(formData.seats);

    if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
      setError("Seats must be between 1 and 20.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("brand", formData.brand.trim());
      data.append("model", formData.model.trim());
      data.append("year", String(year));
      data.append("pricePerDay", String(price));
      data.append("fuelType", formData.fuelType);
      data.append("transmission", formData.transmission);
      data.append("seats", String(seats));
      data.append("available", formData.available ? "true" : "false");

      if (image) {
        data.append("image", image);
      }

      await createCar(data, token);

      setSuccess("Car created successfully.");

      setTimeout(() => {
        navigate("/admin/cars");
      }, 800);
    } catch (err) {
      console.error("Create admin car error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create car. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 font-garamond sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/cars")}
            className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Cars
          </button>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CarFront className="h-7 w-7" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  DriveNow Admin
                </p>

                <h1 className="mt-1 font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
                  Add New Car
                </h1>

                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Add a new vehicle to the DriveNow rental fleet.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            FORM
        ====================================================== */}

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {/* Alerts */}

          {error && (
            <div
              className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm font-semibold text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm font-semibold text-primary"
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* =================================================
                CAR INFORMATION
            ================================================== */}

            <section>
              <div className="border-b border-border pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  Vehicle Details
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Car Information
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the basic details of the vehicle.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* BRAND */}

                <div>
                  <label
                    htmlFor="brand"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Brand{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Toyota"
                    autoComplete="off"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* MODEL */}

                <div>
                  <label
                    htmlFor="model"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Model{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. Fortuner"
                    autoComplete="off"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* YEAR */}

                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Year{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g. 2025"
                    min="1900"
                    max="2100"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* PRICE */}

                <div>
                  <label
                    htmlFor="pricePerDay"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Price Per Day (₹){" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    min="0"
                    step="1"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* FUEL */}

                <div>
                  <label
                    htmlFor="fuelType"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Fuel Type{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* TRANSMISSION */}

                <div>
                  <label
                    htmlFor="transmission"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Transmission{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                {/* SEATS */}

                <div>
                  <label
                    htmlFor="seats"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Seats{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="seats"
                    name="seats"
                    type="number"
                    value={formData.seats}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="1"
                    max="20"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                AVAILABILITY
            ================================================== */}

            <section className="mt-10 border-t border-border pt-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Fleet Status
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Availability
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Control whether customers can currently rent this vehicle.
              </p>

              <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:bg-muted/30">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="mt-0.5 h-5 w-5 rounded border-input accent-primary focus:ring-2 focus:ring-primary"
                />

                <span>
                  <span className="block text-sm font-bold text-foreground">
                    Available for rental
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    Customers can book this vehicle when enabled.
                  </span>
                </span>
              </label>
            </section>

            {/* =================================================
                IMAGE
            ================================================== */}

            <section className="mt-10 border-t border-border pt-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Vehicle Media
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Car Image
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload an image of the vehicle. Maximum size: 5MB.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="image"
                  className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
                >
                  {preview ? (
                    <div className="w-full">
                      <img
                        src={preview}
                        alt="Selected car preview"
                        className="mx-auto h-64 w-full rounded-xl object-cover"
                      />

                      <p className="mt-3 text-sm font-semibold text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ImagePlus className="h-7 w-7" aria-hidden="true" />
                      </div>

                      <p className="mt-4 text-base font-bold text-foreground">
                        Click to upload car image
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        PNG, JPG, JPEG or WEBP up to 5MB
                      </p>
                    </>
                  )}

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </section>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/cars")}
                disabled={loading}
                className="min-h-12 rounded-full border border-border bg-background px-6 text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Create Car
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default AdminCarsAdd;
