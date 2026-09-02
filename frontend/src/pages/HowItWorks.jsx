import { Search, CalendarDays, Car, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Choose a Car",
    description:
      "Browse our wide selection of cars and find the one that fits your needs.",
  },
  {
    icon: CalendarDays,
    number: "02",
    title: "Select Your Dates",
    description:
      "Choose your pickup and return dates to check the rental availability.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Make Payment",
    description:
      "Confirm your booking and make a secure payment through our payment system.",
  },
  {
    icon: Car,
    number: "04",
    title: "Enjoy Your Ride",
    description:
      "Pick up your car and enjoy a comfortable and hassle-free journey.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-primary" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Simple Process
            </p>

            <span className="h-px w-7 bg-primary" />
          </div>

          <h2 className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
            How It Works
          </h2>

          <p className="mt-4 font-garamond text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Renting a car with DriveNow is simple, fast, and convenient.
          </p>
        </div>

        {/* ==================================================
            STEPS
        ================================================== */}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Number */}

                <span className="absolute right-5 top-5 font-metal text-3xl leading-none text-muted-foreground/20">
                  {step.number}
                </span>

                {/* Icon */}

                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted text-primary transition duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                {/* Content */}

                <h3 className="mt-6 font-metal text-2xl leading-tight text-card-foreground">
                  {step.title}
                </h3>

                <p className="mt-3 font-garamond text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {step.description}
                </p>

                {/* Bottom accent */}

                <div className="mt-6 h-px w-8 bg-primary transition-all duration-300 group-hover:w-14" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
