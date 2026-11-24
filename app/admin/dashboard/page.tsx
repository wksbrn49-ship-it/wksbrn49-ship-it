import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { name: true, email: true },
  });

  if (!admin) {
    redirect("/login");
  }

  const totalBookings = await prisma.booking.count();
  const pendingBookings = await prisma.booking.count({
    where: { status: "PENDING" },
  });
  const totalCustomers = await prisma.customer.count();

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-xl bg-green-900 p-6 text-white">
          <h1 className="text-3xl font-bold">
            WEMA SAFARIS
          </h1>
          <p className="mt-2">
            Administrator Dashboard
          </p>
          <p className="mt-3 text-sm text-green-100">
            Welcome, {admin.name}
          </p>
        </header>

        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Dashboard Overview
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Total Bookings</p>
            <p className="mt-3 text-3xl font-bold text-green-900">
              {totalBookings}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Pending Bookings</p>
            <p className="mt-3 text-3xl font-bold text-orange-600">
              {pendingBookings}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Total Customers</p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
              {totalCustomers}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/bookings"
            className="rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            Manage Bookings
          </Link>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}