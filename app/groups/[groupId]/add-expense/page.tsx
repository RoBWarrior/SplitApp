"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDoc, doc, addDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

export default function AddExpense() {
  const [group, setGroup] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const groupId = window.location.pathname.split("/")[2];

  useEffect(() => {
    const loadGroup = async () => {
      const docRef = doc(db, "groups", groupId);
      const snapshot = await getDoc(docRef);
      setGroup(snapshot.data());
    };
    loadGroup();
  }, [groupId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, `groups/${groupId}/expenses`), {
      description,
      amount,
      paidBy: user.uid,
      paidByName: user.displayName,
      splitBetween: selected,
      createdAt: new Date(),
    });

    alert("Expense added!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded-lg"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2 w-full rounded-lg"
        />

        {group && (
          <div>
            <p className="font-medium mb-2">Select members to split with:</p>
            {group.members.map((m: string) => (
              <label key={m} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={m}
                  checked={selected.includes(m)}
                  onChange={(e) => {
                    if (e.target.checked) setSelected([...selected, m]);
                    else setSelected(selected.filter((id) => id !== m));
                  }}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>
        )}

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg">
          Add Expense
        </button>
      </form>
    </div>
  );
}
