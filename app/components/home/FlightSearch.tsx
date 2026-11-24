export default function FlightSearch() {
  return (
    <section className="bg-green-900 py-16">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white">
            Search Flights
          </h2>

          <p className="text-green-100 mt-2">
            Find the best flight deals across Kenya and East Africa.
          </p>
        </div>

        <form action="/flights" method="GET" className="bg-white rounded-2xl shadow-xl p-8">

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

            <input
              name="from"
              type="text"
              placeholder="From"
              className="border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <input
              name="to"
              type="text"
              placeholder="To"
              className="border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <input
              name="date"
              type="date"
              className="border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <select
              name="passengers"
              className="border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4+ Passengers</option>
            </select>

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition"
            >
              Search Flights
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}