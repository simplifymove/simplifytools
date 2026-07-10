import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminAccessDeniedPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-3">
          Your account is signed in, but it does not have admin access.
        </p>
        <Link
          href="/"
          className="inline-flex mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Back to SimplifyConvert
        </Link>
      </div>
    </main>
  );
}
