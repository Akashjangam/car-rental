import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CarFront,
  UserRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  Heart,
  Sun,
  Moon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const isDealer = user?.role === "dealer";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const isSectionActive = (path) => location.pathname.startsWith(path);

  const navLinkClass = (path) =>
    `relative flex items-center py-2 font-garamond text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      isActive(path)
        ? "text-primary"
        : "text-foreground/75 hover:text-foreground"
    }`;

  const roleLinkClass = (active) =>
    `flex items-center gap-1.5 rounded-md font-garamond text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      active ? "text-primary" : "text-foreground/75 hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobile}
          className="group flex shrink-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="DriveNow home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary transition group-hover:border-primary">
            <CarFront
              className="h-[19px] w-[19px]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <span className="font-metal text-[23px] leading-none tracking-tight text-foreground">
            Drive<span className="text-primary">Now</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex lg:gap-10"
          aria-label="Main navigation"
        >
          <Link to="/" className={navLinkClass("/")}>
            Home
            {isActive("/") && (
              <span
                className="absolute -bottom-1 left-0 h-px w-full bg-primary"
                aria-hidden="true"
              />
            )}
          </Link>

          <Link to="/cars" className={navLinkClass("/cars")}>
            Cars
            {isActive("/cars") && (
              <span
                className="absolute -bottom-1 left-0 h-px w-full bg-primary"
                aria-hidden="true"
              />
            )}
          </Link>

          <Link to="/about" className={navLinkClass("/about")}>
            About
            {isActive("/about") && (
              <span
                className="absolute -bottom-1 left-0 h-px w-full bg-primary"
                aria-hidden="true"
              />
            )}
          </Link>

          <Link to="/how-it-works" className={navLinkClass("/how-it-works")}>
            How It Works
            {isActive("/how-it-works") && (
              <span
                className="absolute -bottom-1 left-0 h-px w-full bg-primary"
                aria-hidden="true"
              />
            )}
          </Link>

          {/* Dealer Navigation */}
          {isDealer && (
            <>
              <Link
                to="/dealer/cars"
                className={roleLinkClass(isSectionActive("/dealer"))}
              >
                <CarFront className="h-4 w-4" aria-hidden="true" />
                My Cars
              </Link>

              <Link
                to="/dealer/cars/add"
                className={roleLinkClass(
                  location.pathname === "/dealer/cars/add",
                )}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Car
              </Link>
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <Link
              to="/admin"
              className={roleLinkClass(isSectionActive("/admin"))}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <Sun
                className="h-[17px] w-[17px]"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            ) : (
              <Moon
                className="h-[17px] w-[17px]"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            )}
          </button>

          {!loading && user ? (
            <>
              {/* Saved Cars */}
              <Link
                to="/saved-cars"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive("/saved-cars")
                    ? "border-primary text-primary"
                    : "text-foreground/70 hover:border-primary hover:text-primary"
                }`}
                aria-label="Saved cars"
                title="Saved cars"
              >
                <Heart
                  className="h-[17px] w-[17px]"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </Link>

              {/* User */}
              <div className="flex items-center gap-3 border-l border-border pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound
                    className="h-[17px] w-[17px]"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </div>

                <div className="hidden leading-tight lg:block">
                  <p className="max-w-[120px] truncate font-garamond text-base font-semibold text-foreground">
                    {user.name || "User"}
                  </p>

                  <p className="font-garamond text-xs capitalize text-muted-foreground">
                    {user.role === "user" ? "Customer" : user.role}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 flex h-10 items-center gap-2 rounded-full border border-border px-4 font-garamond text-sm font-semibold text-foreground/70 transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <LogOut
                  className="h-3.5 w-3.5"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-5 py-2.5 font-garamond text-base text-foreground/80 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-primary px-6 py-2.5 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-background md:hidden"
        >
          <div className="mx-auto max-w-[1400px] px-5 py-5 sm:px-8">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {[
                ["/", "Home"],
                ["/cars", "Cars"],
                ["/about", "About"],
                ["/how-it-works", "How It Works"],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobile}
                  className={`block rounded-xl px-4 py-3 font-garamond text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive(path)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Saved Cars */}
              {!loading && user && (
                <Link
                  to="/saved-cars"
                  onClick={closeMobile}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 font-garamond text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive("/saved-cars")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Saved Cars
                </Link>
              )}

              {/* Dealer */}
              {isDealer && (
                <>
                  <Link
                    to="/dealer/cars"
                    onClick={closeMobile}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 font-garamond text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSectionActive("/dealer")
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <CarFront className="h-4 w-4" aria-hidden="true" />
                    My Cars
                  </Link>

                  <Link
                    to="/dealer/cars/add"
                    onClick={closeMobile}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 font-garamond text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      location.pathname === "/dealer/cars/add"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add New Car
                  </Link>
                </>
              )}

              {/* Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 font-garamond text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSectionActive("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Admin Dashboard
                </Link>
              )}
            </nav>

            {/* Mobile User Area */}
            <div className="mt-5 border-t border-border pt-5">
              {!loading && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-garamond text-lg font-semibold text-foreground">
                        {user.name || "User"}
                      </p>

                      <p className="font-garamond text-sm capitalize text-muted-foreground">
                        {user.role === "user" ? "Customer" : user.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 font-garamond text-lg font-semibold text-destructive transition hover:bg-destructive/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="rounded-full border border-border px-4 py-3 text-center font-garamond text-lg text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="rounded-full bg-primary px-4 py-3 text-center font-garamond text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
