import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to ClipNote 🚀
      </h1>

      <p className="text-lg text-gray-600 mb-6 text-center">
        Your personal note and link saving app.
      </p>

      <div className="flex gap-3">
        <Link
          href="/register"
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Register
        </Link>

        <Link
          href="/login"
          className="border border-black px-4 py-2 rounded-md"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
