"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { calculateBalances } from "@/lib/balance";

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // ✅ add a loading state
  const [error, setError] = useState<string | null>(null); // ✅ handle errors gracefully

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ Prevent fetching if groupId not ready (important in Next.js)
        if (!groupId) return;

        const docRef = doc(db, "groups", groupId as string);
        const groupSnap = await getDoc(docRef);
        if (!groupSnap.exists()) {
          setError("Group not found");
          setLoading(false);
          return;
        }
        setGroup({ id: groupSnap.id, ...groupSnap.data() });

        const expSnap = await getDocs(collection(db, `groups/${groupId}/expenses`));
        setExpenses(expSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Error loading group:", err);
        setError("Failed to load group data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  // ✅ Only calculate balances after expenses are loaded
  const balances = expenses.length ? calculateBalances(expenses) : {};

  if (loading) return <div className="p-6 text-gray-500">Loading group...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!group) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{group.name}</h1>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => router.push(`/groups/${groupId}/add-expense`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add Expense
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/groups/join?groupId=${groupId}`
            );
            alert("Invite link copied to clipboard!");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Invite Members
        </button>
      </div>

      {/* Balances */}
      {Object.keys(balances).length > 0 ? (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Balances</h2>
          <ul>
            {Object.entries(balances).map(([uid, balance]) => (
              <li
                key={uid}
                className={`p-2 rounded mb-2 ${
                  balance > 0
                    ? "bg-green-100 text-green-800"
                    : balance < 0
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span className="font-medium">{uid}</span>:{" "}
                {balance > 0
                  ? `Gets ₹${balance.toFixed(2)}`
                  : balance < 0
                  ? `Owes ₹${Math.abs(balance).toFixed(2)}`
                  : "Settled"}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">No balances yet.</p>
      )}

      {/* Expenses */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet.</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((exp) => (
              <li
                key={exp.id}
                className="bg-gray-100 p-3 rounded shadow-sm flex justify-between"
              >
                <div>
                  <p className="font-medium">{exp.description}</p>
                  <p className="text-sm text-gray-500">
                    Paid by {exp.paidByName} — Split among{" "}
                    {exp.splitBetween?.length || 1} people
                  </p>
                </div>
                <span className="font-semibold text-gray-800">₹{exp.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
