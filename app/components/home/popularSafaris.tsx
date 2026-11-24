import Image from "next/image";
import Link from "next/link";
import safaris from "@/app/data/safaris";

export default function PopularSafaris() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 font-semibold uppercase tracking-widest mb-3">
            Explore Africa
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-green-900">
            Popular Safari Packages
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose from our most popular safari adventures across East Africa.
          </p>
        </div>

        {/* Safari Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safaris.slice(0, 3).map((safari) => (
            <div
              key={safari.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100"
            >

              {/* Image */}
              <div className="relative h-64">
                <Image
                  src={safari.image}
                  alt={safari.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-6">

                <h3 className="text-2xl font-bold text-green-900">
                  {safari.title}
                </h3>

                <p className="text-gray-500 mt-2">
                  {safari.duration}
                </p>

                <p className="text-gray-600 mt-4">
                  {safari.description}
                </p>

                {/* Price and Button */}
                <div className="flex justify-between items-center mt-6">
                  <span className="text-2xl font-bold text-yellow-600">
                    {safari.price}
                  </span>

                  <Link
                    href="/safaris"
                    className="bg-green-900 text-white px-5 py-3 rounded-lg hover:bg-green-800 transition"
                  >
                    View Package
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/safaris"
            className="inline-block border-2 border-green-900 text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-900 hover:text-white transition"
          >
            View All Safari Packages
          </Link>
        </div>

      </div>
    </section>
  );
}