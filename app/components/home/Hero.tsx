import SearchCard from "./SearchCard";
import Image from "next/image";
import Link from "next/link";

export default function hero() {
  return (
    <section className="relative w-full h-screen">

      {/* Background Image */}
      <Image
        src="/images/hero/hero.png"
        alt="WEMA Safaris"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-6 max-w-5xl">

          <h1 className="text-5xl md:text-7xl font-extrabold">
            Discover Africa&apos;s
            <br />
            Greatest Adventures
          </h1>

          <p className="mt-6 text-xl md:text-2xl">
            Book Safaris, Hotels, Flights, Car Hire and Holiday Packages —
            all from one trusted platform.
          </p>

          <div className="mt-10 flex justify-center gap-6 flex-wrap">
            <Link href="/safaris" className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold px-8 py-4 rounded-xl">
              Explore Safaris
            </Link>

            <Link href="/contacts" className="border-2 border-white hover:bg-white hover:text-green-900 px-8 py-4 rounded-xl">
              Book Your Trip
            </Link>
            <SearchCard />
          </div>

        </div>
      </div>

    </section>
  );
}