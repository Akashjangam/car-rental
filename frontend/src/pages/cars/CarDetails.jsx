import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  Pencil,
  Send,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { getCarById } from "../../services/carApi";
import {
  createReview,
  deleteReview,
  getCarReviews,
  updateReview,
} from "../../services/reviewApi";
import { getMyBookings } from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // Booking eligibility
  const [completedBooking, setCompletedBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Add review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Review messages
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Edit review
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [reviewUpdating, setReviewUpdating] = useState(false);

  // Delete review
  const [reviewDeletingId, setReviewDeletingId] = useState(null);

  // Fetch car

  useEffect(() => {
    let mounted = true;

    const fetchCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCarById(id);

        const data = response?.car || response?.data || response;

        if (mounted) {
          setCar(data);
        }
      } catch (err) {
        console.error("Failed to fetch car:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load this car. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchCar();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // Fetch reviews

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await getCarReviews(id);

        if (!mounted) {
          return;
        }

        const reviewList = Array.isArray(response?.reviews)
          ? response.reviews
          : [];

        setReviews(reviewList);

        setAverageRating(Number(response?.averageRating || 0));

        setTotalReviews(Number(response?.totalReviews || reviewList.length));
      } catch (err) {
        console.error("Failed to fetch reviews:", err);

        if (mounted) {
          setReviewsError(
            err?.response?.data?.message || "Unable to load reviews.",
          );
        }
      } finally {
        if (mounted) {
          setReviewsLoading(false);
        }
      }
    };

    if (id) {
      fetchReviews();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // Find completed booking

  useEffect(() => {
    let mounted = true;

    const findCompletedBooking = async () => {
      if (!token || !id) {
        setCompletedBooking(null);
        setBookingLoading(false);
        return;
      }

      try {
        setBookingLoading(true);

        const response = await getMyBookings(token);

        const bookings = Array.isArray(response?.bookings)
          ? response.bookings
          : [];

        const reviewedBookingIds = new Set(
          reviews
            .map((review) => {
              if (review?.booking?._id) {
                return String(review.booking._id);
              }

              if (review?.booking?.id) {
                return String(review.booking.id);
              }

              if (review?.booking) {
                return String(review.booking);
              }

              return null;
            })
            .filter(Boolean),
        );

        const matchingBooking = bookings.find((booking) => {
          const bookingCarId =
            booking?.car?._id || booking?.car?.id || booking?.car;

          const bookingId = booking?._id || booking?.id;

          return (
            String(bookingCarId) === String(id) &&
            booking?.status === "completed" &&
            bookingId &&
            !reviewedBookingIds.has(String(bookingId))
          );
        });

        if (mounted) {
          setCompletedBooking(matchingBooking || null);
        }
      } catch (err) {
        console.error("Failed to check completed bookings:", err);

        if (mounted) {
          setCompletedBooking(null);
        }
      } finally {
        if (mounted) {
          setBookingLoading(false);
        }
      }
    };

    findCompletedBooking();

    return () => {
      mounted = false;
    };
  }, [id, token, reviews]);

  // Car information

  const carImage = useMemo(() => {
    const image = car?.image || car?.imageUrl || car?.images?.[0] || "";

    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
  }, [car]);

  const carName =
    car?.name ||
    [car?.brand, car?.model].filter(Boolean).join(" ") ||
    "DriveNow Car";

  const price =
    car?.pricePerDay ?? car?.rentPerDay ?? car?.dailyRate ?? car?.price ?? 0;

  const transmission = car?.transmission || car?.gearbox || "Automatic";

  const fuel = car?.fuelType || car?.fuel || "Petrol";

  const seats = car?.seats || car?.capacity || 5;

  const category = car?.category || "Car";

  const location = car?.location || car?.pickupLocation || "DriveNow Location";

  const isAvailable =
    car?.available !== false &&
    car?.isAvailable !== false &&
    car?.availability !== false;

  // Booking

  const handleBookNow = () => {
    if (!isAvailable) {
      return;
    }

    if (!token) {
      navigate("/login", {
        state: {
          from: `/booking/${id}`,
        },
      });

      return;
    }

    navigate(`/booking/${id}`);
  };

  // Calculate average

  const calculateAverage = (reviewList) => {
    if (!reviewList.length) {
      return 0;
    }

    const total = reviewList.reduce(
      (sum, review) => sum + (Number(review?.rating) || 0),
      0,
    );

    return Number((total / reviewList.length).toFixed(1));
  };

  // Submit review

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login", {
        state: {
          from: `/cars/${id}`,
        },
      });

      return;
    }

    if (!completedBooking?._id) {
      setReviewError("You can review this car only after completing a rental.");
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    if (comment.trim().length < 3) {
      setReviewError("Review must be at least 3 characters.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      const response = await createReview(
        {
          carId: id,
          bookingId: completedBooking._id,
          rating,
          comment: comment.trim(),
        },
        token,
      );

      const newReview = response?.review;

      if (newReview) {
        const updatedReviews = [newReview, ...reviews];

        setReviews(updatedReviews);

        setTotalReviews(updatedReviews.length);

        setAverageRating(calculateAverage(updatedReviews));
      }

      setComment("");
      setRating(5);
      setCompletedBooking(null);

      setReviewMessage("Review added successfully.");
    } catch (err) {
      console.error("Failed to submit review:", err);

      setReviewError(
        err?.response?.data?.message || "Unable to submit your review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Check own review

  const isOwnReview = (review) => {
    const reviewUserId = review?.user?._id || review?.user?.id || review?.user;

    const currentUserId = user?._id || user?.id;

    return (
      currentUserId &&
      reviewUserId &&
      String(reviewUserId) === String(currentUserId)
    );
  };

  // Start editing

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);

    setEditRating(Number(review?.rating) || 5);

    setEditComment(review?.comment || "");

    setReviewError("");
    setReviewMessage("");
  };

  // Cancel editing

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  // Update review

  const handleUpdateReview = async (reviewId) => {
    if (!token) {
      return;
    }

    if (!editComment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    if (editComment.trim().length < 3) {
      setReviewError("Review must be at least 3 characters.");
      return;
    }

    try {
      setReviewUpdating(true);
      setReviewError("");
      setReviewMessage("");

      const response = await updateReview(
        reviewId,
        {
          rating: editRating,
          comment: editComment.trim(),
        },
        token,
      );

      const updatedReview = response?.review;

      if (updatedReview) {
        const updatedReviews = reviews.map((review) =>
          String(review._id) === String(reviewId) ? updatedReview : review,
        );

        setReviews(updatedReviews);

        setTotalReviews(updatedReviews.length);

        setAverageRating(calculateAverage(updatedReviews));
      }

      handleCancelEdit();

      setReviewMessage("Review updated successfully.");
    } catch (err) {
      console.error("Failed to update review:", err);

      setReviewError(
        err?.response?.data?.message || "Unable to update your review.",
      );
    } finally {
      setReviewUpdating(false);
    }
  };

  // Delete review

  const handleDeleteReview = async (reviewId) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setReviewDeletingId(reviewId);
      setReviewError("");
      setReviewMessage("");

      await deleteReview(reviewId, token);

      const remainingReviews = reviews.filter(
        (review) => String(review._id) !== String(reviewId),
      );

      setReviews(remainingReviews);

      setTotalReviews(remainingReviews.length);

      setAverageRating(calculateAverage(remainingReviews));

      if (String(editingReviewId) === String(reviewId)) {
        handleCancelEdit();
      }

      setReviewMessage("Review deleted successfully.");
    } catch (err) {
      console.error("Failed to delete review:", err);

      setReviewError(
        err?.response?.data?.message || "Unable to delete your review.",
      );
    } finally {
      setReviewDeletingId(null);
    }
  };

  // Loading

  if (loading) {
    return <DetailsSkeleton />;
  }

  // Error

  if (error || !car) {
    return (
      <main className="min-h-screen bg-background px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[500px] max-w-2xl items-center justify-center">
          <section
            className="w-full border-y border-border bg-background px-6 py-12 text-center sm:px-10"
            role="alert"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <CircleAlert
                className="h-8 w-8 text-destructive"
                aria-hidden="true"
              />
            </div>

            <p className="mt-7 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow
            </p>

            <h1 className="mt-4 font-metal text-5xl leading-none text-foreground sm:text-6xl">
              Car not
              <br />
              <span className="text-primary">found.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md font-garamond text-xl leading-relaxed text-muted-foreground">
              {error || "We couldn't find the car you're looking for."}
            </p>

            <Link
              to="/cars"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-garamond text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to cars
            </Link>
          </section>
        </div>
      </main>
    );
  }

  // Main

  return (
    <main className="min-h-screen bg-background">
      {/* Back */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/cars"
            className="inline-flex min-h-10 items-center gap-2 font-garamond text-base font-semibold text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to cars
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Car details */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start xl:gap-16">
          {/* Image */}
          <section>
            <div className="relative overflow-hidden rounded-[36px] sm:rounded-[48px]">
              <div className="aspect-[16/11] bg-muted">
                {carImage ? (
                  <img
                    src={carImage}
                    alt={carName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <CarIcon />

                      <p className="mt-4 font-garamond text-base text-muted-foreground">
                        No image available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute left-5 top-5">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-garamond text-sm font-semibold shadow-sm ${
                    isAvailable
                      ? "bg-success text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAvailable ? "bg-green-600" : "bg-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />

                  {isAvailable ? "Available" : "Currently unavailable"}
                </span>
              </div>
            </div>
          </section>

          {/* Information */}
          <section className="lg:pt-2">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />

              <span className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                {category}
              </span>
            </div>

            {car?.brand && (
              <p className="mt-5 font-garamond text-lg text-muted-foreground">
                {car.brand}
              </p>
            )}

            <h1 className="mt-1 font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
              {carName}
            </h1>

            {car?.description && (
              <p className="mt-6 max-w-xl font-garamond text-xl leading-relaxed text-muted-foreground">
                {car.description}
              </p>
            )}

            {/* Rating */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                <Star
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                />

                <span className="font-metal text-xl">
                  {averageRating > 0 ? averageRating.toFixed(1) : "No rating"}
                </span>
              </div>

              <span className="font-garamond text-base text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-8 border-y border-border py-6">
              <p className="font-garamond text-base text-muted-foreground">
                Rental price
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="font-metal text-4xl text-foreground sm:text-5xl">
                  ₹{Number(price).toLocaleString("en-IN")}
                </span>

                <span className="pb-1 font-garamond text-lg text-muted-foreground">
                  / day
                </span>
              </div>
            </div>

            {/* Vehicle details */}
            <div className="mt-7">
              <h2 className="font-metal text-2xl text-foreground">
                Vehicle details
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <DetailItem
                  icon={<Gauge />}
                  label="Transmission"
                  value={transmission}
                />

                <DetailItem icon={<Fuel />} label="Fuel" value={fuel} />

                <DetailItem icon={<Users />} label="Seats" value={seats} />

                <DetailItem
                  icon={<MapPin />}
                  label="Location"
                  value={location}
                />
              </div>
            </div>

            {/* Booking */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleBookNow}
                disabled={!isAvailable}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-garamond text-lg font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarDays className="h-5 w-5" aria-hidden="true" />

                {isAvailable ? "Book this car" : "Car unavailable"}

                {isAvailable && (
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                )}
              </button>

              {!token && isAvailable && (
                <p className="mt-3 text-center font-garamond text-sm text-muted-foreground">
                  You'll need to log in before completing your booking.
                </p>
              )}
            </div>

            {/* Trust */}
            <div className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <TrustItem text="Secure booking process" />
              <TrustItem text="Verified vehicle information" />
              <TrustItem text="Transparent daily pricing" />
              <TrustItem text="Customer support available" />
            </div>
          </section>
        </div>

        {/* Reviews */}
        <section
          className="mt-16 border-t border-border pt-12 lg:mt-20"
          aria-labelledby="reviews-heading"
        >
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            {/* Review summary */}
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />

                <span className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Customer feedback
                </span>
              </div>

              <h2
                id="reviews-heading"
                className="mt-4 font-metal text-4xl text-foreground sm:text-5xl"
              >
                Reviews
              </h2>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Star
                    className="h-7 w-7"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="font-metal text-3xl text-foreground">
                    {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                  </p>

                  <p className="font-garamond text-base text-muted-foreground">
                    Based on {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Add review */}
              {token && completedBooking && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <h3 className="font-metal text-2xl text-card-foreground">
                    Share your experience
                  </h3>

                  <p className="mt-2 font-garamond text-base text-muted-foreground">
                    Tell us about your rental experience.
                  </p>

                  <fieldset className="mt-6">
                    <legend className="font-garamond text-base font-semibold text-card-foreground">
                      Your rating
                    </legend>

                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="rounded-md p-1 text-primary transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Rate ${star} out of 5`}
                          aria-pressed={rating === star}
                        >
                          <Star
                            className="h-7 w-7"
                            fill={star <= rating ? "currentColor" : "none"}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mt-5">
                    <label
                      htmlFor="review-comment"
                      className="font-garamond text-base font-semibold text-card-foreground"
                    >
                      Your review
                    </label>

                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={5}
                      maxLength={1000}
                      placeholder="How was your rental experience?"
                      className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />

                    <p className="mt-1 text-right font-garamond text-xs text-muted-foreground">
                      {comment.length}/1000
                    </p>
                  </div>

                  {reviewError && (
                    <p
                      className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 font-garamond text-sm text-destructive"
                      role="alert"
                    >
                      {reviewError}
                    </p>
                  )}

                  {reviewMessage && (
                    <p
                      className="mt-4 rounded-xl bg-success px-4 py-3 font-garamond text-sm text-foreground"
                      role="status"
                    >
                      {reviewMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewSubmitting || bookingLoading}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />

                    {reviewSubmitting ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              )}

              {/* Login */}
              {!token && (
                <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="font-garamond text-base text-muted-foreground">
                    Completed a rental? Log in to share your experience.
                  </p>

                  <Link
                    to="/login"
                    state={{
                      from: `/cars/${id}`,
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                  >
                    Log in
                  </Link>
                </div>
              )}

              {/* No eligible booking */}
              {token && !completedBooking && !bookingLoading && (
                <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="font-garamond text-base text-muted-foreground">
                    Reviews are available after you complete a rental of this
                    car.
                  </p>
                </div>
              )}
            </div>

            {/* Review list */}
            <div>
              {reviewsLoading ? (
                <ReviewsSkeleton />
              ) : reviewsError ? (
                <div
                  className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6"
                  role="alert"
                >
                  <p className="font-garamond text-base text-destructive">
                    {reviewsError}
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Heart className="h-6 w-6" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 font-metal text-2xl text-card-foreground">
                    No reviews yet
                  </h3>

                  <p className="mt-2 max-w-md font-garamond text-base text-muted-foreground">
                    Be the first customer to share your experience with this
                    car.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => {
                    const ownReview = isOwnReview(review);

                    const isEditing =
                      String(editingReviewId) === String(review._id);

                    const isDeleting =
                      String(reviewDeletingId) === String(review._id);

                    return (
                      <article
                        key={review._id}
                        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="font-metal text-xl text-card-foreground">
                              {review?.user?.name || "DriveNow Customer"}
                            </h3>

                            {!isEditing && (
                              <div
                                className="mt-2 flex items-center gap-1 text-primary"
                                aria-label={`${review.rating} out of 5 stars`}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4"
                                    fill={
                                      star <= Number(review.rating)
                                        ? "currentColor"
                                        : "none"
                                    }
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {review?.createdAt && (
                            <time
                              dateTime={review.createdAt}
                              className="font-garamond text-sm text-muted-foreground"
                            >
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </time>
                          )}
                        </div>

                        {/* Edit */}
                        {isEditing ? (
                          <div className="mt-5">
                            <fieldset>
                              <legend className="font-garamond text-base font-semibold text-card-foreground">
                                Rating
                              </legend>

                              <div className="mt-3 flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="rounded-md p-1 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label={`Rate ${star} out of 5`}
                                    aria-pressed={editRating === star}
                                  >
                                    <Star
                                      className="h-6 w-6"
                                      fill={
                                        star <= editRating
                                          ? "currentColor"
                                          : "none"
                                      }
                                      strokeWidth={1.8}
                                      aria-hidden="true"
                                    />
                                  </button>
                                ))}
                              </div>
                            </fieldset>

                            <label
                              htmlFor={`edit-review-${review._id}`}
                              className="mt-5 block font-garamond text-base font-semibold text-card-foreground"
                            >
                              Your review
                            </label>

                            <textarea
                              id={`edit-review-${review._id}`}
                              value={editComment}
                              onChange={(event) =>
                                setEditComment(event.target.value)
                              }
                              rows={5}
                              maxLength={1000}
                              className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-garamond text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />

                            <p className="mt-1 text-right font-garamond text-xs text-muted-foreground">
                              {editComment.length}/1000
                            </p>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => handleUpdateReview(review._id)}
                                disabled={reviewUpdating}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-garamond text-base font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Check className="h-4 w-4" aria-hidden="true" />

                                {reviewUpdating ? "Saving..." : "Save changes"}
                              </button>

                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={reviewUpdating}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 font-garamond text-base font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-5 font-garamond text-lg leading-relaxed text-muted-foreground">
                            {review.comment}
                          </p>
                        )}

                        {/* Own review actions */}
                        {ownReview && !isEditing && (
                          <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(review)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 font-garamond text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={isDeleting}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 font-garamond text-sm font-semibold text-destructive transition hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />

                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {reviewMessage && (
                <p
                  className="mt-4 rounded-xl bg-success px-4 py-3 font-garamond text-sm text-foreground"
                  role="status"
                >
                  {reviewMessage}
                </p>
              )}

              {reviewError && (
                <p
                  className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 font-garamond text-sm text-destructive"
                  role="alert"
                >
                  {reviewError}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Detail item

function DetailItem({ icon, label, value }) {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <span className="text-primary">
          <span
            className="[&>svg]:h-[18px] [&>svg]:w-[18px]"
            aria-hidden="true"
          >
            {icon}
          </span>
        </span>

        <p className="font-garamond text-sm text-muted-foreground">{label}</p>
      </div>

      <p
        className="mt-2 truncate font-garamond text-lg font-semibold text-foreground"
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

// Trust item

function TrustItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
        <Check className="h-4 w-4 text-foreground" aria-hidden="true" />
      </div>

      <span className="font-garamond text-base text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

// Car icon

function CarIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 17h14M6 17l1-5h10l1 5M8 12l1.5-4h5L16 12M7 17v2m10-2v2M4 14h2m12 0h2"
        />
      </svg>
    </div>
  );
}

// Details skeleton

function DetailsSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="aspect-[16/11] animate-pulse rounded-[36px] bg-muted sm:rounded-[48px]"
            aria-hidden="true"
          />

          <div className="space-y-6" aria-hidden="true">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />

            <div className="h-14 w-3/4 animate-pulse rounded bg-muted" />

            <div className="h-20 animate-pulse rounded bg-muted" />

            <div className="border-y border-border py-7">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />

              <div className="mt-3 h-12 w-48 animate-pulse rounded bg-muted" />
            </div>

            <div className="h-8 w-44 animate-pulse rounded bg-muted" />

            <div className="grid grid-cols-2 gap-5">
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
            </div>

            <div className="h-14 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}

// Reviews skeleton

function ReviewsSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />

          <div className="mt-3 h-4 w-28 animate-pulse rounded bg-muted" />

          <div className="mt-5 h-16 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default CarDetails;
