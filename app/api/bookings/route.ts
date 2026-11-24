import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/app/lib/prisma";
import { calculateOnDemandRideFare } from "@/app/lib/car-hire-pricing";

const bookingTypes = ["SAFARI", "FLIGHT", "HOTEL", "CAR_HIRE"] as const;
const paymentMethods = ["CARD", "MOBILE_MONEY", "BANK_TRANSFER", "CASH"] as const;

function validDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer,
      type,
      totalAmount,
      currency = "KES",
      paymentMethod,
      depositAmount,
      safari,
      flight,
      hotel,
      carHire,
      passengers = [],
    } = body;

    // Validate customer details
    if (
      !customer ||
      typeof customer.name !== "string" ||
      !customer.name.trim() ||
      typeof customer.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
    ) {
      return NextResponse.json(
        { error: "Valid customer name and email are required." },
        { status: 400 }
      );
    }

    if (
      !bookingTypes.includes(type) ||
      typeof totalAmount !== "number" ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid booking type or total amount." },
        { status: 400 }
      );
    }

    const normalizedPaymentMethod =
      typeof paymentMethod === "string"
        ? paymentMethod.trim().toUpperCase()
        : "CARD";

    if (!paymentMethods.includes(normalizedPaymentMethod as (typeof paymentMethods)[number])) {
      return NextResponse.json(
        { error: "Please select a valid payment method." },
        { status: 400 }
      );
    }

    const parsedDepositAmount =
      typeof depositAmount === "number"
        ? depositAmount
        : typeof depositAmount === "string" && depositAmount.trim() !== ""
          ? Number(depositAmount)
          : 0;

    if (!Number.isFinite(parsedDepositAmount) || parsedDepositAmount < 0) {
      return NextResponse.json(
        { error: "Deposit amount must be zero or a valid positive number." },
        { status: 400 }
      );
    }

    if (parsedDepositAmount > totalAmount) {
      return NextResponse.json(
        { error: "Deposit cannot be greater than the booking total." },
        { status: 400 }
      );
    }

    const amountDue = Math.max(totalAmount - parsedDepositAmount, 0);
    const paymentStatus =
      parsedDepositAmount <= 0
        ? "PENDING"
        : parsedDepositAmount >= totalAmount
          ? "PAID"
          : "PARTIAL";

    if (!Array.isArray(passengers)) {
      return NextResponse.json(
        { error: "Passengers must be an array." },
        { status: 400 }
      );
    }

    // Prepare the selected booking details
    let bookingDetails: Record<string, unknown>;

    if (type === "SAFARI") {
      const startDate = validDate(safari?.startDate);
      const endDate = validDate(safari?.endDate);

      if (
        !safari?.safariName ||
        !safari?.destination ||
        !startDate ||
        !endDate ||
        endDate <= startDate
      ) {
        return NextResponse.json(
          { error: "Valid safari details and dates are required." },
          { status: 400 }
        );
      }

      bookingDetails = {
        safari: {
          create: {
            safariName: safari.safariName,
            destination: safari.destination,
            startDate,
            endDate,
            adults: safari.adults ?? 1,
            children: safari.children ?? 0,
          },
        },
      };
    } else if (type === "FLIGHT") {
      const departureDate = validDate(flight?.departureDate);
      const returnDate = flight?.returnDate
        ? validDate(flight.returnDate)
        : null;

      if (
        !flight?.airline ||
        !flight?.departure ||
        !flight?.arrival ||
        !flight?.tripType ||
        !departureDate ||
        (flight.returnDate && !returnDate)
      ) {
        return NextResponse.json(
          { error: "Valid flight details are required." },
          { status: 400 }
        );
      }

      bookingDetails = {
        flight: {
          create: {
            airline: flight.airline,
            departure: flight.departure,
            arrival: flight.arrival,
            departureDate,
            returnDate,
            tripType: flight.tripType,
          },
        },
      };
    } else if (type === "HOTEL") {
      const checkIn = validDate(hotel?.checkIn);
      const checkOut = validDate(hotel?.checkOut);

      if (
        !hotel?.hotelName ||
        !hotel?.location ||
        !checkIn ||
        !checkOut ||
        checkOut <= checkIn
      ) {
        return NextResponse.json(
          { error: "Valid hotel details are required." },
          { status: 400 }
        );
      }

      bookingDetails = {
        hotel: {
          create: {
            hotelName: hotel.hotelName,
            location: hotel.location,
            checkIn,
            checkOut,
            rooms: hotel.rooms ?? 1,
            guests: hotel.guests ?? 1,
          },
        },
      };
    } else {
      const pickupDate = validDate(carHire?.pickupDate);
      const dropoffDate = validDate(carHire?.dropoffDate);
      const serviceType =
        typeof carHire?.serviceType === "string"
          ? carHire.serviceType
          : "DAILY_HIRE";
      const driverOption =
        typeof carHire?.driverOption === "string"
          ? carHire.driverOption
          : "SELF_DRIVE";
      const isOnDemandRide = serviceType === "ON_DEMAND_RIDE";
      const distanceKm =
        typeof carHire?.distanceKm === "number"
          ? carHire.distanceKm
          : Number.NaN;
      const durationMinutes =
        typeof carHire?.durationMinutes === "number"
          ? carHire.durationMinutes
          : Number.NaN;
      const specialRequests =
        typeof carHire?.specialRequests === "string"
          ? carHire.specialRequests.trim()
          : "";

      if (
        !carHire?.vehicleName ||
        !carHire?.pickupLocation ||
        !carHire?.dropoffLocation ||
        !pickupDate ||
        !["DAILY_HIRE", "ON_DEMAND_RIDE"].includes(serviceType) ||
        !["SELF_DRIVE", "WITH_DRIVER"].includes(driverOption) ||
        (isOnDemandRide && driverOption !== "WITH_DRIVER") ||
        (!isOnDemandRide &&
          (!dropoffDate || dropoffDate <= pickupDate)) ||
        (isOnDemandRide &&
          (!Number.isFinite(distanceKm) ||
            distanceKm <= 0 ||
            !Number.isInteger(durationMinutes) ||
            durationMinutes <= 0))
      ) {
        return NextResponse.json(
          { error: "Valid car hire details are required." },
          { status: 400 }
        );
      }

      if (specialRequests.length > 1000) {
        return NextResponse.json(
          { error: "Special requests must be 1,000 characters or fewer." },
          { status: 400 }
        );
      }

      if (isOnDemandRide) {
        const expectedFare = calculateOnDemandRideFare(
          distanceKm,
          durationMinutes
        );

        if (totalAmount !== expectedFare) {
          return NextResponse.json(
            { error: "The ride fare does not match the distance and duration estimate." },
            { status: 400 }
          );
        }
      }

      bookingDetails = {
        carHire: {
          create: {
            vehicleName: carHire.vehicleName,
            pickupLocation: carHire.pickupLocation,
            dropoffLocation: carHire.dropoffLocation,
            pickupDate,
            dropoffDate: isOnDemandRide ? null : dropoffDate,
            passengers: carHire.passengers ?? 1,
            serviceType,
            driverOption,
            distanceKm: isOnDemandRide ? distanceKm : null,
            durationMinutes: isOnDemandRide ? durationMinutes : null,
            specialRequests: specialRequests || null,
          },
        },
      };
    }

    // Validate passenger records
    for (const passenger of passengers) {
      if (
        typeof passenger.firstName !== "string" ||
        !passenger.firstName.trim() ||
        typeof passenger.lastName !== "string" ||
        !passenger.lastName.trim()
      ) {
        return NextResponse.json(
          { error: "Every passenger needs a first and last name." },
          { status: 400 }
        );
      }
    }

    // Save customer and booking in one transaction
    const result = await prisma.$transaction(async (tx) => {
      const savedCustomer = await tx.customer.upsert({
        where: { email: customer.email.trim().toLowerCase() },
        update: {
          name: customer.name.trim(),
          phone: customer.phone || null,
        },
        create: {
          name: customer.name.trim(),
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone || null,
        },
      });

      const booking = await tx.booking.create({
        data: {
          bookingCode: `WEMA-${randomUUID().slice(0, 8).toUpperCase()}`,
          customerId: savedCustomer.id,
          type,
          totalAmount,
          currency,
          paymentMethod: normalizedPaymentMethod,
          paymentStatus,
          depositAmount: parsedDepositAmount,
          amountDue,
          ...bookingDetails,
          passengers: {
            create: passengers.map((p: {
              firstName: string;
              lastName: string;
              email?: string;
              phone?: string;
              age?: number;
            }) => ({
              firstName: p.firstName.trim(),
              lastName: p.lastName.trim(),
              email: p.email || null,
              phone: p.phone || null,
              age: p.age ?? null,
            })),
          },
        },
        include: {
          customer: true,
          safari: true,
          flight: true,
          hotel: true,
          carHire: true,
          passengers: true,
        },
      });

      return booking;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully.",
        booking: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);

    return NextResponse.json(
      { error: "Unable to create booking. Please try again." },
      { status: 500 }
    );
  }
}