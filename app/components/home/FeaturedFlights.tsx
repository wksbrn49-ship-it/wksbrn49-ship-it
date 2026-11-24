import Image from "next/image";
import Link from "next/link";
import { flights } from "@/app/data/flights";

export default function FeaturedFlights() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 font-semibold uppercase tracking-widest mb-3">
            Flight Deals
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-green-900">
            Featured Flights
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover affordable flights across Kenya and East Africa.
          </p>
        </div>

        {/* Flight Cards */}
        <div className="grid md:grid-cols-3 gap-8">

          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
            >

              {/* Image */}
              <div className="relative h-56">
                <Image
                  src={flight.image}
                  alt={flight.airline}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-6">

                <h3 className="text-2xl font-bold text-green-900">
                  {flight.airline}
                </h3>

                <p className="text-gray-600 mt-2">
                  {flight.route}
                </p>

                <p className="text-gray-500 mt-1">
                  Duration: {flight.duration}
                </p>

                <div className="flex justify-between items-center mt-6">

                  <span className="text-2xl font-bold text-yellow-600">
                    {flight.price}
                  </span>

                  <Link
                    href={`/booking?type=FLIGHT&id=${flight.id}`}
                    className="bg-green-800 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Book Flight
                  </Link>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
