import Image from "next/image";
import Link from "next/link";
import { airbnbStays, hotels, type Stay } from "@/app/data/hotels";

function StayCard({ stay, label }: { stay: Stay; label: string }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow">
      <div className="relative h-56">
        <Image
          src={stay.image}
          alt={stay.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-green-700">{label}</p>
        <h3 className="mt-1 text-xl font-semibold text-green-900">
          {stay.name}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{stay.location}</p>
        <p className="mt-4 text-gray-700">{stay.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-bold text-green-900">
            {stay.price} / night
          </span>
          <Link
            href={`/booking?type=HOTEL&id=${stay.id}`}
            className="rounded-md bg-green-900 px-4 py-2 font-semibold text-white hover:bg-green-800"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HotelsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-green-900">
          Hotels and Airbnb Stays
        </h1>

        <section aria-labelledby="hotels-heading">
          <h2 id="hotels-heading" className="mb-5 text-2xl font-bold text-green-900">
            Hotels
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((stay) => (
              <StayCard key={stay.id} stay={stay} label="Hotel" />
            ))}
          </div>
        </section>

        <section aria-labelledby="airbnb-heading" className="mt-12">
          <h2 id="airbnb-heading" className="text-2xl font-bold text-green-900">
            Airbnb-style stays
          </h2>
          <p className="mb-5 mt-2 text-gray-600">
            Explore independent homes and guesthouses alongside our hotel options.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {airbnbStays.map((stay) => (
              <StayCard key={stay.id} stay={stay} label="Airbnb-style stay" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
