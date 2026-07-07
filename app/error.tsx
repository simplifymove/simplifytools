'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <main className="min-h-screen bg-white px-6 py-24 text-center text-gray-900">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl font-bold">We could not load this page.</h1>
        <p className="mt-4 text-gray-600">
          Please try again. If the problem continues, contact info@simplifyconvert.com.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
