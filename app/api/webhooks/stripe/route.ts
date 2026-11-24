import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/app/lib/prisma";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return null;
  }

  return new Stripe(key);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripeClient();

  if (!secret || !stripe) {
    return NextResponse.json({ received: true });
  }

  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      secret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingCode = session.metadata?.bookingCode;

      if (bookingCode) {
        await prisma.booking.updateMany({
          where: { bookingCode },
          data: {
            paymentStatus: "PAID",
            amountDue: 0,
            status: "CONFIRMED",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook verification failed." },
      { status: 400 }
    );
  }
}

function stripeSecretKeyAvailable() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
