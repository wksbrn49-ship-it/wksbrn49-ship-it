import Image from "next/image";
import Link from "next/link";
import safaris from "@/app/data/safaris";

export default function FeaturedSafaris() {
  return (

    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-green-900">
            Featured Safari Packages
          </h2>

          <p className="text-gray-600 mt-3">
            Explore Africa&apos;s most unforgettable safari experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safaris.map((safari) => (
            <div
              key={safari.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
            >
              <div className="relative h-64">
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
  Featured
</div>
                <Image
                  src={safari.image}
                  alt={safari.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-green-900">
                  {safari.title}
                </h3>

                <p className="text-gray-500 mb-3">
                  {safari.duration}
                </p>

                <p className="text-gray-700 mb-6">
                  {safari.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-600">
                    {safari.price}
                  </span>

                  <Link
                    href={`/booking?type=SAFARI&id=${safari.id}`}
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