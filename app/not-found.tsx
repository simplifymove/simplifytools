import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-center text-gray-900">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Page not found
        </p>
        <h1 className="mt-4 text-3xl font-bold">This page is not available.</h1>
        <p className="mt-4 text-gray-600">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
