"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDoc, doc, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface MemberInfo {
  uid: string;
  name: string;
  email?: string;
}

export default function AddExpense() {
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  // ✅ safer extraction of groupId (instead of window.location)
  const groupId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[2]
      : "";

  // ✅ Fetch group data + member names
  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;

      const docRef = doc(db, "groups", groupId);
      const snapshot = await getDoc(docRef);
      const data = snapshot.data();

      if (data) {
        setGroup(data);

        // Fetch readable member info
        const memberDocs = await Promise.all(
          data.members.map(async (uid: string) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) {
              const u = userSnap.data();
              return { uid, name: u.name || u.email || uid, email: u.email };
            }
            return { uid, name: uid };
          })
        );
        setMembers(memberDocs);
      }
    };

    loadGroup();
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    // ✅ Always include payer in split
    const finalSplit = Array.from(new Set([...selected, user.uid]));

    await addDoc(collection(db, `groups/${groupId}/expenses`), {
      description,
      amount,
      paidBy: user.uid,
      paidByName: user.displayName,
      splitBetween: finalSplit,
      createdAt: new Date(),
    });

    alert("Expense added successfully!");
    router.push(`/groups/${groupId}`);
  };

  const toggleMember = (uid: string) => {
    setSelected((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  const currentUser = auth.currentUser;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded-lg"
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 w-full rounded-lg"
          required
        />

        {members.length > 0 && (
          <div>
            <p className="font-medium mb-2">Select members to split with:</p>
            {members
              .filter((m) => m.uid !== currentUser?.uid) // ✅ exclude payer
              .map((m) => (
                <label key={m.uid} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.uid)}
                    onChange={() => toggleMember(m.uid)}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
