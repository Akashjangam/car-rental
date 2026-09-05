import { useEffect, useState } from "react";
import { ArrowRight, Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";

import Car from "../../assets/Car.png";
import { getAllReviews } from "../../services/reviewApi";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllReviews();

        const reviewData = Array.isArray(response?.reviews)
          ? response.reviews
          : [];

        if (isMounted) {
          setReviews(reviewData.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message || "Unable to load customer reviews.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const getInitials = (name) => {
    if (!name) {
      return "DC";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <section className="bg-background px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary" />

            <p className="font-garamond text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              What Our Customers Say
            </p>

            <span className="h-px w-8 bg-primary" />
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
              Customer Testimonials
            </h2>

            <Link
              to="/cars"
              className="group inline-flex items-center gap-2 font-garamond text-sm font-semibold text-primary transition hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View All Cars
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* =====================================================
            LOADING STATE
        ====================================================== */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                aria-hidden="true"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className="h-4 w-4 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>

                {/* Review */}
                <div className="mt-5 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>

                {/* Customer */}
                <div className="mt-7 flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />

                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR STATE
        ====================================================== */}
        {!loading && error && (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center"
            role="alert"
          >
            <h3 className="font-metal text-2xl text-foreground">
              Unable to load reviews
            </h3>

            <p className="mt-2 font-garamond text-base text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}
        {!loading && !error && reviews.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Quote className="h-6 w-6" aria-hidden="true" />
            </div>

            <h3 className="mt-5 font-metal text-2xl text-card-foreground">
              No reviews yet
            </h3>

            <p className="mt-2 font-garamond text-lg text-muted-foreground">
              Customer reviews will appear here after completed rentals.
            </p>
          </div>
        )}

        {/* =====================================================
            REVIEW CARDS
        ====================================================== */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => {
              const customerName = review?.user?.name || "DriveNow Customer";

              const rating = Math.min(
                5,
                Math.max(0, Number(review?.rating) || 0),
              );

              const carName = [review?.car?.brand, review?.car?.model]
                .filter(Boolean)
                .join(" ");

              return (
                <article
                  key={review._id}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Stars */}
                  <div
                    className="flex items-center gap-1 text-primary"
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4"
                        fill={star <= rating ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <p className="mt-5 min-h-[105px] font-garamond text-base leading-relaxed text-muted-foreground sm:text-lg">
                    "{review.comment}"
                  </p>

                  {/* Customer */}
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-metal text-sm text-primary"
                        aria-hidden="true"
                      >
                        {getInitials(customerName)}
                      </div>

                      {/* Customer Details */}
                      <div className="min-w-0">
                        <h3 className="truncate font-garamond text-sm font-bold text-card-foreground">
                          {customerName}
                        </h3>

                        {carName ? (
                          <p className="truncate font-garamond text-xs text-muted-foreground">
                            {carName}
                          </p>
                        ) : (
                          <p className="font-garamond text-xs text-muted-foreground">
                            DriveNow Customer
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quote */}
                    <Quote
                      className="h-9 w-9 shrink-0 text-primary/15"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =====================================================
            CTA SECTION
        ====================================================== */}
        <div className="relative mt-8 overflow-hidden rounded-2xl bg-primary">
          <div className="relative min-h-[230px] px-6 py-8 sm:min-h-[250px] sm:px-10 sm:py-10 lg:min-h-[280px] lg:px-12">
            {/* Car Image */}
            <img
              src={Car}
              alt="DriveNow rental car"
              className="pointer-events-none absolute bottom-0 right-2 z-0 h-[150px] w-auto object-contain sm:right-6 sm:h-[200px] lg:right-10 lg:h-[245px]"
            />

            {/* CTA Content */}
            <div className="relative z-10 max-w-xl">
              <h3 className="font-metal text-3xl leading-tight text-primary-foreground sm:text-4xl">
                Ready to hit the road?
              </h3>

              <p className="mt-2 max-w-lg font-garamond text-base text-primary-foreground/85 sm:text-lg">
                Book your perfect car today and enjoy a smooth journey with
                DriveNow.
              </p>

              <Link
                to="/cars"
                className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-background px-5 font-garamond text-sm font-bold text-foreground shadow-sm transition hover:gap-3 hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-background/40"
              >
                Browse Cars
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
