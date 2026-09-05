import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, ImagePlus, Loader2, Save, Upload } from "lucide-react";

import { getDealerCarById, updateDealerCar } from "../../services/adminApi";

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    fuelType: "Petrol",
    transmission: "Manual",
    seats: "",
    available: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    return `${API_ORIGIN}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  useEffect(() => {
    const fetchCar = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getDealerCarById(id, token);

        const carData =
          response?.car || response?.data?.car || response?.data || response;

        if (!carData) {
          throw new Error("Car details could not be found.");
        }

        setCar(carData);

        setFormData({
          brand: carData.brand || "",
          model: carData.model || "",
          year: carData.year || "",
          pricePerDay: carData.pricePerDay || "",
          fuelType: carData.fuelType || "Petrol",
          transmission: carData.transmission || "Manual",
          seats: carData.seats || "",
          available: carData.available !== false,
        });

        if (carData.image) {
          setExistingImage(getImageUrl(carData.image));
        }
      } catch (err) {
        console.error("Fetch dealer car error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (err.response?.status === 403) {
          setError("You do not have permission to edit this car.");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load car details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(selectedFile);

    setImage(selectedFile);
    setPreview(imagePreview);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const brand = formData.brand.trim();
    const model = formData.model.trim();
    const year = Number(formData.year);
    const pricePerDay = Number(formData.pricePerDay);
    const seats = Number(formData.seats);

    if (!brand) {
      return "Brand is required.";
    }

    if (!model) {
      return "Model is required.";
    }

    if (!formData.year || !Number.isInteger(year)) {
      return "Please enter a valid manufacturing year.";
    }

    if (year < 1900 || year > new Date().getFullYear() + 1) {
      return "Please enter a valid manufacturing year.";
    }

    if (!formData.pricePerDay || !Number.isFinite(pricePerDay)) {
      return "Please enter a valid price per day.";
    }

    if (pricePerDay <= 0) {
      return "Price per day must be greater than 0.";
    }

    if (!formData.seats || !Number.isInteger(seats)) {
      return "Please enter a valid number of seats.";
    }

    if (seats <= 0 || seats > 50) {
      return "Seats must be between 1 and 50.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = new FormData();

      data.append("brand", formData.brand.trim());
      data.append("model", formData.model.trim());
      data.append("year", String(Number(formData.year)));
      data.append("pricePerDay", String(Number(formData.pricePerDay)));
      data.append("fuelType", formData.fuelType);
      data.append("transmission", formData.transmission);
      data.append("seats", String(Number(formData.seats)));
      data.append("available", String(formData.available));

      if (image) {
        data.append("image", image);
      }

      await updateDealerCar(id, data, token);

      setSuccess("Car updated successfully.");

      setTimeout(() => {
        navigate("/dealer/cars");
      }, 1000);
    } catch (err) {
      console.error("Update dealer car error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have permission to update this car.");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to update the car. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div
            className="animate-pulse space-y-6"
            aria-label="Loading car details"
          >
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-5 w-72 rounded bg-muted" />
            <div className="h-[650px] rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !car) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Car size={26} className="text-destructive" aria-hidden="true" />
          </div>

          <h1 className="font-metal mt-5 text-3xl text-foreground">
            Unable to Load Car
          </h1>

          <p className="font-garamond mt-3 text-sm leading-6 text-muted-foreground">
            {error}
          </p>

          <Link
            to="/dealer/cars"
            className="font-garamond mt-6 inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <ArrowLeft size={17} className="mr-2" />
            Back to My Cars
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <Link
            to="/dealer/cars"
            className="font-garamond inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <ArrowLeft size={17} className="mr-2" />
            Back to My Cars
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Car size={24} className="text-primary" aria-hidden="true" />
            </div>

            <div>
              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Dealer
              </p>

              <h1 className="font-metal text-3xl text-foreground sm:text-4xl">
                Edit Car
              </h1>
            </div>
          </div>

          <p className="font-garamond mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Update the details of your vehicle and keep your DriveNow listing
            accurate.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border p-6 sm:p-8">
            <h2 className="font-metal text-2xl text-foreground">
              Vehicle Information
            </h2>

            <p className="font-garamond mt-1 text-sm text-muted-foreground">
              Update the basic information for this vehicle.
            </p>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="font-garamond rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="font-garamond rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-medium text-primary"
              >
                {success}
              </div>
            )}

            {/* Brand + Model */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="brand"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                  autoComplete="off"
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Model
                </label>

                <input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry"
                  autoComplete="off"
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Year + Price */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="year"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Manufacturing Year
                </label>

                <input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="pricePerDay"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Price Per Day
                </label>

                <div className="relative">
                  <span className="font-garamond pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    ₹
                  </span>

                  <input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="2500"
                    className="font-garamond w-full rounded-lg border border-border bg-background py-3 pl-8 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Fuel + Transmission + Seats */}
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="fuelType"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Fuel Type
                </label>

                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="transmission"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Transmission
                </label>

                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="seats"
                  className="font-garamond mb-2 block text-sm font-medium text-foreground"
                >
                  Seats
                </label>

                <input
                  id="seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.seats}
                  onChange={handleChange}
                  placeholder="5"
                  className="font-garamond w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-xl border border-border bg-background p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                />

                <span>
                  <span className="font-garamond block text-sm font-semibold text-foreground">
                    Car is available for booking
                  </span>

                  <span className="font-garamond mt-1 block text-xs leading-5 text-muted-foreground">
                    Customers can book this vehicle when availability is
                    enabled.
                  </span>
                </span>
              </label>
            </div>

            {/* Image */}
            <div>
              <div className="mb-3">
                <h3 className="font-metal text-sm font-semibold text-foreground">
                  Vehicle Image
                </h3>

                <p className="font-garamond mt-1 text-xs text-muted-foreground">
                  Upload a new image only if you want to replace the current
                  one. Maximum size: 5MB.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Current / New Preview */}
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <div className="flex aspect-video items-center justify-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="New vehicle preview"
                        className="h-full w-full object-cover"
                      />
                    ) : existingImage ? (
                      <img
                        src={existingImage}
                        alt={`${car?.brand || "Vehicle"} ${car?.model || ""}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="font-garamond flex flex-col items-center justify-center text-center text-muted-foreground">
                        <ImagePlus size={32} aria-hidden="true" />

                        <p className="mt-2 text-sm">
                          No vehicle image available
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border px-4 py-3">
                    <p className="font-garamond text-xs font-medium text-muted-foreground">
                      {preview ? "New Image Preview" : "Current Image"}
                    </p>
                  </div>
                </div>

                {/* Upload */}
                <div>
                  <label
                    htmlFor="image"
                    className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background px-6 text-center transition hover:border-primary hover:bg-primary/5 focus-within:border-primary"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload
                        size={22}
                        className="text-primary"
                        aria-hidden="true"
                      />
                    </div>

                    <span className="font-garamond mt-4 text-sm font-semibold text-foreground">
                      Choose a new image
                    </span>

                    <span className="font-garamond mt-1 text-xs text-muted-foreground">
                      JPG, JPEG, PNG or WEBP
                    </span>

                    <span className="font-garamond mt-1 text-xs text-muted-foreground">
                      Maximum 5MB
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
                    <p className="font-garamond mt-2 truncate text-xs text-muted-foreground">
                      Selected: {image.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border p-6 sm:flex-row sm:items-center sm:justify-end sm:p-8">
            <Link
              to="/dealer/cars"
              className="font-garamond inline-flex min-h-10 items-center justify-center rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="font-garamond inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={17} className="mr-2" aria-hidden="true" />
                  Update Car
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditCar;
