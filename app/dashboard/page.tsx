"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

type NoteItem = {
  id: string;
  text?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userNotes = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setNotes(userNotes);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddNote = async () => {
    if (!note.trim() || !user) return;

    await addDoc(collection(db, "notes"), {
      text: note.trim(),
      uid: user.uid,
      createdAt: serverTimestamp(),
    });

    setNote("");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "notes", id));
  };

  const handleSave = async () => {
    if (!editingId) return;

    await updateDoc(doc(db, "notes", editingId), {
      text: editingText,
      // optional: updatedAt: serverTimestamp(),
    });

    setEditingId(null);
    setEditingText("");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard 📝</h1>
        <p className="text-sm text-gray-600">Logged in as: {user.email}</p>

        {/* Add note */}
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

        {/* Notes list */}
        <div className="flex flex-col gap-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="border p-3 flex justify-between items-center gap-3"
            >
              {editingId === n.id ? (
                <input
                  className="border p-2 flex-1"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : (
                <span className="flex-1">{n.text}</span>
              )}

              {editingId === n.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                    className="border px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(n.id);
                      setEditingText(n.text ?? "");
                    }}
                    className="border px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
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
