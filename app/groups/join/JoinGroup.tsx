"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function JoinGroup() {
  const params = useSearchParams();
  const router = useRouter();
  const groupId = params.get("groupId");

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;

      const groupRef = doc(db, "groups", groupId);
      const snapshot = await getDoc(groupRef);
      if (snapshot.exists()) {
        setGroup({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    };
    loadGroup();
  }, [groupId]);

  const handleJoin = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }

    setJoining(true);
    try {
      const groupRef = doc(db, "groups", groupId!);

      // ✅ Add the user UID to the group's member list
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });

      // ✅ (optional) Add group reference to user's document
      await updateDoc(doc(db, "users", user.uid), {
        groups: arrayUnion(groupId),
      });

      alert(`You have joined ${group.name}!`);
      router.push(`/groups/${groupId}`);
    } catch (err) {
      console.error("Error joining group:", err);
      alert("Failed to join group. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading group info...</p>;
  if (!group) return <p className="p-6 text-center">Group not found.</p>;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-semibold mb-4">
        Join <span className="text-green-600">{group.name}</span>?
      </h1>

      <p className="mb-6 text-gray-600">
        You’ll be added as a member of this group.
      </p>

      <button
        onClick={handleJoin}
        disabled={joining}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
      >
        {joining ? "Joining..." : "Join Group"}
      </button>
    </div>
  );
}
