import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public Pages
import Home from "./pages/Home";
import Cars from "./pages/cars/Cars";
import CarDetails from "./pages/cars/CarDetails";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// User Booking
import BookingCreate from "./pages/booking/BookingCreate";
import BookingSuccess from "./pages/booking/BookingSuccess";
import MyBookings from "./pages/booking/MyBookings";

// Payment
import Payment from "./pages/payment/Payment";
import PaymentResult from "./pages/payment/PaymentResult";

// Dealer
import DealerCars from "./pages/dealer/DealerCars";
import AddCar from "./pages/dealer/AddCar";
import EditCar from "./pages/dealer/EditCar";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminCarsAdd from "./pages/admin/AdminCarsAdd";
import AdminCarsEdit from "./pages/admin/AdminCarsEdit";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMemberAdd from "./pages/admin/AdminMemberAdd";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          {/* ==================== PUBLIC ==================== */}

          <Route path="/" element={<Home />} />

          <Route path="/cars" element={<Cars />} />

          <Route path="/cars/:id" element={<CarDetails />} />

          <Route path="/about" element={<About />} />

          <Route path="/how-it-works" element={<HowItWorks />} />

          {/* ==================== AUTH ==================== */}

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* ==================== USER BOOKING ==================== */}

          <Route path="/booking/:carId" element={<BookingCreate />} />

          <Route path="/booking-success" element={<BookingSuccess />} />

          <Route path="/my-bookings" element={<MyBookings />} />

          {/* ==================== PAYMENT ==================== */}

          <Route path="/payment/:bookingId" element={<Payment />} />

          <Route path="/payment-result" element={<PaymentResult />} />

          {/* ==================== DEALER ==================== */}

          <Route path="/dealer/cars" element={<DealerCars />} />

          <Route path="/dealer/cars/add" element={<AddCar />} />

          <Route path="/dealer/cars/edit/:id" element={<EditCar />} />

          {/* ==================== ADMIN ==================== */}

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/cars" element={<AdminCars />} />

          <Route path="/admin/cars/add" element={<AdminCarsAdd />} />

          <Route path="/admin/cars/edit/:id" element={<AdminCarsEdit />} />

          <Route path="/admin/bookings" element={<AdminBookings />} />

          <Route path="/admin/members" element={<AdminMembers />} />

          <Route path="/admin/members/add" element={<AdminMemberAdd />} />

          {/* ==================== 404 ==================== */}

          <Route
            path="*"
            element={
              <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-slate-900">404</h1>

                  <p className="mt-3 text-slate-500">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
