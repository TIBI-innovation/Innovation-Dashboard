import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          This page is a placeholder for login functionality.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white text-center hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
