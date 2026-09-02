import { Link } from "react-router-dom";
import {
  ArrowRight,
  CarFront,
  Headphones,
  Star,
} from "lucide-react";

import CarHero from "../../assets/CarHero.png";

function Hero() {
  return (
    <>
      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-[600px] grid-cols-1 items-stretch lg:grid-cols-[0.92fr_1.08fr]">

            {/* ==================================================
                LEFT CONTENT
            ================================================== */}

            <div className="relative z-10 flex items-center">
              <div className="w-full py-14 sm:py-16 lg:py-20 lg:pr-10 xl:pr-16">

                {/* Eyebrow */}

                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-primary" />

                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary sm:text-xs">
                    Premium Car Rental
                  </p>
                </div>

                {/* Heading */}

                <h1 className="max-w-[620px] font-metal text-[48px] leading-[0.98] tracking-tight text-foreground sm:text-[58px] lg:text-[62px] xl:text-[70px]">
                  Find the right car
                  <br />
                  for your next
                  <br />
                  <span className="text-primary">journey.</span>
                </h1>

                {/* Description */}

                <p className="mt-7 max-w-[500px] font-garamond text-[20px] leading-[1.45] text-muted-foreground sm:text-[22px]">
                  Choose from a wide range of reliable cars and book your ride
                  quickly, easily, and securely.
                </p>

                {/* Buttons */}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/cars"
                    className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    Browse Cars

                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to="/how-it-works"
                    className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    How It Works

                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="mt-11 border-t border-border pt-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">

                    <StatItem
                      icon={<CarFront />}
                      value="100+"
                      label="Cars Available"
                      border
                    />

                    <StatItem
                      icon={<Headphones />}
                      value="24/7"
                      label="Customer Support"
                      border
                    />

                    <StatItem
                      icon={<Star />}
                      value="4.9/5"
                      label="Customer Rating"
                    />

                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                RIGHT IMAGE
            ================================================== */}

            <div className="relative min-h-[380px] overflow-hidden sm:min-h-[480px] lg:min-h-[600px]">

              {/* Image container */}

              <div className="absolute inset-0 overflow-hidden rounded-t-[80px] sm:rounded-t-[120px] lg:rounded-l-[180px] lg:rounded-tr-none">
                <img
                  src={CarHero}
                  alt="Premium car available for rental"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {/* Image overlay information */}

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">

                <div className="rounded-xl border border-border/60 bg-background/90 px-4 py-3 shadow-lg backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    DriveNow Fleet
                  </p>

                  <p className="mt-1 text-sm font-semibold text-foreground">
                    Premium cars. Better journeys.
                  </p>
                </div>

                <Link
                  to="/cars"
                  aria-label="Explore all cars"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-foreground shadow-lg transition hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  <ArrowRight
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ABOUT SECTION
      ================================================== */}

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

            {/* LEFT */}

            <div>

              {/* Eyebrow */}

              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />

                <p className="font-garamond text-[11px] font-semibold uppercase tracking-[0.22em] text-primary sm:text-xs">
                  About DriveNow
                </p>
              </div>

              {/* Heading */}

              <h2 className="max-w-[650px] font-metal text-[48px] leading-[0.98] tracking-tight text-foreground sm:text-[58px] lg:text-[64px] xl:text-[70px]">
                Simple,
                <br />
                reliable car rental
                <br />
                <span className="text-primary">
                  for every journey.
                </span>
              </h2>

              {/* Description */}

              <p className="mt-7 max-w-[540px] font-garamond text-[20px] leading-[1.45] text-muted-foreground sm:text-[22px]">
                DriveNow makes it easy to discover, reserve, and rent reliable
                vehicles for your next trip.
              </p>

              <p className="mt-5 max-w-[540px] font-garamond text-lg leading-[1.5] text-muted-foreground">
                Our goal is to make the rental experience simple, convenient,
                and secure, so you can focus on the journey ahead.
              </p>

              {/* Button */}

              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  Learn More

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* RIGHT */}

            <div className="relative">
              <div className="border border-border bg-card p-7 shadow-sm sm:p-9 lg:p-10">

                <p className="font-garamond text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Our Purpose
                </p>

                <p className="mt-8 font-metal text-3xl leading-tight text-foreground sm:text-4xl">
                  The right car can make every journey better.
                </p>

                <div className="mt-8 h-px w-full bg-border" />

                <p className="mt-7 font-garamond text-lg leading-relaxed text-muted-foreground">
                  From quick city trips to long-distance adventures, DriveNow
                  connects you with cars that fit your plans, preferences, and
                  budget.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ABOUT FEATURES
      ================================================== */}

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-3">

            <Feature
              number="01"
              title="Wide Selection"
              description="Explore different vehicles and choose the one that fits your journey and budget."
            />

            <Feature
              number="02"
              title="Easy Booking"
              description="Search available cars, select your dates, and complete your reservation with ease."
            />

            <Feature
              number="03"
              title="Secure Payments"
              description="Complete your rental payment securely and keep track of your bookings from one place."
            />

          </div>
        </div>
      </section>

      {/* ==================================================
          BOTTOM STATEMENT
      ================================================== */}

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

          <div className="border-t border-border pt-8">

            <p className="max-w-4xl font-metal text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Your journey starts with the right car.
            </p>

            <p className="mt-5 max-w-2xl font-garamond text-lg leading-relaxed text-muted-foreground">
              Discover a better way to rent, book with confidence, and get on
              the road with DriveNow.
            </p>

          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   STAT ITEM
========================================================= */

function StatItem({
  icon,
  value,
  label,
  border = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        border
          ? "sm:border-r sm:border-border sm:pr-5 lg:pr-7"
          : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        <span
          className="[&>svg]:h-[18px] [&>svg]:w-[18px]"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-foreground">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  number,
  title,
  description,
}) {
  return (
    <article className="border-b border-border p-6 sm:p-8 md:border-b-0 md:border-r md:last:border-r-0 lg:p-10">

      <p className="font-garamond text-sm font-semibold tracking-[0.18em] text-primary">
        {number}
      </p>

      <h3 className="mt-10 font-metal text-3xl leading-tight text-foreground sm:text-4xl">
        {title}
      </h3>

      <p className="mt-4 max-w-sm font-garamond text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>

    </article>
  );
}

export default Hero;