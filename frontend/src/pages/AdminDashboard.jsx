import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your DriveNow car rental platform.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* MANAGE CARS */}
          <Link
            to="/admin/cars"
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Manage Cars
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add, edit, delete and manage car availability.
            </p>

            <span className="mt-5 inline-block rounded-lg bg-[#30AFFF] px-5 py-3 font-semibold text-white">
              Manage Cars
            </span>
          </Link>

          {/* MANAGE BOOKINGS */}
          <Link
            to="/admin/bookings"
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Manage Bookings
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View and manage all customer bookings.
            </p>

            <span className="mt-5 inline-block rounded-lg bg-[#30AFFF] px-5 py-3 font-semibold text-white">
              Manage Bookings
            </span>
          </Link>

        </div>

      </div>
    </main>
  );
}

export default AdminDashboard;