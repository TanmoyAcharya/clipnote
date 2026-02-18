"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          ClipNote ✨
        </Link>

        {!loading && (
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link className="underline" href="/dashboard">
                  Dashboard
                </Link>
                <button
                  className="bg-black text-white px-3 py-1.5 rounded-md"
                  onClick={async () => {
                    await signOut(auth);
                    router.push("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="underline" href="/login">
                  Login
                </Link>
                <Link
                  className="bg-black text-white px-3 py-1.5 rounded-md"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
