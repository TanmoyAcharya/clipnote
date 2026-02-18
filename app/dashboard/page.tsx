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

type ClipItem = {
  id: string;
  url?: string;
  title?: string;
  note?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Notes state
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Clips state
  const [clipUrl, setClipUrl] = useState("");
  const [clipTitle, setClipTitle] = useState("");
  const [clipNote, setClipNote] = useState("");
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [clipsLoading, setClipsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Notes real-time listener
  useEffect(() => {
    if (!user) return;

    setNotesLoading(true);

    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userNotes = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setNotes(userNotes);
        setNotesLoading(false);
      },
      (error) => {
        console.error("Notes snapshot error:", error);
        setNotesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Clips real-time listener
  useEffect(() => {
    if (!user) return;

    setClipsLoading(true);

    const q = query(
      collection(db, "clips"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userClips = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setClips(userClips);
        setClipsLoading(false);
      },
      (error) => {
        console.error("Clips snapshot error:", error);
        setClipsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Notes actions
  const handleAddNote = async () => {
    if (!note.trim() || !user) return;

    await addDoc(collection(db, "notes"), {
      text: note.trim(),
      uid: user.uid,
      createdAt: serverTimestamp(),
    });

    setNote("");
  };

  const handleDeleteNote = async (id: string) => {
    await deleteDoc(doc(db, "notes", id));
  };

  const handleSaveNote = async () => {
    if (!editingId) return;

    await updateDoc(doc(db, "notes", editingId), {
      text: editingText.trim(),
      // updatedAt: serverTimestamp(),
    });

    setEditingId(null);
    setEditingText("");
  };

  // Clips actions
  const handleAddClip = async () => {
    if (!user) return;
    if (!clipUrl.trim()) return;

    let url = clipUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const title = clipTitle.trim() || url;

    await addDoc(collection(db, "clips"), {
      uid: user.uid,
      url,
      title,
      note: clipNote.trim(),
      createdAt: serverTimestamp(),
    });

    setClipUrl("");
    setClipTitle("");
    setClipNote("");
  };

  const handleDeleteClip = async (id: string) => {
    await deleteDoc(doc(db, "clips", id));
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

  return (
    <main className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard 📝</h1>
        <p className="text-sm text-gray-600">Logged in as: {user.email}</p>

        {/* NOTES */}
        <section className="border rounded-xl p-4 bg-white flex flex-col gap-3">
          <h2 className="text-xl font-bold">Notes</h2>

          <div className="flex gap-2">
            <input
              className="border p-2 flex-1 rounded"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a note..."
            />
            <button
              onClick={handleAddNote}
              className="bg-black text-white px-4 rounded"
            >
              Add
            </button>
          </div>

          {notesLoading ? (
            <div className="border p-3 rounded">Loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="border p-3 rounded">No notes yet — add one above 👆</div>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="border p-3 rounded flex justify-between items-center gap-3"
                >
                  {editingId === n.id ? (
                    <input
                      className="border p-2 flex-1 rounded"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                  ) : (
                    <span className="flex-1">{n.text}</span>
                  )}

                  {editingId === n.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNote}
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
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CLIPS */}
        <section className="border rounded-xl p-4 bg-white flex flex-col gap-3">
          <h2 className="text-xl font-bold">Clips 🔗</h2>

          <div className="flex flex-col gap-2">
            <input
              className="border p-2 rounded"
              value={clipUrl}
              onChange={(e) => setClipUrl(e.target.value)}
              placeholder="Paste a link (example.com/article)"
            />
            <input
              className="border p-2 rounded"
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
              placeholder="Title (optional)"
            />
            <input
              className="border p-2 rounded"
              value={clipNote}
              onChange={(e) => setClipNote(e.target.value)}
              placeholder="Note (optional)"
            />
            <button
              onClick={handleAddClip}
              className="bg-black text-white p-2 rounded"
            >
              Save Clip
            </button>
          </div>

          {clipsLoading ? (
            <div className="border p-3 rounded">Loading clips…</div>
          ) : clips.length === 0 ? (
            <div className="border p-3 rounded">No clips yet — add one above 👆</div>
          ) : (
            <div className="flex flex-col gap-2">
              {clips.map((c) => (
                <div
                  key={c.id}
                  className="border p-3 rounded flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline break-all"
                    >
                      {c.title || c.url}
                    </a>
                    {c.note ? (
                      <p className="text-sm text-gray-600 mt-1">{c.note}</p>
                    ) : null}
                  </div>

                  <button
                    onClick={() => handleDeleteClip(c.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={async () => {
            await signOut(auth);
            router.push("/login");
          }}
          className="bg-black text-white p-2 rounded"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
