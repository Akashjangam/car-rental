import { Link } from "react-router-dom";
import { Car, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* Main Footer */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="group flex w-fit items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary transition group-hover:border-primary">
                <Car className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
              </div>

              <span className="font-metal text-2xl tracking-tight text-foreground">
                Drive<span className="text-primary">Now</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm font-garamond text-lg leading-7 text-muted-foreground">
              A simple way to find the right car for every journey. Reliable
              vehicles, flexible rentals, and a smoother way to travel.
            </p>

            {/* Social */}
            <div className="mt-7 flex gap-2.5">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-garamond text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-garamond text-base font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                f
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-garamond text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                X
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-metal text-xl text-foreground">Explore</h3>

            <ul className="mt-6 space-y-3.5">
              <li>
                <Link
                  to="/"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/cars"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  Browse Cars
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-metal text-xl text-foreground">Services</h3>

            <ul className="mt-6 space-y-3.5">
              <li>
                <Link
                  to="/cars"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  Car Rental
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  Become a Dealer
                </Link>
              </li>

              <li>
                <Link
                  to="/my-bookings"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  My Bookings
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
                >
                  Rental Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-metal text-xl text-foreground">Contact</h3>

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
                  className="font-garamond text-lg text-muted-foreground transition hover:text-primary"
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
                  className="break-all font-garamond text-lg text-muted-foreground transition hover:text-primary"
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

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="#"
              className="font-garamond text-base text-muted-foreground transition hover:text-primary"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="font-garamond text-base text-muted-foreground transition hover:text-primary"
            >
              Terms & Conditions
            </a>

            <a
              href="#"
              className="inline-flex items-center gap-1 font-garamond text-base text-muted-foreground transition hover:text-primary"
            >
              Support
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
