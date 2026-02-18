"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created! ✅ Now you can log in.");
    } catch (err: any) {
      alert(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-xl border p-6 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Create account</h1>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <input
            className="border rounded-md p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Password</span>
          <input
            className="border rounded-md p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </label>

        <button
          className="rounded-md bg-black text-white p-2 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
