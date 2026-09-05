import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Authentication
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Cars = lazy(() => import("./pages/cars/Cars"));
const CarDetails = lazy(() => import("./pages/cars/CarDetails"));
const SavedCars = lazy(() => import("./pages/cars/SavedCars"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// User Booking
const BookingCreate = lazy(() => import("./pages/booking/BookingCreate"));
const BookingSuccess = lazy(() => import("./pages/booking/BookingSuccess"));
const MyBookings = lazy(() => import("./pages/booking/MyBookings"));

// Payment
const Payment = lazy(() => import("./pages/payment/Payment"));
const PaymentResult = lazy(() => import("./pages/payment/PaymentResult"));

// Dealer
const DealerCars = lazy(() => import("./pages/dealer/DealerCars"));
const AddCar = lazy(() => import("./pages/dealer/AddCar"));
const EditCar = lazy(() => import("./pages/dealer/EditCar"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCars = lazy(() => import("./pages/admin/AdminCars"));
const AdminCarsAdd = lazy(() => import("./pages/admin/AdminCarsAdd"));
const AdminCarsEdit = lazy(() => import("./pages/admin/AdminCarsEdit"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminMemberAdd = lazy(() => import("./pages/admin/AdminMemberAdd"));

const PageLoader = () => (
  <div
    className="flex min-h-[60vh] items-center justify-center px-4"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="text-center">
      <div
        className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />

      <p className="mt-4 font-garamond text-lg text-muted-foreground">
        Loading...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ==================== PUBLIC ==================== */}

          <Route path="/" element={<Home />} />

          <Route path="/cars" element={<Cars />} />

          <Route path="/cars/:id" element={<CarDetails />} />

          <Route path="/about" element={<About />} />

          <Route path="/how-it-works" element={<HowItWorks />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ==================== USER ==================== */}

          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route path="/booking/:carId" element={<BookingCreate />} />

            <Route path="/booking-success" element={<BookingSuccess />} />

            <Route path="/my-bookings" element={<MyBookings />} />

            <Route path="/payment/:bookingId" element={<Payment />} />

            <Route path="/payment-result" element={<PaymentResult />} />

            <Route path="/saved-cars" element={<SavedCars />} />
          </Route>

          {/* ==================== DEALER ==================== */}

          <Route element={<ProtectedRoute allowedRoles={["dealer"]} />}>
            <Route path="/dealer/cars" element={<DealerCars />} />

            <Route path="/dealer/cars/add" element={<AddCar />} />

            <Route path="/dealer/cars/edit/:id" element={<EditCar />} />
          </Route>

          {/* ==================== ADMIN ==================== */}

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/admin/cars" element={<AdminCars />} />

            <Route path="/admin/cars/add" element={<AdminCarsAdd />} />

            <Route path="/admin/cars/edit/:id" element={<AdminCarsEdit />} />

            <Route path="/admin/bookings" element={<AdminBookings />} />

            <Route path="/admin/members" element={<AdminMembers />} />

            <Route path="/admin/members/add" element={<AdminMemberAdd />} />
          </Route>

          {/* ==================== 404 ==================== */}

          <Route
            path="*"
            element={
              <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="text-center">
                  <h1 className="font-metal text-5xl font-bold text-foreground">
                    404
                  </h1>

                  <p className="mt-3 font-garamond text-lg text-muted-foreground">
                    Page not found
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
