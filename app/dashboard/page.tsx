"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const q = query(collection(db, "groups"), where("members", "array-contains", user.uid));
        const snapshot = await getDocs(q);
        setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Groups</h1>
        <button
          onClick={() => router.push("/groups/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-gray-500">No groups yet. Create one!</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => signOut(auth)}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}
