import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";

import Hero from "../components/home/Hero";
import SearchCars from "../components/home/SearchCars";
import FeaturedCars from "../components/home/FeaturedCars";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";

function Home() {
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;

  const [showAlert, setShowAlert] = useState(Boolean(registrationSuccess));

  useEffect(() => {
    if (!registrationSuccess) return;

    setShowAlert(true);

    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [registrationSuccess]);

  return (
    <main>
      {/* Registration Success Alert */}
      {showAlert && registrationSuccess && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-md rounded-xl border border-primary/20 bg-background p-4 shadow-lg sm:right-6 sm:top-24"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <p className="flex-1 font-garamond text-base font-semibold text-foreground">
              {registrationSuccess}
            </p>

            <button
              type="button"
              onClick={() => setShowAlert(false)}
              aria-label="Close notification"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <Hero />

      <SearchCars />

      <FeaturedCars />

      <HowItWorks />

      <Testimonials />
    </main>
  );
}

export default Home;