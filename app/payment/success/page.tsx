"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const bookingCode = searchParams.get("booking");

    if (!bookingCode) {
      return;
    }

    fetch("/api/payments/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingCode }),
    }).catch(() => undefined);
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-green-50 px-6 py-24">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-xl">
        <div className="text-6xl">✅</div>
        <h1 className="mt-6 text-3xl font-bold text-green-900">Payment successful</h1>
        <p className="mt-4 text-gray-600">
          Your booking has been confirmed and the payment status has been updated.
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-green-900 px-6 py-3 font-semibold text-white hover:bg-green-800"
        >
          Back to homepage
        </a>
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
