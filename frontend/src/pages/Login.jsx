import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Car } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login({
        email,
        password,
      });

      if (!data?.success) {
        setError(data?.message || "Login failed.");
        return;
      }

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else if (data.user?.role === "dealer") {
        navigate("/dealer/cars");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
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
            to="/"
            className="mb-8 inline-flex items-center gap-2 font-garamond text-base text-muted-foreground transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
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
              Welcome back
            </h1>

            <p className="mt-4 max-w-md font-garamond text-lg leading-7 text-muted-foreground">
              Sign in to continue your journey with DriveNow.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-garamond text-base font-semibold text-foreground"
                >
                  Email address
                </label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="h-12 rounded-xl border-border bg-background font-garamond text-base"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="font-garamond text-base font-semibold text-foreground"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="font-garamond text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-12 rounded-xl border-border bg-background font-garamond text-base"
                />
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Register */}
            <div className="mt-7 border-t border-border pt-6 text-center">
              <p className="font-garamond text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <p className="mt-6 text-center font-garamond text-sm text-muted-foreground">
            Secure access to your DriveNow account.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
