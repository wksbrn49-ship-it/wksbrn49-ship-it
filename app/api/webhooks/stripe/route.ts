import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  deliverStripePaymentNotifications,
  recordStripePaymentSuccess,
} from "@/app/lib/payment-notifications";

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
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      secret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook verification failed." },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid" && session.metadata?.bookingCode) {
        await recordStripePaymentSuccess(session);
        await deliverStripePaymentNotifications(session);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json(
      { error: "Unable to process Stripe event." },
      { status: 500 }
    );
  }
}
