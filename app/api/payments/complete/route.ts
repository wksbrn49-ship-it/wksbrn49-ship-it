import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  deliverStripePaymentNotifications,
  recordStripePaymentSuccess,
} from "@/app/lib/payment-notifications";

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe payment verification is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (typeof sessionId !== "string" || !sessionId.trim()) {
      return NextResponse.json(
        { error: "Stripe checkout session ID is required." },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Stripe has not confirmed this payment yet." },
        { status: 409 }
      );
    }

    await recordStripePaymentSuccess(session);

    let notificationsPending = false;
    let notificationsSkipped = false;
    try {
      const notifications = await deliverStripePaymentNotifications(session);
      notificationsPending = notifications.pending;
      notificationsSkipped = notifications.skipped;
    } catch (error) {
      console.error("Payment confirmation notification delivery failed:", error);
      notificationsPending = true;
    }

    return NextResponse.json({
      success: true,
      notificationsPending,
      notificationsSkipped,
    });
  } catch (error) {
    console.error("Unable to verify Stripe payment:", error);
    return NextResponse.json(
      { error: "Unable to verify and complete this payment." },
      { status: 500 }
    );
  }
}
