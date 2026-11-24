import { NextResponse } from "next/server";
import Stripe from "stripe";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingCode,
      amount,
      currency = "KES",
      customerName,
      email,
      paymentMethod,
    } = body;

    if (!bookingCode || !customerName || !email) {
      return NextResponse.json(
        { error: "Booking code, customer name and email are required." },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Valid payment amount is required." },
        { status: 400 }
      );
    }

    if (stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: String(email),
        success_url: `${appUrl}/payment/success?booking=${encodeURIComponent(String(bookingCode))}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/payment/cancelled?booking=${encodeURIComponent(String(bookingCode))}`,
        metadata: {
          bookingCode: String(bookingCode),
          paymentMethod: String(paymentMethod || "CARD"),
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: String(currency).toLowerCase(),
              product_data: {
                name: `WEMA Safaris booking ${String(bookingCode)}`,
              },
              unit_amount: Math.round(numericAmount * 100),
            },
          },
        ],
      });

      return NextResponse.json({
        success: true,
        status: "PENDING_PAYMENT",
        paymentUrl: session.url,
        mode: "stripe",
        message: "Payment session created successfully.",
      });
    }

    return NextResponse.json({
      success: true,
      status: "PENDING_PAYMENT",
      paymentUrl: null,
      mode: "demo",
      message:
        "Demo payment created successfully. Set STRIPE_SECRET_KEY to enable live card payments.",
    });
  } catch (error) {
    console.error("Payment processing failed:", error);
    return NextResponse.json(
      { error: "Unable to process payment. Please try again." },
      { status: 500 }
    );
  }
}
