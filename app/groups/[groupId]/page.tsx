"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { calculateBalances, simplifyTransactions } from "@/lib/balance";

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<
    { from: string; to: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🔐 Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // 📦 Load group, members, and expenses
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      const groupRef = doc(db, "groups", groupId as string);
      const snapshot = await getDoc(groupRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setGroup({ id: snapshot.id, ...data });

        // ✅ Fetch members
        const memberDocs = await Promise.all(
          (data.members || []).map(async (uid: string) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) return { uid, ...userSnap.data() };
            return { uid, name: "Unknown User" };
          })
        );
        setMembers(memberDocs);

        // ✅ Fetch expenses
        const expSnap = await getDocs(collection(db, `groups/${groupId}/expenses`));
        const expensesData = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setExpenses(expensesData);

        // ✅ Calculate balances and debts
        const calculated = calculateBalances(expensesData);
        setBalances(calculated);

        const txns = simplifyTransactions(calculated);
        setTransactions(txns);
      }

      setLoading(false);
    };

    fetchGroupData();
  }, [groupId]);

  if (loading) return <div className="p-6 text-gray-500">Loading group...</div>;
  if (!group) return <div className="p-6 text-red-500">Group not found.</div>;
  if (!currentUser) return null;

  const isAdmin = group.admins?.includes(currentUser.uid);

  // 🚪 Leave group
  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, {
      members: arrayRemove(currentUser.uid),
      admins: arrayRemove(currentUser.uid),
    });
    alert("You left the group.");
    router.push("/dashboard");
  };

  // ✏️ Rename group
  const changeGroupName = async () => {
    if (group.adminOnlyNameChange && !isAdmin)
      return alert("Only admins can change group name.");
    const newName = prompt("Enter new group name:", group.name);
    if (!newName || newName === group.name) return;
    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, { name: newName });
    setGroup({ ...group, name: newName });
  };

  // 💰 Helper: Get top 3 people you owe or are owed
  const myBalance = balances[currentUser.uid] || 0;

  const owedList = transactions
    .filter((t) => t.from === currentUser.uid)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const getsList = transactions
    .filter((t) => t.to === currentUser.uid)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // 🎨 UI Rendering
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <div className="space-x-2">
          <Button onClick={changeGroupName} variant="outline">
            Rename
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/groups/${groupId}/members`)}
          >
            Members
          </Button>
          <Button
            onClick={() => router.push(`/groups/${groupId}/add-expense`)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            + Add Expense
          </Button>
          <Button onClick={handleLeaveGroup} variant="destructive">
            Leave Group
          </Button>
        </div>
      </div>

      {/* 💰 Balances Section */}
      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Your Balance</h2>

        {myBalance > 0 && (
          <p className="text-green-600 font-semibold">
            You will receive ₹{myBalance.toFixed(2)} in total.
          </p>
        )}
        {myBalance < 0 && (
          <p className="text-red-600 font-semibold">
            You owe ₹{Math.abs(myBalance).toFixed(2)} in total.
          </p>
        )}
        {myBalance === 0 && <p className="text-gray-600">You are settled up.</p>}

        {/* Show top 3 debts */}
        <div className="mt-3">
          {owedList.length > 0 && (
            <>
              <p className="font-medium text-gray-700 mb-1">You owe (top 3):</p>
              <ul className="space-y-1 text-sm">
                {owedList.map((t, i) => {
                  const person =
                    members.find((m) => m.uid === t.to)?.name || t.to;
                  return (
                    <li key={i}>
                      → {person}: ₹{t.amount.toFixed(2)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {getsList.length > 0 && (
            <>
              <p className="font-medium text-gray-700 mt-3 mb-1">
                People who owe you (top 3):
              </p>
              <ul className="space-y-1 text-sm">
                {getsList.map((t, i) => {
                  const person =
                    members.find((m) => m.uid === t.from)?.name || t.from;
                  return (
                    <li key={i}>
                      ← {person}: ₹{t.amount.toFixed(2)}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Details button */}
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/groups/${groupId}/details`)}
          >
            View Full Details
          </Button>
        </div>
      </div>

      {/* 📜 Expense List */}
      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet.</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((exp) => (
              <li key={exp.id} className="border p-3 rounded bg-gray-50">
                <p className="font-medium">
                  {exp.description} — ₹
                  {exp.amount ? Number(exp.amount).toFixed(2) : "0.00"}
                </p>
                <p className="text-sm text-gray-600">
                  Paid by{" "}
                  <span className="font-semibold">{exp.paidByName}</span> — Split
                  among {exp.splitBetween?.length || 1} people
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
