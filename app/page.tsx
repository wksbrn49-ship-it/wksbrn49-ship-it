import FeaturedDestinations from "./components/home/FeaturedDestinations";
import Navbar from "./components/Navbar";
import Hero from "./components/home/Hero";
import FeaturedSafaris from "./components/home/FeaturedSafaris";
import FeaturedHotels from "./components/home/FeaturedHotels";
import FeaturedFlights from "@/app/components/home/FeaturedFlights";
import FlightSearch from "@/app/components/home/FlightSearch";
import Testimonials from "./components/home/Testimonials";
import WhyChooseWema from "./components/home/WhyChooseWema";
import PopularSafaris from "./components/home/popularSafaris";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedDestinations />
      <FeaturedSafaris />
      <FlightSearch />
      <Testimonials />
      <WhyChooseWema />
      <FeaturedFlights />
      <FeaturedHotels />
      <PopularSafaris />
    </>
  );
}