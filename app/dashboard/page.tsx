"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // ✅ Real-time listener for user's groups
      const q = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );

      const unsubGroups = onSnapshot(
        q,
        (snapshot) => {
          const groupList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(groupList);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching groups:", err);
          setError("Failed to load groups. Please try again.");
          setLoading(false);
        }
      );

      return () => unsubGroups();
    });

    return () => unsubAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="p-6 text-gray-500">Loading groups...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Groups</h1>
        <button
          onClick={() => router.push("/groups/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-gray-500">You’re not in any groups yet. Create or join one!</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleLogout}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
