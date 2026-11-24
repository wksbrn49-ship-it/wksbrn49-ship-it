import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export default async function AdminBookingsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });

  if (!admin) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      safari: true,
      flight: true,
      hotel: true,
      carHire: true,
      passengers: true,
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-900">
              Booking Management
            </h1>
            <p className="mt-2 text-gray-600">
              View and manage WEMA SAFARIS customer bookings.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-green-900 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {bookings.length}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No bookings found
            </h2>
            <p className="mt-2 text-gray-500">
              Customer bookings will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const details = booking.safari
                ? `${booking.safari.safariName} - ${booking.safari.destination}`
                : booking.flight
                  ? `${booking.flight.departure} to ${booking.flight.arrival}`
                  : booking.hotel
                    ? `${booking.hotel.hotelName} - ${booking.hotel.location}`
                    : booking.carHire
                      ? `${
                          booking.carHire.serviceType === "ON_DEMAND_RIDE"
                            ? "On-demand ride"
                            : booking.carHire.vehicleName
                        } - ${booking.carHire.pickupLocation} to ${booking.carHire.dropoffLocation}`
                      : "No additional details";

              return (
                <div
                  key={booking.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {booking.bookingCode}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Created: {booking.createdAt.toLocaleDateString("en-KE")}
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-semibold text-gray-900">
                        {booking.customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.customer.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.customer.phone || "No phone provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Booking Type</p>
                      <p className="font-semibold text-gray-900">
                        {booking.type.replace("_", " ")}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">Details</p>
                      <p className="font-medium text-gray-800">{details}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-green-900">
                        {booking.currency} {booking.totalAmount.toLocaleString("en-KE")}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Payment: {booking.paymentMethod || "Not selected"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {booking.paymentStatus}
                      </p>
                      <p className="text-sm text-gray-600">
                        Deposit: {booking.currency} {booking.depositAmount.toLocaleString("en-KE")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {booking.currency} {booking.amountDue.toLocaleString("en-KE")}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Passengers: {booking.passengers.length}
                      </p>
                    </div>
                  </div>

                  {booking.safari && (
                    <p className="mt-4 text-sm text-gray-600">
                      Travel dates: {booking.safari.startDate.toLocaleDateString("en-KE")}
                      {" - "}
                      {booking.safari.endDate.toLocaleDateString("en-KE")}
                    </p>
                  )}

                  {booking.hotel && (
                    <p className="mt-4 text-sm text-gray-600">
                      Stay: {booking.hotel.checkIn.toLocaleDateString("en-KE")}
                      {" - "}
                      {booking.hotel.checkOut.toLocaleDateString("en-KE")}
                    </p>
                  )}

                  {booking.carHire && (
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <p>
                        {booking.carHire.serviceType === "ON_DEMAND_RIDE"
                          ? `Ride pickup: ${booking.carHire.pickupDate.toLocaleString("en-KE")}`
                          : `Hire dates: ${booking.carHire.pickupDate.toLocaleDateString("en-KE")} - ${booking.carHire.dropoffDate?.toLocaleDateString("en-KE")}`}
                      </p>
                      <p>
                        Driver option: {booking.carHire.driverOption === "WITH_DRIVER" ? "With driver" : "Self drive"}
                      </p>
                      {booking.carHire.distanceKm !== null &&
                        booking.carHire.durationMinutes !== null && (
                          <p>
                            Estimated route: {booking.carHire.distanceKm} km, {booking.carHire.durationMinutes} min
                          </p>
                        )}
                      {booking.carHire.specialRequests && (
                        <p>Special requests: {booking.carHire.specialRequests}</p>
                      )}
                    </div>
                  )}

                  {booking.flight && (
                    <p className="mt-4 text-sm text-gray-600">
                      Departure date: {booking.flight.departureDate.toLocaleDateString("en-KE")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}