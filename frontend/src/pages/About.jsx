function About() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">

        <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
          About DriveNow
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Your Journey Starts Here
        </h1>

        <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-500">
          DriveNow is a modern car rental platform that makes
          finding and booking a car simple, convenient and
          reliable.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Easy Booking
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find and book your car in just a few clicks.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Great Cars
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose from a variety of comfortable rental cars.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Secure Payments
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete your booking through a secure checkout.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

export default About;