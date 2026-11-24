import Link from "next/link";

const bookingOptions = [
  { href: "/safaris", title: "Safari packages", description: "Plan a guided wildlife and lodge experience." },
  { href: "/flights", title: "Flights", description: "Request a flight on a listed route." },
  { href: "/hotels", title: "Hotels and stays", description: "Choose a hotel and send your travel dates." },
  { href: "/car-hire", title: "Car hire", description: "Select a vehicle and request your hire dates." },
];

type ContactsPageProps = {
  searchParams: Promise<{ destination?: string }>;
};

export default async function ContactsPage({
  searchParams,
}: ContactsPageProps) {
  const { destination } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase text-green-700">
          WEMA Safaris
        </p>
        <h1 className="mt-2 text-3xl font-bold text-green-900">
          Contact and booking support
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          {destination
            ? `Planning a trip to ${destination}? Choose the service you need and include your details in the booking request.`
            : "Tell us what you are planning by sending a booking request. Our team will follow up using the contact details you provide."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {bookingOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="border-l-4 border-green-800 bg-white p-5 shadow-sm transition hover:bg-green-50"
            >
              <h2 className="font-semibold text-green-900">{option.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{option.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
