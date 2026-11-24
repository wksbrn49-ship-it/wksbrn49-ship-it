import Image from "next/image";
import Link from "next/link";
import { hotels } from "@/app/data/hotels";

export default function FeaturedHotels() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-green-900">
            Featured Hotels
          </h2>

          <p className="text-gray-600 mt-3">
            Stay at Africa&apos;s finest luxury hotels and resorts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {hotels.map((hotel) => (

            <div
              key={hotel.id}
              className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition"
            >

              <div className="relative h-64">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">

                <div className="flex justify-between">
                  <h3 className="text-2xl font-bold text-green-900">
                    {hotel.name}
                  </h3>

                  <span className="text-yellow-500">
                    ⭐ {hotel.rating}
                  </span>
                </div>

                <p className="text-gray-500 mt-2">
                  {hotel.location}
                </p>

                <p className="text-gray-600 mt-4">
                  {hotel.description}
                </p>

                <div className="flex justify-between items-center mt-6">

                  <span className="text-2xl font-bold text-yellow-600">
                    {hotel.price}
                  </span>

                  <Link
                    href={`/booking?type=HOTEL&id=${hotel.id}`}
                    className="bg-green-800 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                  >
                    Book Now
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