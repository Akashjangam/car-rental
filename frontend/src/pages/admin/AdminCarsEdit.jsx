import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
} from "lucide-react";

import { getCarById, updateCar } from "../../services/carApi";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
  brand: "",
  model: "",
  year: "",
  pricePerDay: "",
  fuelType: "Petrol",
  transmission: "Manual",
  seats: "",
  available: true,
};

function AdminCarsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [existingImage, setExistingImage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD CAR
  // =========================================================

  useEffect(() => {
    const loadCar = async () => {
      if (!id) {
        setError("Car ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getCarById(id);

        const car =
          response?.car || response?.data?.car || response?.data || response;

        if (!car || !car._id) {
          throw new Error("Car not found.");
        }

        setFormData({
          brand: car.brand || "",
          model: car.model || "",
          year: car.year || "",
          pricePerDay: car.pricePerDay || "",
          fuelType: car.fuelType || "Petrol",
          transmission: car.transmission || "Manual",
          seats: car.seats || "",
          available: car.available !== false,
        });

        setExistingImage(car.image || "");
      } catch (err) {
        console.error("Load car error:", err);

        setError(
          err?.response?.data?.message || err?.message || "Failed to load car.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  // =========================================================
  // IMAGE PREVIEW
  // =========================================================

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);

    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

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
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, JPEG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSuccess("");
    setImage(selectedFile);
  };

  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("You are not authorized. Please login again.");
      return;
    }

    if (!formData.brand.trim()) {
      setError("Brand is required.");
      return;
    }

    if (!formData.model.trim()) {
      setError("Model is required.");
      return;
    }

    if (!formData.year) {
      setError("Year is required.");
      return;
    }

    if (!formData.pricePerDay) {
      setError("Price per day is required.");
      return;
    }

    if (!formData.seats) {
      setError("Number of seats is required.");
      return;
    }

    const year = Number(formData.year);

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError("Please enter a valid year.");
      return;
    }

    const price = Number(formData.pricePerDay);

    if (!Number.isFinite(price) || price < 0) {
      setError("Price cannot be negative.");
      return;
    }

    const seats = Number(formData.seats);

    if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
      setError("Seats must be between 1 and 20.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("brand", formData.brand.trim());
      data.append("model", formData.model.trim());
      data.append("year", String(year));
      data.append("pricePerDay", String(price));
      data.append("fuelType", formData.fuelType);
      data.append("transmission", formData.transmission);
      data.append("seats", String(seats));
      data.append("available", formData.available ? "true" : "false");

      // Dealer is intentionally not sent.
      // Backend preserves the existing dealer.
      if (image) {
        data.append("image", image);
      }

      await updateCar(id, data, token);

      setSuccess("Car updated successfully.");

      setTimeout(() => {
        navigate("/admin/cars");
      }, 900);
    } catch (err) {
      console.error("Update car error:", err);

      setError(
        err?.response?.data?.message || err?.message || "Failed to update car.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 font-garamond">
        <div
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2
            className="h-5 w-5 animate-spin text-primary"
            aria-hidden="true"
          />

          <span className="text-sm font-semibold text-muted-foreground">
            Loading car...
          </span>
        </div>
      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-background px-4 py-8 font-garamond sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">
          <Link
            to="/admin/cars"
            className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Cars
          </Link>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Car className="h-7 w-7" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  DriveNow Admin
                </p>

                <h1 className="mt-1 font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
                  Edit Car
                </h1>

                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Update the vehicle details, image and availability.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm font-semibold text-destructive"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-4 text-sm font-semibold text-primary"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />

            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {/* =================================================
                BASIC DETAILS
            ================================================== */}

            <section className="border-b border-border p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Vehicle Details
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the main details of this vehicle.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    placeholder="e.g. Camry"
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
                    min="1900"
                    max="2100"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g. 2024"
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
                    min="0"
                    step="0.01"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                SPECIFICATIONS
            ================================================== */}

            <section className="border-b border-border p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Vehicle Configuration
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Specifications
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {/* FUEL */}

                <div>
                  <label
                    htmlFor="fuelType"
                    className="mb-2 block text-sm font-bold text-foreground"
                  >
                    Fuel Type
                  </label>

                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
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
                    Transmission
                  </label>

                  <select
                    id="transmission"
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
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
                    min="1"
                    max="20"
                    value={formData.seats}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                AVAILABILITY
            ================================================== */}

            <section className="border-b border-border p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Fleet Status
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Availability
              </h2>

              <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:bg-muted/30">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="mt-0.5 h-5 w-5 rounded border-input accent-primary focus:ring-2 focus:ring-primary"
                />

                <div>
                  <p className="text-sm font-bold text-foreground">
                    Car is available for booking
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Customers can book this vehicle when enabled.
                  </p>
                </div>
              </label>
            </section>

            {/* =================================================
                IMAGE
            ================================================== */}

            <section className="border-b border-border p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                Vehicle Media
              </p>

              <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                Car Image
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Replace the current image with a new vehicle photo.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
                {/* IMAGE PREVIEW */}

                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="New car preview"
                      className="h-52 w-full object-cover"
                    />
                  ) : existingImage ? (
                    <img
                      src={getImageUrl(existingImage)}
                      alt={`${formData.brand} ${formData.model}`}
                      className="h-52 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/car-placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-9 w-9" aria-hidden="true" />

                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                </div>

                {/* UPLOAD */}

                <div className="flex flex-col justify-center">
                  <label
                    htmlFor="image"
                    className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="h-6 w-6" aria-hidden="true" />
                    </div>

                    <span className="mt-4 text-base font-bold text-foreground">
                      Choose a new image
                    </span>

                    <span className="mt-1 text-sm text-muted-foreground">
                      JPG, JPEG, PNG or WEBP up to 5MB
                    </span>

                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>

                  {image && (
                    <p className="mt-3 truncate text-sm text-muted-foreground">
                      Selected: {image.name}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 bg-muted/30 p-5 sm:flex-row sm:justify-end sm:p-7">
              <Link
                to="/admin/cars"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-bold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Update Car
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminCarsEdit;
