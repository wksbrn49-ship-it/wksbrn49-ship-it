"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { destinations } from "@/app/data/destinations";

const countries = ["All", "Kenya", "Tanzania", "Rwanda", "Uganda"] as const;

export default function DestinationsPage() {
  const [country, setCountry] = useState<(typeof countries)[number]>("All");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const visibleDestinations = destinations.filter((destination) => {
    const matchesCountry = country === "All" || destination.country === country;
    const matchesQuery =
      !normalizedQuery ||
      `${destination.name} ${destination.country} ${destination.description}`
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesCountry && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-white pb-16">
      <section className="relative isolate flex min-h-[360px] items-end overflow-hidden bg-green-950 px-6 pb-12 pt-36 text-white sm:min-h-[420px] sm:pb-16">
        <Image
          src="/images/destinations/Maasai-Mara.png"
          alt="Wildlife grazing across the Maasai Mara plains"
          fill
          priority
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-semibold uppercase text-yellow-300">
            East Africa, up close
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            Find your next destination
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            From open savannah to the Indian Ocean, explore the places that make
            every WEMA Safaris journey distinct.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-950">
              Explore destinations
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {visibleDestinations.length} places to discover
            </p>
          </div>

          <label className="w-full sm:max-w-sm">
            <span className="sr-only">Search destinations</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search places"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/20"
            />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto py-5" aria-label="Filter by country">
          {countries.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={country === option}
              onClick={() => setCountry(option)}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition ${
                country === option
                  ? "bg-green-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {visibleDestinations.length > 0 ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDestinations.map((destination) => (
              <article key={destination.id} className="min-w-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                {"photoCredit" in destination && destination.photoCredit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Photo: <a href={destination.photoCredit.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">{destination.photoCredit.name}</a>
                    {" · "}
                    <a href={destination.photoCredit.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">{destination.photoCredit.license}</a>
                  </p>
                )}
                <div className="flex items-start justify-between gap-4 pt-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {destination.country}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-gray-950">
                      {destination.name}
                    </h3>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-700">
                    ★ {destination.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
                  {destination.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-sm text-gray-600">
                    {destination.price === "Request a quote" ? (
                      destination.price
                    ) : (
                      <>From <strong className="text-gray-950">{destination.price}</strong></>
                    )}
                  </span>
                  <Link
                    href={`/contacts?destination=${encodeURIComponent(destination.name)}`}
                    className="text-sm font-semibold text-green-900 underline decoration-green-800/40 underline-offset-4 hover:decoration-green-900"
                  >
                    Plan a trip
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-gray-600">
            No destinations match your search.
          </p>
        )}
      </section>
    </main>
  );
}
