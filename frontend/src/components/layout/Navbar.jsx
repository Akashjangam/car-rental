import { Link, useNavigate } from "react-router-dom";
import { Car, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "admin";

  const closeMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#30AFFF] text-white">
            <Car className="h-5 w-5" />
          </span>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Drive
            <span className="text-[#30AFFF]">
              Now
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-7 md:flex">

          <Link
            to="/"
            className="text-sm font-medium text-slate-700 hover:text-[#30AFFF]"
          >
            Home
          </Link>

          <Link
            to="/cars"
            className="text-sm font-medium text-slate-700 hover:text-[#30AFFF]"
          >
            Cars
          </Link>

          <Link
            to="/how-it-works"
            className="text-sm font-medium text-slate-700 hover:text-[#30AFFF]"
          >
            How It Works
          </Link>

          <Link
            to="/about"
            className="text-sm font-medium text-slate-700 hover:text-[#30AFFF]"
          >
            About
          </Link>

          {isLoggedIn && (
            <Link
              to="/my-bookings"
              className="text-sm font-medium text-slate-700 hover:text-[#30AFFF]"
            >
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-[#30AFFF]"
            >
              Admin
            </Link>
          )}

        </nav>

        {/* Desktop Actions */}

        <div className="hidden items-center gap-3 md:flex">

          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <button className="rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-100">
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button className="rounded-md bg-[#30AFFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#2499df]">
                  Get Started
                </button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-slate-700">
                Hi, {user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen((open) => !open)
          }
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* Mobile Navigation */}

      {mobileOpen && (
        <div className="border-t bg-white md:hidden">

          <nav className="flex flex-col p-4">

            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 hover:bg-slate-50"
            >
              Home
            </Link>

            <Link
              to="/cars"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 hover:bg-slate-50"
            >
              Cars
            </Link>

            <Link
              to="/how-it-works"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 hover:bg-slate-50"
            >
              How It Works
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 hover:bg-slate-50"
            >
              About
            </Link>

            {isLoggedIn && (
              <Link
                to="/my-bookings"
                onClick={closeMenu}
                className="rounded-md px-3 py-3 hover:bg-slate-50"
              >
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="rounded-md px-3 py-3 font-semibold text-[#30AFFF]"
              >
                Admin Dashboard
              </Link>
            )}

            <div className="mt-3 border-t pt-4">

              {!isLoggedIn ? (
                <div className="flex gap-3">

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex-1"
                  >
                    <button className="w-full rounded-md border px-4 py-2">
                      Login
                    </button>
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="flex-1"
                  >
                    <button className="w-full rounded-md bg-[#30AFFF] px-4 py-2 text-white">
                      Register
                    </button>
                  </Link>

                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}

            </div>

          </nav>

        </div>
      )}

    </header>
  );
}

export default Navbar;