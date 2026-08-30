import { Button } from "../ui/button";

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

        {/* LEFT */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#30AFFF]">
            Premium Car Rental
          </p>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Find the right car for your next journey.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Choose from a wide range of reliable cars and book your ride
            quickly, easily, and securely.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              className="bg-[#30AFFF] px-6 py-6 text-base font-semibold hover:bg-[#229be8]"
            >
              Browse Cars
            </Button>

            <Button
              variant="outline"
              className="border-slate-300 px-6 py-6 text-base font-semibold"
            >
              How It Works
            </Button>
          </div>

          {/* Trust information */}
          <div className="mt-10 flex flex-wrap gap-8 border-t border-slate-200 pt-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">100+</p>
              <p className="text-sm text-slate-500">Cars Available</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">24/7</p>
              <p className="text-sm text-slate-500">Customer Support</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">4.9/5</p>
              <p className="text-sm text-slate-500">Customer Rating</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-[#92EEFF]/50 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl bg-[#D8FFC5] p-8">
            <div className="flex min-h-[380px] items-center justify-center rounded-2xl bg-white/70">
              <div className="text-center">
                <div className="mb-4 text-7xl">🚗</div>

                <p className="text-lg font-semibold text-slate-800">
                  Your journey starts here
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Premium cars. Simple booking.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;