"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";

type MemberInfo = {
  uid: string;
  name?: string;
  email?: string;
};

export default function AddExpensePage() {
  const { groupId } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [group, setGroup] = useState<any | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth watcher
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // Fetch group & members (readable names)
  useEffect(() => {
    const load = async () => {
      if (!groupId) return;
      setLoading(true);
      try {
        const groupRef = doc(db, "groups", groupId as string);
        const gSnap = await getDoc(groupRef);
        if (!gSnap.exists()) {
          setError("Group not found.");
          setLoading(false);
          return;
        }
        const gData = gSnap.data();
        setGroup({ id: gSnap.id, ...gData });

        // Map UIDs -> member info (name/email) from users collection
        const mems: MemberInfo[] = await Promise.all(
          (gData.members || []).map(async (uid: string) => {
            try {
              const uSnap = await getDoc(doc(db, "users", uid));
              if (uSnap.exists()) {
                const d = uSnap.data();
                return { uid, name: d.name || d.email || uid, email: d.email };
              }
            } catch {
              /* ignore, fallback below */
            }
            return { uid, name: uid };
          })
        );

        setMembers(mems);

        // Preselect none; we'll always include payer when saving
        setSelected([]);

      } catch (e) {
        console.error("Failed loading group:", e);
        setError("Failed to load group.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [groupId]);

  // Toggle member selection
  const toggleMember = (uid: string) => {
    setSelected((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError("Please sign in to add an expense.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }
    const numericAmount = typeof amount === "string" && amount !== "" ? Number(amount) : amount;
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    setSubmitting(true);

    try {
      // final splitBetween always includes payer
      const finalSplit = Array.from(new Set([...selected, currentUser.uid]));

      await addDoc(collection(db, `groups/${groupId}/expenses`), {
        description: description.trim(),
        amount: numericAmount,
        paidBy: currentUser.uid,
        paidByName: currentUser.displayName || currentUser.email || "Unknown",
        splitBetween: finalSplit,
        createdAt: Timestamp.now(), // firestore timestamp
      });

      // redirect back to group page
      router.push(`/groups/${groupId}`);
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth || loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push(`/groups/${groupId}`)}>Back to group</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. Dinner, Taxi, Groceries"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount === "" ? "" : amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border rounded p-2"
            placeholder="Amount (e.g. 250.50)"
            required
          />
        </div>

        <div>
          <p className="font-medium mb-2">Select members to split with</p>
          {members.length === 0 ? (
            <p className="text-sm text-gray-600">No other members found.</p>
          ) : (
            <div className="space-y-2">
              {members
                .filter((m) => m.uid !== currentUser?.uid) // exclude payer
                .map((m) => (
                  <label key={m.uid} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(m.uid)}
                      onChange={() => toggleMember(m.uid)}
                    />
                    <span className="text-sm">{m.name || m.email || m.uid}</span>
                  </label>
                ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Note: you (the payer) are included automatically in the split.
          </p>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Adding..." : "Add Expense"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/groups/${groupId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
