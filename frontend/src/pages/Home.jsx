import Hero from "../components/home/Hero";
import SearchCars from "../components/home/SearchCars";
import FeaturedCars from "../components/home/FeaturedCars";
import HowItWorks from "../components/home/HowItWorks";
import About from "./About";

function Home() {
  return (
    <main>
      <Hero />

      <SearchCars />
      {/* <About /> */}
      <FeaturedCars />

      <HowItWorks />
    </main>
  );
}

export default Home;