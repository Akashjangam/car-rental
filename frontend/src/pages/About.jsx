function About() {
  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-primary" />

              <p className="font-garamond text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                About DriveNow
              </p>
            </div>

            <h1 className="max-w-4xl font-metal text-5xl leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
              Simple.
              <br />
              Reliable.
              <br />
              <span className="text-primary">Built for the road.</span>
            </h1>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-xl font-garamond text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              DriveNow makes it easy to discover, reserve, and rent reliable
              vehicles for your next trip.
            </p>

            <p className="mt-5 max-w-xl font-garamond text-lg leading-relaxed text-muted-foreground">
              Our goal is to make every part of the rental experience simple,
              convenient, and secure.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
          <div className="grid md:grid-cols-3">
            <Feature
              number="01"
              title="Wide Selection"
              description="Explore different vehicles and choose the one that fits your journey and budget."
            />

            <Feature
              number="02"
              title="Easy Booking"
              description="Search available cars, select your dates, and complete your reservation with ease."
            />

            <Feature
              number="03"
              title="Secure Payments"
              description="Complete your rental payment securely and keep track of your bookings from one place."
            />
          </div>
        </div>
      </section>

      {/* BOTTOM STATEMENT */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="border-t border-border pt-8">
          <p className="max-w-4xl font-metal text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Your journey starts with the right car.
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({ number, title, description }) {
  return (
    <article className="border-b border-border p-6 sm:p-8 md:border-b-0 md:border-r md:last:border-r-0 lg:p-10">
      <p className="font-garamond text-sm font-semibold tracking-[0.15em] text-primary">
        {number}
      </p>

      <h2 className="mt-10 font-metal text-3xl text-foreground sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 max-w-sm font-garamond text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

export default About;
