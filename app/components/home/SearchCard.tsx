export default function SearchCard() {
  return (
    <div className="mt-12 bg-white rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto">

      <form action="/safaris" method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <select name="destination" required className="border rounded-lg p-4 outline-none">
          <option value="">Choose a safari</option>
          <option value="1">Maasai Mara</option>
          <option value="2">Amboseli</option>
          <option value="3">Tsavo</option>
        </select>

        <input
          name="startDate"
          type="date"
          required
          className="border rounded-lg p-4"
        />

        <input
          name="endDate"
          type="date"
          required
          className="border rounded-lg p-4"
        />

        <select name="guests" className="border rounded-lg p-4">
          <option value="1">1 guest</option>
          <option value="2">2 guests</option>
          <option value="3">3 guests</option>
          <option value="4">4 guests</option>
          <option value="5">5 guests</option>
        </select>

        <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 rounded-lg font-bold">
          Search
        </button>

      </form>

    </div>
  );
}