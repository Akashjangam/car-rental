import { Link } from "react-router-dom";
import {
  Car,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();

  const footerLinkClass =
    "font-garamond text-lg text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const contactLinkClass =
    "font-garamond text-lg text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* Main Footer */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="group flex w-fit items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="DriveNow home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary transition group-hover:border-primary">
                <Car
                  className="h-5 w-5"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <span className="font-metal text-2xl tracking-tight text-foreground">
                Drive<span className="text-primary">Now</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm font-garamond text-lg leading-7 text-muted-foreground">
              A simple way to find the right car for every journey.
              Reliable vehicles, flexible rentals, and a smoother way
              to travel.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-metal text-xl text-foreground">
              Explore
            </h3>

            <ul className="mt-6 space-y-3.5">
              <li>
                <Link to="/" className={footerLinkClass}>
                  Home
                </Link>
              </li>

              <li>
                <Link to="/cars" className={footerLinkClass}>
                  Browse Cars
                </Link>
              </li>

              <li>
                <Link to="/about" className={footerLinkClass}>
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className={footerLinkClass}
                >
                  How It Works
                </Link>
              </li>

              {!loading && user && (
                <li>
                  <Link
                    to="/saved-cars"
                    className={footerLinkClass}
                  >
                    Saved Cars
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-metal text-xl text-foreground">
              Services
            </h3>

            <ul className="mt-6 space-y-3.5">
              <li>
                <Link to="/cars" className={footerLinkClass}>
                  Car Rental
                </Link>
              </li>

              {!loading && user && (
                <li>
                  <Link
                    to="/my-bookings"
                    className={footerLinkClass}
                  >
                    My Bookings
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/how-it-works"
                  className={footerLinkClass}
                >
                  Rental Guide
                </Link>
              </li>

              {!loading && user?.role === "dealer" && (
                <li>
                  <Link
                    to="/dealer/cars"
                    className={footerLinkClass}
                  >
                    Dealer Dashboard
                  </Link>
                </li>
              )}

              {!loading && user?.role === "admin" && (
                <li>
                  <Link
                    to="/admin"
                    className={footerLinkClass}
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-metal text-xl text-foreground">
              Contact
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin
                  className="mt-1 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                <p className="font-garamond text-lg leading-6 text-muted-foreground">
                  Hyderabad, Telangana,
                  <br />
                  India
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                  className="h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                <a
                  href="tel:+919848256694"
                  className={contactLinkClass}
                >
                  +91 9848256694
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  className="h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                <a
                  href="mailto:support@drivenow.com"
                  className={`${contactLinkClass} break-all`}
                >
                  support@drivenow.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-border" />

        {/* Bottom */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-garamond text-base text-muted-foreground">
            © {currentYear} DriveNow. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-garamond text-base text-muted-foreground">
              Privacy Policy
            </span>

            <span className="font-garamond text-base text-muted-foreground">
              Terms & Conditions
            </span>

            <a
              href="mailto:support@drivenow.com"
              className="inline-flex items-center gap-1 font-garamond text-base text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Support

              <ArrowUpRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;