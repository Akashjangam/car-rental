import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  CalendarDays,
  IndianRupee,
  ArrowRight,
  RefreshCw,
  UserRoundCog,
  LayoutDashboard,
} from "lucide-react";

import { getAdminDashboard } from "../../services/adminApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboard(token);

      const dashboardData =
        response?.dashboard ||
        response?.data?.dashboard ||
        response?.data ||
        response;

      setDashboard(dashboardData);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have permission to access the admin dashboard.");
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="animate-pulse space-y-8"
            aria-label="Loading admin dashboard"
          >
            <div>
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="mt-3 h-10 w-72 rounded bg-muted" />
              <div className="mt-3 h-5 w-96 max-w-full rounded bg-muted" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-32 rounded-2xl bg-muted" />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-64 rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="w-full max-w-xl border-border bg-card shadow-sm">
          <CardContent className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <RefreshCw
                size={24}
                className="text-destructive"
                aria-hidden="true"
              />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              DriveNow Admin
            </p>

            <h1 className="font-metal mt-2 text-3xl text-foreground sm:text-4xl">
              Dashboard Unavailable
            </h1>

            <p className="mt-3 text-base text-muted-foreground">{error}</p>

            <Button onClick={fetchDashboard} className="mt-7">
              <RefreshCw size={17} className="mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const stats = dashboard?.stats || dashboard?.statistics || dashboard || {};

  const totalCars = Number(
    stats.totalCars ?? stats.cars ?? dashboard?.carCount ?? 0,
  );

  const totalUsers = Number(
    stats.totalUsers ?? stats.users ?? dashboard?.memberCount ?? 0,
  );

  const totalBookings = Number(
    stats.totalBookings ?? stats.bookings ?? dashboard?.bookingCount ?? 0,
  );

  const totalRevenue = Number(
    stats.totalRevenue ?? stats.revenue ?? dashboard?.revenue ?? 0,
  );

  const totalDealers = Number(
    stats.totalDealers ?? stats.dealers ?? dashboard?.dealerCount ?? 0,
  );

  const pendingBookings = Number(
    stats.pendingBookings ?? dashboard?.pendingBookings ?? 0,
  );

  const successfulPayments = Number(
    stats.successfulPayments ?? dashboard?.successfulPayments ?? 0,
  );

  const statCards = [
    {
      label: "Total Cars",
      value: totalCars,
      icon: Car,
    },
    {
      label: "Total Members",
      value: totalUsers,
      icon: Users,
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarDays,
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  const overviewCards = [
    {
      label: "Registered Dealers",
      value: totalDealers,
      icon: UserRoundCog,
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      icon: CalendarDays,
    },
    {
      label: "Successful Payments",
      value: successfulPayments,
      icon: IndianRupee,
    },
  ];

  const managementCards = [
    {
      title: "Manage Cars",
      description:
        "Add, edit, delete, and manage all vehicles available on DriveNow.",
      icon: Car,
      link: "/admin/cars",
      action: "Manage Cars",
    },
    {
      title: "Manage Bookings",
      description:
        "View customer bookings and monitor rental activity across the platform.",
      icon: CalendarDays,
      link: "/admin/bookings",
      action: "View Bookings",
    },
    {
      title: "Manage Members",
      description:
        "Manage users and dealers registered on the DriveNow platform.",
      icon: Users,
      link: "/admin/members",
      action: "View Members",
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <LayoutDashboard size={16} aria-hidden="true" />
            DriveNow Admin
          </div>

          <h1 className="font-metal mt-3 text-4xl leading-tight text-foreground sm:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Manage cars, bookings, dealers, and platform members from one
            central workspace.
          </p>
        </header>

        {/* Statistics */}
        <section aria-labelledby="dashboard-stats">
          <div className="mb-4">
            <h2
              id="dashboard-stats"
              className="font-metal text-2xl text-foreground"
            >
              At a Glance
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card
                  key={stat.label}
                  className="group border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>

                        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                          {stat.value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon
                          size={21}
                          className="text-primary"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Platform Overview */}
        <section
          aria-labelledby="platform-overview"
          className="mt-12 border-t border-border pt-8"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Platform
            </p>

            <h2
              id="platform-overview"
              className="font-metal mt-2 text-2xl text-foreground"
            >
              Platform Overview
            </h2>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {overviewCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.label}
                  className="border-border bg-card shadow-sm"
                >
                  <CardContent className="flex items-center gap-4 p-5 sm:p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon
                        size={21}
                        className="text-primary"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Management */}
        <section
          aria-labelledby="management-sections"
          className="mt-12 border-t border-border pt-8"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Administration
            </p>

            <h2
              id="management-sections"
              className="font-metal mt-2 text-2xl text-foreground"
            >
              Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Access the core areas of your DriveNow rental platform.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managementCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="group flex h-full flex-col border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <CardContent className="flex h-full flex-col p-6 sm:p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon
                        size={23}
                        className="text-primary"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="font-metal mt-6 text-2xl text-foreground">
                      {item.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>

                    <Link
                      to={item.link}
                      className="mt-6 inline-flex w-fit rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <Button>
                        {item.action}
                        <ArrowRight
                          size={17}
                          className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions" className="mt-12 pb-8">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2
                    id="quick-actions"
                    className="font-metal text-2xl text-foreground"
                  >
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Quickly access the main admin sections.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/admin/cars">
                    <Button variant="outline">
                      <Car size={17} className="mr-2" aria-hidden="true" />
                      Cars
                    </Button>
                  </Link>

                  <Link to="/admin/bookings">
                    <Button variant="outline">
                      <CalendarDays
                        size={17}
                        className="mr-2"
                        aria-hidden="true"
                      />
                      Bookings
                    </Button>
                  </Link>

                  <Link to="/admin/members">
                    <Button variant="outline">
                      <Users size={17} className="mr-2" aria-hidden="true" />
                      Members
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
