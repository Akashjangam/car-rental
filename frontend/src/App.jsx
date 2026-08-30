import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import MyBookings from "./pages/MyBookings";
import Payment from "./pages/Payment";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCars from "./pages/AdminCars";
import AdminBookings from "./pages/AdminBookings";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* USER ROUTES */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/cars"
          element={<Cars />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

        {/* ADMIN ROUTES */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/cars"
          element={<AdminCars />}
        />

        <Route
          path="/admin/bookings"
          element={<AdminBookings />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;