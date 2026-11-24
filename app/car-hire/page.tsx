"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cars } from "@/app/data/cars";
import { calculateOnDemandRideFare } from "@/app/lib/car-hire-pricing";

function CarHireBookingForm() {
  const searchParams = useSearchParams();

  const carId = Number(searchParams.get("carId"));
  const [selectedCarId, setSelectedCarId] = useState(
    cars.some((car) => car.id === carId) ? carId : cars[0].id
  );

  const selectedCar =
    cars.find((car) => car.id === selectedCarId) || cars[0];

  const [serviceType, setServiceType] = useState<"DAILY_HIRE" | "ON_DEMAND_RIDE">("DAILY_HIRE");
  const [driverOption, setDriverOption] = useState<"SELF_DRIVE" | "WITH_DRIVER">("SELF_DRIVE");
  const [passengers, setPassengers] = useState(1);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [estimatingRoute, setEstimatingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");
  const [depositAmount, setDepositAmount] = useState(
    Math.min(selectedCar.price, selectedCar.price * 0.5)
  );
  const [submitted, setSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calculateDays = () => {
    if (!pickupDate || !returnDate) {
      return 1;
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    const difference =
      end.getTime() - start.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return days > 0 ? days : 1;
  };

  const days = calculateDays();

  const isOnDemandRide = serviceType === "ON_DEMAND_RIDE";
  const validDistanceKm =
    distanceKm !== null &&
    Number.isFinite(distanceKm) &&
    distanceKm > 0
    ? distanceKm
    : null;
  const validDurationMinutes =
    durationMinutes !== null &&
    Number.isInteger(durationMinutes) &&
    durationMinutes > 0
      ? durationMinutes
      : null;
  const hasValidRideEstimate =
    validDistanceKm !== null && validDurationMinutes !== null;
  const rideFare =
    validDistanceKm !== null && validDurationMinutes !== null
      ? calculateOnDemandRideFare(validDistanceKm, validDurationMinutes)
    : 0;
  const totalPrice = isOnDemandRide ? rideFare : selectedCar.price * days;

  const passengersExceeded =
    passengers > selectedCar.passengers;

  const handleEstimateRoute = async () => {
    setRouteError("");

    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      setRouteError("Enter both pickup and destination before estimating the route.");
      return;
    }

    setEstimatingRoute(true);
    try {
      const response = await fetch("/api/car-hire/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: pickupLocation,
          destination: dropoffLocation,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setRouteError(
          result?.error ?? "Unable to estimate this route. Enter the distance and duration manually."
        );
        return;
      }

      setDistanceKm(result.distanceKm);
      setDurationMinutes(result.durationMinutes);
    } catch {
      setRouteError("Unable to connect. Enter the distance and duration manually.");
    } finally {
      setEstimatingRoute(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (passengersExceeded) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const normalizedDeposit = isOnDemandRide
      ? Math.round(totalPrice * 0.5)
      : Math.max(0, Math.min(depositAmount, totalPrice));

    if (!isOnDemandRide && new Date(returnDate) <= new Date(pickupDate)) {
      setError("The return date must be after the pickup date.");
      return;
    }

    if (isOnDemandRide && !hasValidRideEstimate) {
      setError("Estimate the route or enter its distance and duration before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
          },
          type: "CAR_HIRE",
          totalAmount: totalPrice,
          currency: "KES",
          paymentMethod,
          depositAmount: normalizedDeposit,
          carHire: {
            vehicleName: selectedCar.name,
            pickupLocation,
            dropoffLocation,
            pickupDate,
            dropoffDate: isOnDemandRide ? null : returnDate,
            passengers,
            serviceType,
            driverOption: isOnDemandRide ? "WITH_DRIVER" : driverOption,
            distanceKm: isOnDemandRide ? distanceKm : null,
            durationMinutes: isOnDemandRide ? durationMinutes : null,
            specialRequests: formData.get("specialRequests"),
          },
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.error ?? "Unable to submit your booking request.");
        return;
      }

      setBookingCode(result?.booking?.bookingCode ?? "");
      setSubmitted(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 pt-32">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-xl">

          <div className="text-6xl">
            ✅
          </div>

          <h1 className="mt-6 text-3xl font-bold text-green-900">
            Booking Request Received
          </h1>

          <p className="mt-4 text-gray-600">
            Thank you for choosing WEMA Safaris.
            Our team will contact you shortly to
            confirm your car hire booking.
          </p>

          {bookingCode && (
            <p className="mt-4 font-semibold text-green-900">
              Booking reference: {bookingCode}
            </p>
          )}

          <div className="mt-6 rounded-xl bg-green-50 p-5 text-left">

            <p className="text-sm text-gray-500">
              Vehicle
            </p>

            <p className="font-bold text-green-900">
              {selectedCar.name}
            </p>

            {isOnDemandRide ? (
              <>
                <p className="mt-3 text-sm text-gray-500">Route estimate</p>
                <p className="font-semibold">
                  {distanceKm && durationMinutes
                    ? `${distanceKm} km · ${durationMinutes} min`
                    : "Not estimated"}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-gray-500">Hire Duration</p>
                <p className="font-semibold">
                  {days} {days === 1 ? "day" : "days"}
                </p>
              </>
            )}

            <p className="mt-3 text-sm text-gray-500">
              Estimated Total
            </p>

            <p className="text-xl font-bold text-green-800">
              KSh {totalPrice.toLocaleString()}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-8 rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            Make Another Booking
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-16 pt-32">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold text-green-900">
            Car Hire Booking
          </h1>

          <p className="mt-3 text-gray-600">
            Complete your details to request your vehicle.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-xl md:p-10"
        >

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Choose a service
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setServiceType("DAILY_HIRE");
                  setDriverOption("SELF_DRIVE");
                  setPickupDate("");
                  setReturnDate("");
                }}
                aria-pressed={!isOnDemandRide}
                className={`rounded-xl border p-5 text-left ${!isOnDemandRide ? "border-green-800 bg-green-50" : "border-gray-200 hover:border-green-700"}`}
              >
                <span className="block font-semibold text-gray-900">Daily car hire</span>
                <span className="mt-1 block text-sm text-gray-600">
                  Choose a vehicle for a multi-day hire.
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceType("ON_DEMAND_RIDE");
                  setDriverOption("WITH_DRIVER");
                  setPickupDate("");
                  setReturnDate("");
                }}
                aria-pressed={isOnDemandRide}
                className={`rounded-xl border p-5 text-left ${isOnDemandRide ? "border-green-800 bg-green-50" : "border-gray-200 hover:border-green-700"}`}
              >
                <span className="block font-semibold text-gray-900">Ride with a driver</span>
                <span className="mt-1 block text-sm text-gray-600">
                  Request a one-way, driver-operated ride.
                </span>
              </button>
            </div>
          </section>

          {/* Selected Vehicle */}
          <section className="mb-8 rounded-2xl bg-green-50 p-6">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-semibold text-green-700">
                  Selected Vehicle
                </p>

                <label className="mt-3 block text-sm font-medium text-gray-700">
                  Choose a vehicle
                  <select
                    value={selectedCarId}
                    onChange={(event) =>
                      setSelectedCarId(Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {isOnDemandRide
                          ? `${car.name} - ${car.passengers} passengers`
                          : `${car.name} - KSh ${car.price.toLocaleString()} / day`}
                      </option>
                    ))}
                  </select>
                </label>

                <h2 className="mt-1 text-2xl font-bold text-green-900">
                  {selectedCar.name}
                </h2>

                <p className="mt-2 font-semibold text-gray-800">
                  {selectedCar.type}
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    👥 {selectedCar.passengers} passengers
                  </span>

                  <span>
                    ⚙️ {selectedCar.transmission}
                  </span>
                </div>

              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  {isOnDemandRide ? "Fare estimate" : "Price per day"}
                </p>

                <p className="text-xl font-bold text-green-800">
                  {isOnDemandRide
                    ? totalPrice > 0
                      ? `KSh ${totalPrice.toLocaleString()}`
                      : "Enter route details"
                    : `KSh ${selectedCar.price.toLocaleString()}`}
                </p>

                {isOnDemandRide ? (
                  <p className="mt-3 text-xs text-gray-500">
                    KSh 200 base + KSh 50/km + KSh 5/min, plus 10%.
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-gray-500">Hire Duration</p>
                    <p className="font-semibold text-gray-900">
                      {days} {days === 1 ? "day" : "days"}
                    </p>
                  </>
                )}

                <div className="mt-3 border-t border-gray-200 pt-3">

                  <p className="text-sm text-gray-500">
                    Estimated Total
                  </p>

                  <p className="text-2xl font-bold text-green-900">
                    {isOnDemandRide && !hasValidRideEstimate
                      ? "Add route details"
                      : `KSh ${totalPrice.toLocaleString()}`}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* Customer Information */}
          <section>

            <h2 className="mb-5 text-2xl font-bold text-gray-900">
              Customer Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+254 7XX XXX XXX"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Number of Passengers
                </label>

                <input
                  type="number"
                  min="1"
                  max="50"
                  value={passengers}
                  onChange={(e) =>
                    setPassengers(Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />

                <p className="mt-2 text-xs text-gray-500">
                  This vehicle accommodates up to{" "}
                  {selectedCar.passengers} passengers.
                </p>
              </div>

            </div>

            {passengersExceeded && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                This vehicle accommodates up to{" "}
                <strong>{selectedCar.passengers}</strong>{" "}
                passengers. For larger groups, we&apos;ll need
                to arrange additional or larger vehicles.
              </div>
            )}

          </section>

          {/* Hire Details */}
          <section className="mt-10">

            <h2 className="mb-5 text-2xl font-bold text-gray-900">
              Hire Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Pickup Location
                </label>

                <input
                  name="pickupLocation"
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(event) => {
                    setPickupLocation(event.target.value);
                    setDistanceKm(null);
                    setDurationMinutes(null);
                    setRouteError("");
                  }}
                  placeholder="e.g. Nairobi"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Dropoff Location
                </label>

                <input
                  name="dropoffLocation"
                  type="text"
                  required
                  value={dropoffLocation}
                  onChange={(event) => {
                    setDropoffLocation(event.target.value);
                    setDistanceKm(null);
                    setDurationMinutes(null);
                    setRouteError("");
                  }}
                  placeholder="e.g. Mombasa"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Pickup Date
                </label>

                <input
                  name="pickupDate"
                  type={isOnDemandRide ? "datetime-local" : "date"}
                  required
                  value={pickupDate}
                  onChange={(e) =>
                    setPickupDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              {!isOnDemandRide && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Return Date
                  </label>

                  <input
                    name="returnDate"
                    type="date"
                    required
                    min={pickupDate || undefined}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                  />
                </div>
              )}

            </div>

            {isOnDemandRide && (
              <div className="mt-6 rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Route and fare estimate</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Estimate with Google Maps or enter road distance and travel time manually.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEstimateRoute}
                    disabled={estimatingRoute}
                    className="rounded-lg border border-green-800 px-4 py-2 font-semibold text-green-900 hover:bg-green-50 disabled:opacity-60"
                  >
                    {estimatingRoute ? "Estimating..." : "Estimate with Google Maps"}
                  </button>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Road distance (km)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      required
                      value={distanceKm ?? ""}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDistanceKm(
                          event.target.value && Number.isFinite(value) && value > 0
                            ? value
                            : null
                        );
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Estimated travel time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={durationMinutes ?? ""}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDurationMinutes(
                          event.target.value && Number.isInteger(value) && value > 0
                            ? value
                            : null
                        );
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                    />
                  </div>
                </div>

                {routeError && (
                  <p role="status" className="mt-3 text-sm text-amber-800">
                    {routeError}
                  </p>
                )}

                {totalPrice > 0 && (
                  <p className="mt-4 font-semibold text-green-900">
                    Estimated ride fare: KSh {totalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            )}

          </section>

          {/* Driver Preference */}
          {!isOnDemandRide ? (
            <section className="mt-10">

            <h2 className="mb-5 text-2xl font-bold text-gray-900">
              Driver Option
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-green-700">

                <input
                  type="radio"
                  name="driver"
                  value="SELF_DRIVE"
                  checked={driverOption === "SELF_DRIVE"}
                  onChange={() => setDriverOption("SELF_DRIVE")}
                  className="mt-1"
                />

                <div>
                  <p className="font-semibold text-gray-900">
                    Self Drive
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Drive the vehicle yourself.
                  </p>
                </div>

              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-green-700">

                <input
                  type="radio"
                  name="driver"
                  value="WITH_DRIVER"
                  checked={driverOption === "WITH_DRIVER"}
                  onChange={() => setDriverOption("WITH_DRIVER")}
                  className="mt-1"
                />

                <div>
                  <p className="font-semibold text-gray-900">
                    With Driver
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Request a professional driver.
                  </p>
                </div>

              </label>

            </div>

            </section>
          ) : (
            <section className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              A professional driver is included. Driver ratings will be shared once a driver is assigned.
            </section>
          )}

          {/* Special Requests */}
          <section className="mt-10">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Special Requests
            </label>

            <textarea
              name="specialRequests"
              rows={4}
              placeholder="Tell us about any special requirements..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />

          </section>

          {/* Submit */}
          <div className="mt-10 border-t border-gray-200 pt-8">

            {error && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                passengersExceeded ||
                submitting ||
                (isOnDemandRide && !hasValidRideEstimate)
              }
              className="w-full rounded-lg bg-green-900 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting
                ? "Submitting..."
                : isOnDemandRide
                  ? "Request Ride"
                  : "Submit Car Hire Request"}
            </button>

            <p className="mt-3 text-center text-sm text-gray-500">
              Your booking is a request and will be confirmed by
              WEMA Safaris.
            </p>

          </div>

        </form>

      </div>

    </main>
  );
}

export default function CarHireBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 pt-32">
          <p className="text-gray-600">Loading car hire booking...</p>
        </main>
      }
    >
      <CarHireBookingForm />
    </Suspense>
  );
}