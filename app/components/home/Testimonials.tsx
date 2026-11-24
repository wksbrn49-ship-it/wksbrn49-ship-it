import Image from "next/image";
import { testimonials } from "@/app/data/testimonials";

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-yellow-500 font-semibold uppercase tracking-widest mb-3">
            Traveler Reviews
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-green-900">
            What Our Travelers Say
          </h2>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover why travelers choose WEMA Safaris for unforgettable
            African adventures.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">

          {testimonials.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition duration-300"
            >

              {/* Quote */}
              <div className="absolute top-5 right-7 text-6xl text-green-100 font-serif">
                &quot;
              </div>

              {/* Customer */}
              <div className="flex items-center gap-4 mb-6">

                <Image
                  src={item.image}
                  alt={item.name}
                  width={70}
                  height={70}
                  className="w-[70px] h-[70px] rounded-full object-cover border-4 border-yellow-400"
                />

                <div>
                  <h3 className="font-bold text-lg text-green-900">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.country}
                  </p>

                  <div className="text-yellow-500 text-sm mt-1">
                    {"★".repeat(item.rating)}
                  </div>
                </div>

              </div>

              {/* Review */}
              <p className="text-gray-600 leading-7">
                &quot;{item.review}&quot;
              </p>

              {/* Verified */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <span className="text-sm text-green-700 font-medium">
                  ✓ Verified Traveler
                </span>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}