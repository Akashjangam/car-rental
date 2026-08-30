function HowItWorks() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-5xl text-center">

        <p className="text-sm font-semibold uppercase tracking-wide text-[#30AFFF]">
          Simple Process
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          How It Works
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-slate-500">
          Rent your favorite car in just a few simple steps.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#30AFFF] text-xl font-bold text-white">
              1
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Choose a Car
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Browse our available cars and choose the one you like.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#30AFFF] text-xl font-bold text-white">
              2
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Select Dates
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select your pickup and return dates.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#30AFFF] text-xl font-bold text-white">
              3
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Make Payment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete your payment and enjoy your ride.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

export default HowItWorks;