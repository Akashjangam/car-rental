import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
} from "lucide-react";

import { createAdminMember } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";

const AdminMemberAdd = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the member name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await createAdminMember(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        },
        token,
      );

      navigate("/admin/members");
    } catch (err) {
      console.error("Create member error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create member. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <Link
          to="/admin/members"
          className="mb-7 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Members
        </Link>

        {/* Form Card */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Header */}
          <header className="border-b border-border px-6 py-8 sm:px-9">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-6 w-6" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  DriveNow Admin
                </p>

                <h1 className="font-metal mt-2 text-3xl leading-tight text-foreground sm:text-4xl">
                  Add Member
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  Create a new user or dealer account for the DriveNow platform.
                </p>
              </div>
            </div>
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 px-6 py-8 sm:px-9"
          >
            {/* Error */}
            {error && (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium leading-6 text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Full Name{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  autoComplete="name"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Email Address{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="member@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Password{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Use at least 6 characters for the account password.
              </p>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Member Role{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <Shield
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full appearance-none rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="user">User</option>
                  <option value="dealer">Dealer</option>
                </select>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Dealers can add, edit, and manage their own rental cars.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-7 sm:flex-row sm:justify-end">
              <Link
                to="/admin/members"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Create Member
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default AdminMemberAdd;
