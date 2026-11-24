import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingCode } = body;

    if (!bookingCode || typeof bookingCode !== "string") {
      return NextResponse.json(
        { error: "Booking code is required." },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.updateMany({
      where: { bookingCode: String(bookingCode) },
      data: {
        paymentStatus: "PAID",
        amountDue: 0,
        status: "CONFIRMED",
      },
    });

    if (updatedBooking.count === 0) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking marked as paid successfully.",
    });
  } catch (error) {
    console.error("Unable to complete payment:", error);
    return NextResponse.json(
      { error: "Unable to complete payment." },
      { status: 500 }
    );
  }
}
