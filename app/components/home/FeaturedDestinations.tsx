import Image from "next/image";
import Link from "next/link";

const destinations = [
  {
    name: "Maasai Mara",
    image: "/images/destinations/Maasai-Mara.png",
    description: "Experience the world-famous Great Migration and breathtaking wildlife.",
  },
  {
    name: "Amboseli",
    image: "/images/destinations/Amboseli.png",
    description: "Enjoy spectacular views of Mount Kilimanjaro and elephant herds.",
  },
  {
    name: "Diani Beach",
    image: "/images/destinations/Diani.png",
    description: "Relax on pristine white sands and turquoise waters.",
  },
  {
    name: "Lake nakuru",
    image: "/images/destinations/Lake-Nakuru.png",
    description: "Experience the world-famous Great Migration and breathtaking wildlife.",
  },
  {
    name: "Mount Kenya",
    image: "/images/destinations/Mount-Kenya.png",
    description: "Climb the second-highest peak in Africa and experience diverse ecosystems.",
  },
  {
    name: "Zanzibar",
    image: "/images/destinations/Zanzibar.PNG",
    description: "Discover the tropical paradise of Zanzibar with its pristine beaches and rich culture.",
  },

];

export default function FeaturedDestinations() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-green-900">
          Featured Destinations
        </h2>

        <p className="text-center text-gray-600 mt-4 mb-12">
          Explore East Africa&apos;s most incredible destinations.
        </p>

        <div className="grid gap-8 md:grid-cols-3">

          {destinations.map((destination) => (
            <div
              key={destination.name}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
            >
              <div className="relative h-64">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-green-900">
                  {destination.name}
                </h3>

                <p className="mt-3 text-gray-600">
                  {destination.description}
                </p>

                <Link
                  href="/destinations"
                  className="mt-6 inline-block bg-yellow-500 text-green-900 px-5 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}