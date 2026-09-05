import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, Lock, CheckCircle2 } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${token}`,
        {
          password,
        },
      );

      if (response.data?.success) {
        setSuccess(true);
      } else {
        setError(
          response.data?.message ||
            "Unable to reset your password. Please try again.",
        );
      }
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.message ||
          "This reset link may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-background px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1400px] items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
                <CheckCircle2
                  className="h-7 w-7"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              <p className="mb-3 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                DriveNow
              </p>

              <h1 className="font-metal text-3xl leading-tight text-foreground sm:text-4xl">
                Password updated
              </h1>

              <p className="mx-auto mt-4 max-w-md font-garamond text-lg leading-7 text-muted-foreground">
                Your password has been changed successfully. You can now sign
                in with your new password.
              </p>

              <Button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-7 h-12 w-full rounded-xl font-garamond text-base font-semibold"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
              <Car
                className="h-5 w-5"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p className="mb-3 font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow
            </p>

            <h1 className="font-metal text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
              Reset your password
            </h1>

            <p className="mt-4 max-w-md font-garamond text-lg leading-7 text-muted-foreground">
              Create a new password for your DriveNow account.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-garamond text-base font-semibold text-foreground"
                >
                  New password
                </label>

                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-background pl-11 font-garamond text-base"
                  />
                </div>

                <p className="mt-2 font-garamond text-sm text-muted-foreground">
                  Use at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-garamond text-base font-semibold text-foreground"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-background pl-11 font-garamond text-base"
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
                {loading ? "Updating password..." : "Reset Password"}
              </Button>
            </form>
          </div>

          {/* Bottom Note */}
          <p className="mt-6 text-center font-garamond text-sm text-muted-foreground">
            Keep your password private and secure.
          </p>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;