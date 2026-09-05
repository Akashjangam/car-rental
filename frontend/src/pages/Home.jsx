import Hero from "../components/home/Hero";
import SearchCars from "../components/home/SearchCars";
import FeaturedCars from "../components/home/FeaturedCars";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";

function Home() {
  return (
    <main>
      <Hero />

      <SearchCars />

      <FeaturedCars />

      <HowItWorks />

      <Testimonials />
    </main>
  );
}

export default Home;
