import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Car, Mail, CheckCircle2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      if (response.data?.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(
          response.data?.message ||
            "Unable to process your request. Please try again.",
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-76px)] bg-background px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1400px] items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Back */}
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 font-garamond text-base text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to login
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-primary">
              <Car className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </div>

            <p className="mb-3 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow
            </p>

            <h1 className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
              Forgot your password?
            </h1>

            <p className="mt-4 max-w-md font-garamond text-lg leading-7 text-muted-foreground">
              Enter your email address and we'll help you reset your password.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {success ? (
              <div
                role="status"
                aria-live="polite"
                className="text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
                  <CheckCircle2
                    className="h-7 w-7"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </div>

                <h2 className="font-metal text-2xl text-foreground">
                  Check your email
                </h2>

                <p className="mx-auto mt-3 max-w-sm font-garamond text-base leading-6 text-muted-foreground">
                  If an account exists with that email, a password reset link
                  has been generated.
                </p>

                <Link
                  to="/login"
                  className="mt-6 inline-flex font-garamond text-base font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Email */}
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block font-garamond text-base font-semibold text-foreground"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="forgot-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className="h-12 rounded-xl border-border bg-background pl-11 font-garamond text-base"
                      aria-invalid={Boolean(error)}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-garamond text-base text-destructive"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl font-garamond text-base font-semibold"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </div>

          {/* Bottom Note */}
          <p className="mt-6 text-center font-garamond text-sm text-muted-foreground">
            Your account security is important to us.
          </p>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;