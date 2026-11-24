"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentState, setPaymentState] = useState<
    "verifying" | "confirmed" | "failed"
  >("verifying");

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let active = true;

    async function verifyPayment() {
      try {
        const response = await fetch("/api/payments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const result = (await response.json().catch(() => null)) as {
          error?: string;
          notificationsPending?: boolean;
          notificationsSkipped?: boolean;
        } | null;

        if (!response.ok) {
          throw new Error(result?.error ?? "Unable to verify your payment.");
        }

        if (active) {
          setPaymentState("confirmed");
          setMessage(
            result?.notificationsPending
              ? "Payment confirmed. Your email or SMS confirmation is queued for delivery."
              : result?.notificationsSkipped
                ? "Payment confirmed and email sent. SMS could not be sent because no phone number is on the booking."
                : "Payment confirmed. A confirmation has been sent to your email and phone."
          );
        }
      } catch (error) {
        if (active) {
          setPaymentState("failed");
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to verify your payment. Please contact WEMA Safaris."
          );
        }
      }
    }

    void verifyPayment();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-green-50 px-6 py-24">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-xl">
        <div className="text-6xl">✅</div>
        <h1 className="mt-6 text-3xl font-bold text-green-900">
          {!sessionId || paymentState === "failed"
            ? "Payment verification"
            : paymentState === "verifying"
              ? "Verifying payment"
              : "Payment confirmed"}
        </h1>
        <p className="mt-4 text-gray-600">
          {sessionId
            ? message
            : "We could not verify this payment. Please contact WEMA Safaris."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-800"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50" />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
