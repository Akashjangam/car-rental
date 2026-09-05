import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
} from "lucide-react";

import { createDealerCar } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

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

function AddCar() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      return;
    }

    setImage(file);
  };

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

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

      if (image) {
        data.append("image", image);
      }

      // Dealer is intentionally not sent.
      // Backend assigns the logged-in dealer automatically.
      await createDealerCar(data, token);

      setSuccess("Car added successfully.");

      setTimeout(() => {
        navigate("/dealer/cars");
      }, 900);
    } catch (err) {
      console.error("Create dealer car error:", err);

      setError(
        err?.response?.data?.message || err?.message || "Failed to add car.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-background px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/dealer/cars"
            className="inline-flex min-h-10 items-center gap-2 font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to My Cars
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <Car className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />

                <span className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Dealer
                </span>
              </div>

              <h1 className="mt-3 font-metal text-5xl leading-none text-foreground sm:text-6xl">
                Add New Car
              </h1>

              <p className="mt-3 font-garamond text-lg text-muted-foreground">
                Add a vehicle to your dealership inventory.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 font-garamond text-base text-destructive"
          >
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-success bg-success px-5 py-4 font-garamond text-base text-foreground"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-[28px] border border-border bg-card">
            {/* Basic Details */}
            <section className="border-b border-border p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-garamond text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                    01
                  </p>

                  <h2 className="mt-1 font-metal text-3xl text-foreground">
                    Basic Details
                  </h2>

                  <p className="mt-1 font-garamond text-base text-muted-foreground">
                    Enter the main details of the vehicle.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <FormField
                  id="brand"
                  name="brand"
                  label="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                />

                <FormField
                  id="model"
                  name="model"
                  label="Model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                />

                <FormField
                  id="year"
                  name="year"
                  label="Year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                />

                <FormField
                  id="pricePerDay"
                  name="pricePerDay"
                  label="Price Per Day (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                />
              </div>
            </section>

            {/* Specifications */}
            <section className="border-b border-border p-6 sm:p-8">
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                02
              </p>

              <h2 className="mt-1 font-metal text-3xl text-foreground">
                Specifications
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                <SelectField
                  id="fuelType"
                  name="fuelType"
                  label="Fuel Type"
                  value={formData.fuelType}
                  onChange={handleChange}
                  options={["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]}
                />

                <SelectField
                  id="transmission"
                  name="transmission"
                  label="Transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  options={["Manual", "Automatic"]}
                />

                <FormField
                  id="seats"
                  name="seats"
                  label="Seats"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.seats}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </div>
            </section>

            {/* Availability */}
            <section className="border-b border-border p-6 sm:p-8">
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                03
              </p>

              <h2 className="mt-1 font-metal text-3xl text-foreground">
                Availability
              </h2>

              <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-background p-5 transition hover:border-primary/50">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-input text-primary focus:ring-4 focus:ring-primary/20"
                />

                <span>
                  <span className="block font-garamond text-lg font-semibold text-foreground">
                    Car is available for booking
                  </span>

                  <span className="mt-1 block font-garamond text-base text-muted-foreground">
                    Customers can book this vehicle when enabled.
                  </span>
                </span>
              </label>
            </section>

            {/* Image */}
            <section className="border-b border-border p-6 sm:p-8">
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                04
              </p>

              <h2 className="mt-1 font-metal text-3xl text-foreground">
                Car Image
              </h2>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                    <img
                      src={previewUrl}
                      alt="Selected car preview"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
                    <ImageIcon className="h-10 w-10" aria-hidden="true" />

                    <span className="mt-3 font-garamond text-base">
                      Image preview
                    </span>
                  </div>
                )}

                <label
                  htmlFor="image"
                  className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20"
                >
                  <Upload
                    className="mb-3 h-8 w-8 text-primary"
                    aria-hidden="true"
                  />

                  <span className="font-garamond text-lg font-semibold text-foreground">
                    Upload car image
                  </span>

                  <span className="mt-1 font-garamond text-sm text-muted-foreground">
                    JPG, JPEG, PNG or WEBP
                  </span>

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>

              {image && (
                <p className="mt-3 truncate font-garamond text-sm text-muted-foreground">
                  Selected: {image.name}
                </p>
              )}
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 bg-muted p-6 sm:flex-row sm:justify-end sm:p-8">
              <Link
                to="/dealer/cars"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background px-7 font-garamond text-lg font-semibold text-foreground transition hover:bg-card focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-garamond text-lg font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" aria-hidden="true" />
                    Add Car
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

function FormField({
  id,
  name,
  label,
  type = "text",
  min,
  max,
  step,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-garamond text-base font-semibold text-foreground"
      >
        {label} <span className="text-destructive">*</span>
      </label>

      <input
        id={id}
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="min-h-12 w-full rounded-xl border border-input bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20"
      />
    </div>
  );
}

function SelectField({ id, name, label, value, onChange, options }) {
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
        className="min-h-12 w-full rounded-xl border border-input bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
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

export default AddCar;
