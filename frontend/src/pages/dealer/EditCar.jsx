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

import { getDealerCarById, updateDealerCar } from "../../services/adminApi";
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

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [existingImage, setExistingImage] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCar = async () => {
      if (!id) {
        setError("Invalid car ID.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("You are not authorized. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getDealerCarById(id, token);
        const car = response?.car || response?.data?.car || response;

        if (!car) {
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
        console.error("Load dealer car error:", err);

        setError(
          err?.response?.data?.message || err?.message || "Failed to load car.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id, token]);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("You are not authorized. Please login again.");
      return;
    }

    if (
      !formData.brand.trim() ||
      !formData.model.trim() ||
      !formData.year ||
      !formData.pricePerDay ||
      !formData.seats
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(formData.year) < 1900 || Number(formData.year) > 2100) {
      setError("Please enter a valid year.");
      return;
    }

    if (Number(formData.pricePerDay) < 0) {
      setError("Price per day cannot be negative.");
      return;
    }

    if (Number(formData.seats) < 1 || Number(formData.seats) > 20) {
      setError("Seats must be between 1 and 20.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("brand", formData.brand.trim());
      data.append("model", formData.model.trim());
      data.append("year", formData.year);
      data.append("pricePerDay", formData.pricePerDay);
      data.append("fuelType", formData.fuelType);
      data.append("transmission", formData.transmission);
      data.append("seats", formData.seats);
      data.append("available", formData.available ? "true" : "false");

      // Dealer ownership is handled by the backend.
      if (image) {
        data.append("image", image);
      }

      await updateDealerCar(id, data, token);

      setSuccess("Car updated successfully.");

      setTimeout(() => {
        navigate("/dealer/cars");
      }, 900);
    } catch (err) {
      console.error("Update dealer car error:", err);

      setError(
        err?.response?.data?.message || err?.message || "Failed to update car.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          <div
            className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-8 py-7 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="h-7 w-7 animate-spin text-primary"
              aria-hidden="true"
            />

            <div className="text-center">
              <p className="font-metal text-xl tracking-wide text-foreground">
                Loading Car
              </p>

              <p className="mt-1 font-garamond text-sm text-muted-foreground">
                Fetching your vehicle details...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentImage =
    previewUrl ||
    (existingImage
      ? `${API_BASE_URL}${existingImage.startsWith("/") ? "" : "/"}${existingImage}`
      : "");

  return (
    <main className="min-h-[70vh] bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <Link
            to="/dealer/cars"
            className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to My Cars
          </Link>

          <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Car className="h-6 w-6" aria-hidden="true" />
            </div>

            <div>
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Dealer Dashboard
              </p>

              <h1 className="mt-1 font-metal text-3xl tracking-wide text-foreground sm:text-4xl">
                Edit Car
              </h1>

              <p className="mt-2 font-garamond text-base leading-6 text-muted-foreground">
                Update your vehicle details, specifications, image, and
                availability.
              </p>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 font-garamond text-base text-destructive"
          >
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 font-garamond text-base text-foreground"
          >
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />

            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {/* Basic Details */}
            <section className="border-b border-border p-5 sm:p-7">
              <div className="mb-6">
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Step 01
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Basic Details
                </h2>

                <p className="mt-1 font-garamond text-base text-muted-foreground">
                  Update the main information about your vehicle.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormInput
                  id="brand"
                  name="brand"
                  label="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                  required
                />

                <FormInput
                  id="model"
                  name="model"
                  label="Model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                  required
                />

                <FormInput
                  id="year"
                  name="year"
                  label="Year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  required
                />

                <FormInput
                  id="pricePerDay"
                  name="pricePerDay"
                  label="Price Per Day (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  required
                />
              </div>
            </section>

            {/* Specifications */}
            <section className="border-b border-border p-5 sm:p-7">
              <div className="mb-6">
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Step 02
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Specifications
                </h2>

                <p className="mt-1 font-garamond text-base text-muted-foreground">
                  Keep the vehicle specifications accurate.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <FormSelect
                  id="fuelType"
                  name="fuelType"
                  label="Fuel Type"
                  value={formData.fuelType}
                  onChange={handleChange}
                  options={["Petrol", "Diesel", "Electric", "Hybrid"]}
                />

                <FormSelect
                  id="transmission"
                  name="transmission"
                  label="Transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  options={["Manual", "Automatic"]}
                />

                <FormInput
                  id="seats"
                  name="seats"
                  label="Seats"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.seats}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  required
                />
              </div>
            </section>

            {/* Availability */}
            <section className="border-b border-border p-5 sm:p-7">
              <div className="mb-5">
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Step 03
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Availability
                </h2>
              </div>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-muted/40 p-5 transition hover:bg-muted/60">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />

                <div>
                  <p className="font-garamond text-base font-bold text-foreground">
                    Car is available for booking
                  </p>

                  <p className="mt-1 font-garamond text-sm leading-5 text-muted-foreground">
                    Customers can book this vehicle when availability is
                    enabled.
                  </p>
                </div>
              </label>
            </section>

            {/* Image */}
            <section className="border-b border-border p-5 sm:p-7">
              <div className="mb-6">
                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Step 04
                </p>

                <h2 className="mt-1 font-metal text-2xl tracking-wide text-foreground">
                  Car Image
                </h2>

                <p className="mt-1 font-garamond text-base text-muted-foreground">
                  Replace the current vehicle image if needed.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                {/* Preview */}
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={
                        image
                          ? "New car preview"
                          : `${formData.brand} ${formData.model}`
                      }
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-9 w-9" aria-hidden="true" />

                      <span className="font-garamond text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div>
                  <label
                    htmlFor="image"
                    className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center transition hover:border-primary hover:bg-muted/50 focus-within:ring-4 focus-within:ring-primary/20"
                  >
                    <Upload
                      className="mb-3 h-8 w-8 text-primary"
                      aria-hidden="true"
                    />

                    <span className="font-garamond text-base font-bold text-foreground">
                      Choose a new image
                    </span>

                    <span className="mt-1 font-garamond text-sm text-muted-foreground">
                      JPG, JPEG, PNG or WEBP — max 5MB
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
                    <p className="mt-3 truncate font-garamond text-sm text-muted-foreground">
                      Selected: {image.name}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 bg-muted/40 p-5 sm:flex-row sm:justify-end sm:p-7">
              <Link
                to="/dealer/cars"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-6 py-3 font-garamond text-base font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-garamond text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
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

function FormInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-garamond text-base font-semibold text-foreground"
      >
        {label}{" "}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function FormSelect({ id, name, label, value, onChange, options }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-garamond text-base font-semibold text-foreground"
      >
        {label}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EditCar;
