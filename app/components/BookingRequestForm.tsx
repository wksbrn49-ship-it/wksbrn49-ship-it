"use client";

import { FormEvent, useState } from "react";

type BookingType = "SAFARI" | "HOTEL" | "FLIGHT";

export type BookingRequestConfig = {
  type: BookingType;
  name: string;
  location: string;
  price: number;
  currency: string;
  route?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialGuests?: number;
};

type BookingRequestFormProps = {
  booking: BookingRequestConfig;
};

function nightsBetween(start: string, end: string) {
  const nights = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return nights > 0 ? nights : 1;
}

export default function BookingRequestForm({
  booking,
}: BookingRequestFormProps) {
  const initialPartySize = booking.initialGuests ?? 1;
  const [adults, setAdults] = useState(initialPartySize);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(initialPartySize);
  const [travelers, setTravelers] = useState(
    Array.from({ length: initialPartySize }, () => "")
  );
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");
  const [depositAmount, setDepositAmount] = useState(
    Math.min(booking.price, Math.round(booking.price * 0.5))
  );
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const travelerCount =
    booking.type === "SAFARI"
      ? adults + children
      : booking.type === "HOTEL"
        ? guests
        : guests;

  function resizeTravelers(count: number) {
    setTravelers((current) =>
      Array.from({ length: count }, (_, index) => current[index] ?? "")
    );
  }

  function updateTraveler(index: number, value: string) {
    setTravelers((current) =>
      current.map((traveler, travelerIndex) =>
        travelerIndex === index ? value : traveler
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const passengerRecords = travelers.map((traveler) => {
      const [firstName, ...lastNameParts] = traveler.trim().split(/\s+/);
      return {
        firstName,
        lastName: lastNameParts.join(" "),
      };
    });

    if (passengerRecords.some((passenger) => !passenger.lastName)) {
      setError("Enter each traveler’s first and last name.");
      return;
    }

    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    const departureDate = String(formData.get("departureDate") ?? "");
    const numberOfNights = nightsBetween(startDate, endDate);

    let bookingDetails: Record<string, unknown>;
    let totalAmount: number;

    if (booking.type === "SAFARI") {
      if (new Date(endDate) <= new Date(startDate)) {
        setError("The return date must be after the start date.");
        return;
      }

      totalAmount = booking.price * travelerCount;
      bookingDetails = {
        safari: {
          safariName: booking.name,
          destination: booking.location,
          startDate,
          endDate,
          adults,
          children,
        },
      };
    } else if (booking.type === "HOTEL") {
      if (new Date(endDate) <= new Date(startDate)) {
        setError("Check-out must be after check-in.");
        return;
      }

      totalAmount = booking.price * numberOfNights * rooms;
      bookingDetails = {
        hotel: {
          hotelName: booking.name,
          location: booking.location,
          checkIn: startDate,
          checkOut: endDate,
          rooms,
          guests,
        },
      };
    } else {
      const [departure, arrival] = (booking.route ?? "")
        .split("→")
        .map((place) => place.trim());

      if (!departure || !arrival || !departureDate) {
        setError("Select a valid flight and departure date.");
        return;
      }

      totalAmount = booking.price * travelerCount;
      bookingDetails = {
        flight: {
          airline: booking.name,
          departure,
          arrival,
          departureDate,
          tripType: "ONE_WAY",
        },
      };
    }

    const normalizedDeposit = Math.max(0, Math.min(depositAmount, totalAmount));

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.get("customerName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
          },
          type: booking.type,
          totalAmount,
          currency: booking.currency,
          paymentMethod,
          depositAmount: normalizedDeposit,
          passengers: passengerRecords,
          ...bookingDetails,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.error ?? "Unable to submit your booking request.");
        return;
      }

      setPaymentAmount(totalAmount);
      setBookingCode(result?.booking?.bookingCode ?? "");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompletePayment() {
    if (!bookingCode || !paymentAmount) {
      return;
    }

    setPaymentProcessing(true);
    setPaymentMessage("");

    try {
      const form = document.querySelector("form") as HTMLFormElement | null;
      const customerName = (form?.querySelector('input[name="customerName"]') as HTMLInputElement | null)?.value ?? "Guest";
      const email = (form?.querySelector('input[name="email"]') as HTMLInputElement | null)?.value ?? "guest@example.com";

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode,
          amount: paymentAmount,
          currency: booking.currency,
          paymentMethod,
          customerName,
          email,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setPaymentMessage(result?.error ?? "Payment could not be started.");
        return;
      }

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      const completionResult = await fetch("/api/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode }),
      }).then((res) => res.json().catch(() => null));

      setPaymentMessage(
        completionResult?.message ??
          result?.message ??
          "Demo payment created successfully. Your booking is now awaiting payment confirmation."
      );
    } catch {
      setPaymentMessage("Unable to start payment. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  }

  if (bookingCode) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
        <section className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-green-900">
            Booking request received
          </h1>
          <p className="mt-3 text-gray-600">
            {booking.name} has been added to your booking requests.
          </p>
          <p className="mt-6 text-sm text-gray-500">Booking reference</p>
          <p className="mt-1 text-xl font-bold text-green-900">{bookingCode}</p>

          <div className="mt-6 rounded-xl bg-green-50 p-5 text-left">
            <p className="text-sm text-gray-500">Payment summary</p>
            <p className="mt-2 text-xl font-bold text-green-900">
              {booking.currency} {paymentAmount.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Payment method: {paymentMethod.replace("_", " ")}
            </p>
            <p className="text-sm text-gray-600">
              Deposit: {booking.currency} {depositAmount.toLocaleString()} 
            </p>
          </div>

          {paymentMethod !== "CASH" && (
            <button
              type="button"
              onClick={handleCompletePayment}
              disabled={paymentProcessing}
              className="mt-6 w-full rounded-md bg-green-900 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {paymentProcessing ? "Starting payment..." : "Proceed to payment"}
            </button>
          )}

          {paymentMessage && (
            <p className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
              {paymentMessage}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase text-green-700">
            {booking.type} request
          </p>
          <h1 className="mt-2 text-3xl font-bold text-green-900">
            {booking.name}
          </h1>
          <p className="mt-2 text-gray-600">{booking.location}</p>
          <p className="mt-3 font-semibold text-gray-900">
            {booking.currency} {booking.price.toLocaleString()} per person
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-xl bg-white p-6 shadow-lg md:p-8"
        >
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Contact details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Full name
                <input
                  name="customerName"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700 md:col-span-2">
                Phone
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {booking.type === "FLIGHT" ? "Departure" : "Travel dates"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                {booking.type === "HOTEL"
                  ? "Check-in"
                  : booking.type === "SAFARI"
                    ? "Start date"
                    : "Departure date"}
                <input
                  name={booking.type === "FLIGHT" ? "departureDate" : "startDate"}
                  type="date"
                  required
                  defaultValue={booking.initialStartDate}
                  min={new Date().toISOString().slice(0, 10)}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              {booking.type !== "FLIGHT" && (
                <label className="text-sm font-medium text-gray-700">
                  {booking.type === "HOTEL" ? "Check-out" : "End date"}
                  <input
                    name="endDate"
                    type="date"
                    required
                    defaultValue={booking.initialEndDate}
                    min={new Date().toISOString().slice(0, 10)}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Payment details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Deposit amount ({booking.currency})
                <input
                  type="number"
                  min="0"
                  max={booking.price * 10}
                  step="100"
                  value={depositAmount}
                  onChange={(event) =>
                    setDepositAmount(Math.max(0, Number(event.target.value) || 0))
                  }
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Total due: {booking.currency} {booking.price.toLocaleString()} 
              · Deposit selected: {booking.currency} {depositAmount.toLocaleString()} 
              · Balance: {booking.currency} {Math.max(booking.price - depositAmount, 0).toLocaleString()}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {booking.type === "HOTEL" ? "Rooms and guests" : "Travelers"}
            </h2>

            {booking.type === "SAFARI" ? (
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Adults
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={adults}
                    onChange={(event) => {
                      const count = Math.max(1, Number(event.target.value));
                      setAdults(count);
                      resizeTravelers(count + children);
                    }}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Children
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={children}
                    onChange={(event) => {
                      const count = Math.max(0, Number(event.target.value));
                      setChildren(count);
                      resizeTravelers(adults + count);
                    }}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : booking.type === "HOTEL" ? (
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Rooms
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={rooms}
                    onChange={(event) =>
                      setRooms(Math.max(1, Number(event.target.value)))
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Guests
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guests}
                    onChange={(event) => {
                      const count = Math.max(1, Number(event.target.value));
                      setGuests(count);
                      resizeTravelers(count);
                    }}
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : (
              <label className="mb-5 block max-w-xs text-sm font-medium text-gray-700">
                Passengers
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={guests}
                  onChange={(event) => {
                    const count = Math.max(1, Number(event.target.value));
                    setGuests(count);
                    resizeTravelers(count);
                  }}
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {travelers.map((traveler, index) => (
                <label
                  key={index}
                  className="text-sm font-medium text-gray-700"
                >
                  Traveler {index + 1} full name
                  <input
                    value={traveler}
                    onChange={(event) =>
                      updateTraveler(index, event.target.value)
                    }
                    required
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
              ))}
            </div>
          </section>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-green-900 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Send booking request"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Your request will be confirmed by WEMA Safaris.
          </p>
        </form>
      </div>
    </main>
  );
}