"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(userNotes);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddNote = async () => {
    if (!note || !user) return;

    await addDoc(collection(db, "notes"), {
      text: note,
      uid: user.uid,
      createdAt: new Date(),
    });

    setNote("");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "notes", id));
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard 📝</h1>
        <p className="text-sm text-gray-600">
          Logged in as: {user.email}
        </p>

        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note..."
          />
          <button
            onClick={handleAddNote}
            className="bg-black text-white px-4"
          >
            Add
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="border p-3 flex justify-between items-center"
            >
              <span>{n.text}</span>
              <button
                onClick={() => handleDelete(n.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/login");
          }}
          className="mt-4 bg-black text-white p-2"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
