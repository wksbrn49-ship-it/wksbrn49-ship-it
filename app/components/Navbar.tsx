import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-green-900/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
       {/* Logo */}
<Link href="/" className="flex items-center">
  <Image
    src="/images/logo/wema-logo.png"
    alt="WEMA Safaris"
    width={220}
    height={70}
    priority
    className="h-16 w-auto"
  />
</Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">
          <Link href="/">Home</Link>
          <Link href="/destinations">Destinations</Link>
          <Link href="/safaris">Safaris</Link>
          <Link href="/hotels">Hotels</Link>
          <Link href="/flights">Flights</Link>
          <Link href="/contacts">Contact</Link>
          <Link href="/car-hire">
  Car Hire
</Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex gap-3">
          <Link
            href="/login"
            className="border border-white px-4 py-2 rounded-lg text-white hover:bg-white hover:text-green-900 transition"
          >
            Login
          </Link>

        </div>

        <details className="relative md:hidden">
          <summary
            aria-label="Open navigation menu"
            className="cursor-pointer list-none text-2xl text-white"
          >
            ☰
          </summary>
          <div className="absolute right-0 mt-3 grid min-w-48 gap-3 rounded-md bg-green-900 p-4 text-white shadow-xl">
            <Link href="/">Home</Link>
            <Link href="/destinations">Destinations</Link>
            <Link href="/safaris">Safaris</Link>
            <Link href="/hotels">Hotels</Link>
            <Link href="/flights">Flights</Link>
            <Link href="/car-hire">Car Hire</Link>
            <Link href="/contacts">Contact</Link>
            <Link href="/login">Admin Login</Link>
          </div>
        </details>
      </div>
    </nav>
  );
}