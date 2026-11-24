export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-amber-50 px-6 py-24">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-xl">
        <div className="text-6xl">⚠️</div>
        <h1 className="mt-6 text-3xl font-bold text-amber-900">Payment cancelled</h1>
        <p className="mt-4 text-gray-600">
          Your payment was not completed. You can try again from your booking form.
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-amber-700 px-6 py-3 font-semibold text-white hover:bg-amber-800"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}
