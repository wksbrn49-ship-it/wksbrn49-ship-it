
import Image from "next/image";
import Link from "next/link";
import safaris from "@/app/data/safaris";

type SafarisPageProps = {
  searchParams: Promise<{
    destination?: string;
    endDate?: string;
    guests?: string;
    startDate?: string;
  }>;
};

export default async function SafarisPage({
  searchParams,
}: SafarisPageProps) {
  const filters = await searchParams;
  const matchingSafaris = safaris.filter(
    (safari) => !filters.destination || String(safari.id) === filters.destination
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-green-900">
          Safari Packages
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matchingSafaris.map((safari) => (
            <article key={safari.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="relative h-56">
                <Image
                  src={safari.image}
                  alt={safari.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-green-900">
                  {safari.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {safari.location} · {safari.duration}
                </p>
                <p className="mt-4 text-gray-700">{safari.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-bold text-green-900">
                    {safari.price} / person
                  </span>
                  <Link
                    href={`/booking?${new URLSearchParams({
                      type: "SAFARI",
                      id: String(safari.id),
                      ...(filters.startDate && { startDate: filters.startDate }),
                      ...(filters.endDate && { endDate: filters.endDate }),
                      ...(filters.guests && { guests: filters.guests }),
                    }).toString()}`}
                    className="rounded-md bg-green-900 px-4 py-2 font-semibold text-white hover:bg-green-800"
                  >
                    Book now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {matchingSafaris.length === 0 && (
          <p className="mt-8 text-gray-600">
            No safari packages match that destination.
          </p>
        )}
      </div>
    </main>
  );
}