import Image from "next/image";
import Link from "next/link";
import { flights } from "@/app/data/flights";

type FlightsPageProps = {
  searchParams: Promise<{
    date?: string;
    from?: string;
    passengers?: string;
    to?: string;
  }>;
};

export default async function FlightsPage({
  searchParams,
}: FlightsPageProps) {
  const filters = await searchParams;
  const from = filters.from?.trim().toLowerCase();
  const to = filters.to?.trim().toLowerCase();
  const matchingFlights = flights.filter(
    (flight) =>
      (!from || flight.route.toLowerCase().includes(from)) &&
      (!to || flight.route.toLowerCase().includes(to))
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-green-900">Flights</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matchingFlights.map((flight) => {
            const bookingParams = new URLSearchParams({
              type: "FLIGHT",
              id: String(flight.id),
            });
            if (filters.date) {
              bookingParams.set("departureDate", filters.date);
            }
            if (filters.passengers) {
              bookingParams.set("guests", filters.passengers);
            }

            return (
            <article
              key={flight.id}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="relative h-56">
                <Image
                  src={flight.image}
                  alt={flight.airline}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-green-900">
                  {flight.airline}
                </h2>
                <p className="mt-2 text-gray-700">{flight.route}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Duration: {flight.duration}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-bold text-green-900">
                    {flight.price} / passenger
                  </span>
                  <Link
                    href={`/booking?${bookingParams.toString()}`}
                    className="rounded-md bg-green-900 px-4 py-2 font-semibold text-white hover:bg-green-800"
                  >
                    Book flight
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>
        {matchingFlights.length === 0 && (
          <p className="mt-8 text-gray-600">
            No flights match those locations. Try a different route.
          </p>
        )}
      </div>
    </main>
  );
}
