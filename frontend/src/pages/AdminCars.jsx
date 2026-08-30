import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    fuelType: "Petrol",
    transmission: "Manual",
    seats: "",
    image: "",
    available: true,
  });

  // ========================================
  // FETCH ALL CARS
  // ========================================

  const fetchCars = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/cars`
      );

      console.log("CARS API RESPONSE:", response.data);

      setCars(response.data.cars || []);

    } catch (error) {
      console.error(
        "Failed to load cars:",
        error
      );

      alert("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD CARS WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    fetchCars();
  }, []);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ========================================
  // ADD CAR
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setAdding(true);

      const token =
        localStorage.getItem("token");

      await axios.post(
        `${API_URL}/cars`,
        {
          brand: formData.brand,
          model: formData.model,
          year: Number(formData.year),
          pricePerDay: Number(
            formData.pricePerDay
          ),
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          seats: Number(formData.seats),
          image: formData.image,
          available: formData.available,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Car added successfully!");

      setFormData({
        brand: "",
        model: "",
        year: "",
        pricePerDay: "",
        fuelType: "Petrol",
        transmission: "Manual",
        seats: "",
        image: "",
        available: true,
      });

      // Fetch updated cars
      await fetchCars();

    } catch (error) {
      console.error(
        "Add car error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to add car"
      );
    } finally {
      setAdding(false);
    }
  };

  // ========================================
  // DELETE CAR
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/cars/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Car deleted successfully!");

      await fetchCars();

    } catch (error) {
      console.error(
        "Delete car error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete car"
      );
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="max-w-7xl mx-auto">

        {/* ==================================
            ADD NEW CAR
        ================================== */}

        <div className="bg-white rounded-2xl shadow-sm p-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Add New Car
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Add a new rental car to your fleet.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            {/* BRAND */}

            <div>
              <label className="block font-medium mb-2">
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="BMW"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* MODEL */}

            <div>
              <label className="block font-medium mb-2">
                Model
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="X5"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* YEAR */}

            <div>
              <label className="block font-medium mb-2">
                Year
              </label>

              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2025"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="block font-medium mb-2">
                Price Per Day
              </label>

              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="5000"
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* FUEL */}

            <div>
              <label className="block font-medium mb-2">
                Fuel Type
              </label>

              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              >
                <option value="Petrol">
                  Petrol
                </option>

                <option value="Diesel">
                  Diesel
                </option>

                <option value="Electric">
                  Electric
                </option>

                <option value="Hybrid">
                  Hybrid
                </option>
              </select>
            </div>

            {/* TRANSMISSION */}

            <div>
              <label className="block font-medium mb-2">
                Transmission
              </label>

              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              >
                <option value="Manual">
                  Manual
                </option>

                <option value="Automatic">
                  Automatic
                </option>
              </select>
            </div>

            {/* SEATS */}

            <div>
              <label className="block font-medium mb-2">
                Seats
              </label>

              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                placeholder="5"
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* IMAGE */}

            <div>
              <label className="block font-medium mb-2">
                Image URL
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/car.jpg"
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* IMAGE PREVIEW */}

            {formData.image && (
              <div className="md:col-span-2">

                <p className="text-sm text-slate-500 mb-2">
                  Image Preview
                </p>

                <img
                  src={formData.image}
                  alt="Car preview"
                  className="w-full md:w-96 h-48 object-cover rounded-xl border"
                />

              </div>
            )}

            {/* AVAILABLE */}

            <div className="md:col-span-2 flex items-center gap-3">

              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-5 h-5"
              />

              <label className="font-medium">
                Car is available
              </label>

            </div>

            {/* ADD BUTTON */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={adding}
                className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {adding
                  ? "Adding Car..."
                  : "Add Car"}
              </button>

            </div>

          </form>

        </div>

        {/* ==================================
            ALL CARS
        ================================== */}

        <div className="mt-12">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-3xl font-bold text-slate-900">
                All Cars
              </h2>

              <p className="text-slate-500 mt-1">
                {cars.length} car
                {cars.length !== 1
                  ? "s"
                  : ""}{" "}
                in your fleet
              </p>

            </div>

            <button
              onClick={fetchCars}
              className="bg-white border border-slate-300 px-5 py-2 rounded-lg hover:bg-slate-100"
            >
              Refresh
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="bg-white rounded-xl p-10 text-center">

              <p className="text-slate-500">
                Loading cars...
              </p>

            </div>
          )}

          {/* NO CARS */}

          {!loading && cars.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center">

              <h3 className="text-xl font-semibold">
                No Cars Found
              </h3>

              <p className="text-slate-500 mt-2">
                Add a car using the form above.
              </p>

            </div>
          )}

          {/* CARS */}

          {!loading && cars.length > 0 && (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {cars.map((car) => (

                <div
                  key={car._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >

                  {/* CAR IMAGE */}

                  {car.image ? (

                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-56 object-cover"
                    />

                  ) : (

                    <div className="w-full h-56 bg-slate-200 flex items-center justify-center">

                      <span className="text-slate-500">
                        No Image
                      </span>

                    </div>

                  )}

                  {/* CAR DETAILS */}

                  <div className="p-5">

                    <div className="flex justify-between items-start gap-3">

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {car.brand} {car.model}
                        </h3>

                        <p className="text-slate-500">
                          {car.year}
                        </p>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          car.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {car.available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>

                    {/* CAR INFO */}

                    <div className="grid grid-cols-2 gap-4 mt-5">

                      <div>
                        <p className="text-sm text-slate-500">
                          Price / Day
                        </p>

                        <p className="font-bold text-lg">
                          ₹{car.pricePerDay}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Seats
                        </p>

                        <p className="font-semibold">
                          {car.seats}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Fuel
                        </p>

                        <p className="font-semibold">
                          {car.fuelType}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Transmission
                        </p>

                        <p className="font-semibold">
                          {car.transmission}
                        </p>
                      </div>

                    </div>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        handleDelete(car._id)
                      }
                      className="w-full mt-6 border border-red-300 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50"
                    >
                      Delete Car
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminCars;